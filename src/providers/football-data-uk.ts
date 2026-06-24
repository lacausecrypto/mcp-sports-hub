import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchText, pathSegment, safe, toolResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Football-Data.co.uk — 2 tools
// Base: https://www.football-data.co.uk
// Auth: none. Free CSV archive of historical results + pre-match AND closing
//   betting odds (10+ bookmakers), seasons 2000/01 to present, 25+ leagues.
//   Unique value vs the live odds providers: HISTORICAL odds for backtesting.
// URL pattern: /mmz4281/{season}/{league}.csv  (season = 4 digits, e.g. 2425).
// Column meanings: https://www.football-data.co.uk/notes.txt
// ---------------------------------------------------------------------------

const BASE = "https://www.football-data.co.uk";

// Main-division league codes (see notes.txt for the full list).
const LEAGUES: Record<string, string> = {
  E0: "England — Premier League", E1: "England — Championship", E2: "England — League One",
  E3: "England — League Two", EC: "England — National League",
  SC0: "Scotland — Premiership", SC1: "Scotland — Championship", SC2: "Scotland — League One", SC3: "Scotland — League Two",
  D1: "Germany — Bundesliga", D2: "Germany — 2. Bundesliga",
  I1: "Italy — Serie A", I2: "Italy — Serie B",
  SP1: "Spain — La Liga", SP2: "Spain — La Liga 2",
  F1: "France — Ligue 1", F2: "France — Ligue 2",
  N1: "Netherlands — Eredivisie", B1: "Belgium — Pro League", P1: "Portugal — Primeira Liga",
  T1: "Turkey — Süper Lig", G1: "Greece — Super League",
};

// Minimal RFC-4180-ish CSV parser (handles quoted fields and CRLF).
function parseCsv(text: string): Array<Record<string, string>> {
  const rows: string[][] = [];
  let field = "", row: string[] = [], inQuotes = false;
  const t = text.replace(/^﻿/, "");
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (inQuotes) {
      if (c === '"') { if (t[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field.length > 0 || row.length > 1) { row.push(field); rows.push(row); }
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  const out: Array<Record<string, string>> = [];
  for (let r = 1; r < rows.length; r++) {
    const vals = rows[r];
    if (vals.every((v) => v.trim() === "")) continue;
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { if (h && vals[i] !== undefined && vals[i] !== "") obj[h] = vals[i]; });
    if (Object.keys(obj).length) out.push(obj);
  }
  return out;
}

export function register(server: McpServer): void {
  // 1. list leagues — static reference of available league codes
  server.tool(
    "footballdata_uk_list_leagues",
    "List the football-data.co.uk league codes usable with footballdata_uk_get_matches, and how to form the season code.",
    {},
    safe(async () =>
      toolResult({
        leagues: LEAGUES,
        season_format: '4 digits "SSEE" = start+end year, e.g. "2425" for 2024-25, "0001" for 2000-01. Data goes back to 2000-01.',
        notes: "Each row is one match with full-time/half-time goals & result, match stats, and pre-match + closing odds from 10+ bookmakers (B365, PS/Pinnacle, WH, etc.), plus over/under 2.5 and Asian handicap. Column key: https://www.football-data.co.uk/notes.txt",
      }),
    ),
  );

  // 2. get matches — historical results + odds for a league/season
  server.tool(
    "footballdata_uk_get_matches",
    "Get historical matches (results + bookmaker odds) for a league and season from football-data.co.uk. Returns the most recent matches first; filter by team and cap with limit.",
    {
      league: z.string().min(1).max(4).describe('League code, e.g. "E0" (Premier League). Use footballdata_uk_list_leagues.'),
      season: z.string().regex(/^\d{4}$/).describe('Season code, 4 digits, e.g. "2425" for 2024-25'),
      team: z.string().optional().describe("Filter to matches involving this team (case-insensitive substring)"),
      limit: z.number().int().min(1).max(400).optional().describe("Max matches to return (default 30, most recent first)"),
    },
    safe(async ({ league, season, team, limit }) => {
      const code = league.toUpperCase();
      const csv = await fetchText(
        `${BASE}/mmz4281/${pathSegment(season)}/${pathSegment(code)}.csv`,
        { cacheTtl: 3600 }, // historical data — cache an hour
      );
      let rows = parseCsv(csv);
      if (team) {
        const q = team.toLowerCase();
        rows = rows.filter((r) => (r.HomeTeam || "").toLowerCase().includes(q) || (r.AwayTeam || "").toLowerCase().includes(q));
      }
      const max = limit ?? 30;
      const recent = rows.slice(-max).reverse();
      return toolResult({
        league: code,
        league_name: LEAGUES[code] ?? code,
        season,
        total_matches: rows.length,
        returned: recent.length,
        matches: recent,
      });
    }),
  );
}
