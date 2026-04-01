import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE = "https://api.openligadb.de";

// ---------------------------------------------------------------------------
// Formatting helpers (kept from original source)
// ---------------------------------------------------------------------------

function formatMatch(m: Record<string, unknown>): string {
  const team1 = m.team1 as Record<string, unknown> | undefined;
  const team2 = m.team2 as Record<string, unknown> | undefined;
  const results = m.matchResults as Array<Record<string, unknown>> | undefined;

  const home = (team1?.teamName as string) ?? "TBD";
  const away = (team2?.teamName as string) ?? "TBD";

  let score = "vs";
  if (results && results.length > 0) {
    const final = results.reduce((a, b) =>
      ((a.resultOrderID as number) ?? 0) > ((b.resultOrderID as number) ?? 0)
        ? a
        : b,
    );
    score = `${final.pointsTeam1} : ${final.pointsTeam2}`;
  }

  const date = m.matchDateTimeUTC
    ? new Date(m.matchDateTimeUTC as string).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Europe/Berlin",
      })
    : "";
  const matchday = m.group
    ? `Matchday ${(m.group as Record<string, unknown>).groupOrderID ?? ""}`
    : "";
  const finished = m.matchIsFinished ? " (FT)" : "";

  return `${matchday ? matchday + " | " : ""}${date}\n  ${home} ${score} ${away}${finished}`;
}

function formatMatches(data: unknown): string {
  const matches = data as Array<Record<string, unknown>>;
  if (!Array.isArray(matches) || matches.length === 0) {
    return "No matches found.";
  }
  return matches.map(formatMatch).join("\n\n");
}

function formatTable(data: unknown): string {
  const rows = data as Array<Record<string, unknown>>;
  if (!Array.isArray(rows) || rows.length === 0) {
    return "No standings data found.";
  }
  const header = `${"#".padStart(3)}  ${"Team".padEnd(28)} MP   W   D   L   GF  GA  GD  Pts`;
  const separator = "-".repeat(header.length);
  const lines = rows.map((r, i) => {
    const pos = String(i + 1).padStart(3);
    const name = ((r.teamName as string | null) ?? "").padEnd(28);
    const mp = String(r.matches ?? 0).padStart(2);
    const w = String(r.won ?? 0).padStart(3);
    const d = String(r.draw ?? 0).padStart(3);
    const l = String(r.lost ?? 0).padStart(3);
    const gf = String(r.goals ?? 0).padStart(4);
    const ga = String(r.opponentGoals ?? 0).padStart(4);
    const gd = String(r.goalDiff ?? 0).padStart(4);
    const pts = String(r.points ?? 0).padStart(4);
    return `${pos}  ${name} ${mp} ${w} ${d} ${l} ${gf} ${ga} ${gd} ${pts}`;
  });
  return [header, separator, ...lines].join("\n");
}

function formatScorers(data: unknown): string {
  const scorers = data as Array<Record<string, unknown>>;
  if (!Array.isArray(scorers) || scorers.length === 0) {
    return "No scorer data found.";
  }
  return scorers
    .map((s, i) => {
      const name = `${s.playerName ?? "Unknown"}`;
      const team = (s.teamName as string | null) ?? "";
      const goals = s.goalCount ?? 0;
      return `${String(i + 1).padStart(3)}. ${name} (${team}) — ${goals} goals`;
    })
    .join("\n");
}

function formatTeams(data: unknown): string {
  const teams = data as Array<Record<string, unknown>>;
  if (!Array.isArray(teams) || teams.length === 0) {
    return "No teams found.";
  }
  return teams
    .map((t) => {
      const id = t.teamId ?? "";
      const name = t.teamName ?? "";
      const shortName = t.shortName ?? "";
      return `[${id}] ${name}${shortName ? ` (${shortName})` : ""}`;
    })
    .join("\n");
}

function formatLeagues(data: unknown): string {
  const leagues = data as Array<Record<string, unknown>>;
  if (!Array.isArray(leagues) || leagues.length === 0) {
    return "No leagues found.";
  }
  return leagues
    .map((l) => {
      const shortcut = l.leagueShortcut ?? "";
      const name = l.leagueName ?? "";
      const season = l.leagueSeason ?? "";
      return `[${shortcut}] ${name} (${season})`;
    })
    .join("\n");
}

function formatSingleMatch(data: unknown): string {
  const m = data as Record<string, unknown>;
  if (!m || typeof m !== "object") return "No match data found.";

  const team1 = m.team1 as Record<string, unknown> | undefined;
  const team2 = m.team2 as Record<string, unknown> | undefined;
  const results = m.matchResults as Array<Record<string, unknown>> | undefined;
  const goals = m.goals as Array<Record<string, unknown>> | undefined;

  const home = (team1?.teamName as string) ?? "TBD";
  const away = (team2?.teamName as string) ?? "TBD";

  let score = "vs";
  let halfTime = "";
  if (results && results.length > 0) {
    const sorted = [...results].sort(
      (a, b) =>
        ((a.resultOrderID as number) ?? 0) - ((b.resultOrderID as number) ?? 0),
    );
    if (sorted.length >= 1) {
      halfTime = `Half-time: ${sorted[0].pointsTeam1} : ${sorted[0].pointsTeam2}`;
    }
    const final = sorted[sorted.length - 1];
    score = `${final.pointsTeam1} : ${final.pointsTeam2}`;
  }

  const date = m.matchDateTimeUTC
    ? new Date(m.matchDateTimeUTC as string).toLocaleString("en-GB", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "Europe/Berlin",
      })
    : "";
  const finished = m.matchIsFinished ? "Full-time" : "Scheduled / In progress";
  const location =
    (m.location as Record<string, unknown>)?.locationStadium ?? "";

  let goalsStr = "";
  if (goals && goals.length > 0) {
    goalsStr =
      "\n\nGoals:\n" +
      goals
        .map((g) => {
          const minute = g.matchMinute ?? "?";
          const scorer = g.goalGetterName ?? "Unknown";
          const s1 = g.scoreTeam1 ?? "";
          const s2 = g.scoreTeam2 ?? "";
          const penalty = g.isPenalty ? " (P)" : "";
          const ownGoal = g.isOwnGoal ? " (OG)" : "";
          return `  ${minute}' ${scorer} (${s1}:${s2})${penalty}${ownGoal}`;
        })
        .join("\n");
  }

  return [
    `${home} ${score} ${away}`,
    finished,
    date,
    location ? `Stadium: ${location}` : "",
    halfTime,
    goalsStr,
  ]
    .filter(Boolean)
    .join("\n");
}

function textResult(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

export function register(server: McpServer): void {
  // 1. get_matches_by_league_season
  server.tool(
    "openliga_get_matches_by_league_season",
    "Get all matches for a league and season. Known league shortcuts: bl1 (1. Bundesliga), bl2 (2. Bundesliga), bl3 (3. Liga), dfb (DFB-Pokal), ucl (Champions League).",
    {
      league_shortcut: z.string().describe("League shortcut, e.g. 'bl1'"),
      season: z.string().describe("Season year, e.g. '2023' for 2023/24"),
    },
    async ({ league_shortcut, season }) => {
      try {
        const data = await fetchJson(`${BASE}/getmatchdata/${league_shortcut}/${season}`);
        return textResult(formatMatches(data));
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. get_matches_by_matchday
  server.tool(
    "openliga_get_matches_by_matchday",
    "Get matches for a specific matchday in a league and season.",
    {
      league_shortcut: z.string().describe("League shortcut, e.g. 'bl1'"),
      season: z.string().describe("Season year, e.g. '2023'"),
      matchday: z.number().int().positive().describe("Matchday number, e.g. 15"),
    },
    async ({ league_shortcut, season, matchday }) => {
      try {
        const data = await fetchJson(
          `${BASE}/getmatchdata/${league_shortcut}/${season}/${matchday}`,
        );
        return textResult(formatMatches(data));
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. get_current_matchday
  server.tool(
    "openliga_get_current_matchday",
    "Get the matches for the current matchday of a league.",
    {
      league_shortcut: z.string().describe("League shortcut, e.g. 'bl1'"),
    },
    async ({ league_shortcut }) => {
      try {
        const data = await fetchJson(`${BASE}/getmatchdata/${league_shortcut}`);
        return textResult(formatMatches(data));
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. get_match_data
  server.tool(
    "openliga_get_match_data",
    "Get detailed data for a specific match by its ID, including goals, results, and location.",
    {
      match_id: z.number().int().positive().describe("The numeric match ID"),
    },
    async ({ match_id }) => {
      try {
        const data = await fetchJson(`${BASE}/getmatchdata/${match_id}`);
        return textResult(formatSingleMatch(data));
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. get_table
  server.tool(
    "openliga_get_table",
    "Get the league table / standings for a league and season.",
    {
      league_shortcut: z.string().describe("League shortcut, e.g. 'bl1'"),
      season: z.string().describe("Season year, e.g. '2023'"),
    },
    async ({ league_shortcut, season }) => {
      try {
        const data = await fetchJson(`${BASE}/getbltable/${league_shortcut}/${season}`);
        return textResult(formatTable(data));
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. get_top_scorers
  server.tool(
    "openliga_get_top_scorers",
    "Get the top goal scorers for a league and season.",
    {
      league_shortcut: z.string().describe("League shortcut, e.g. 'bl1'"),
      season: z.string().describe("Season year, e.g. '2023'"),
    },
    async ({ league_shortcut, season }) => {
      try {
        const data = await fetchJson(`${BASE}/getgoalgetters/${league_shortcut}/${season}`);
        return textResult(formatScorers(data));
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. get_teams
  server.tool(
    "openliga_get_teams",
    "Get the list of teams participating in a league for a given season.",
    {
      league_shortcut: z.string().describe("League shortcut, e.g. 'bl1'"),
      season: z.string().describe("Season year, e.g. '2023'"),
    },
    async ({ league_shortcut, season }) => {
      try {
        const data = await fetchJson(`${BASE}/getavailableteams/${league_shortcut}/${season}`);
        return textResult(formatTeams(data));
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 8. get_available_leagues
  server.tool(
    "openliga_get_available_leagues",
    "List all available leagues and seasons in OpenLigaDB.",
    {},
    async () => {
      try {
        const data = await fetchJson(`${BASE}/getavailableleagues`);
        return textResult(formatLeagues(data));
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 9. get_next_match_by_team
  server.tool(
    "openliga_get_next_match_by_team",
    "Get the next upcoming match for a team. Use get_teams to find team IDs.",
    {
      team_id: z.number().int().positive().describe("The numeric team ID"),
    },
    async ({ team_id }) => {
      try {
        const data = await fetchJson(`${BASE}/getnextmatchbyleagueteam/${team_id}`);
        return textResult(formatSingleMatch(data));
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 10. get_last_match_by_team
  server.tool(
    "openliga_get_last_match_by_team",
    "Get the last completed match for a team. Use get_teams to find team IDs.",
    {
      team_id: z.number().int().positive().describe("The numeric team ID"),
    },
    async ({ team_id }) => {
      try {
        const data = await fetchJson(`${BASE}/getlastmatchbyleagueteam/${team_id}`);
        return textResult(formatSingleMatch(data));
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
