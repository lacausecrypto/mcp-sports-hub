import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Golf Course API provider — 6 tools
// Base: https://api.golfcourseapi.com/v1/
// Auth: None (public API)
// ---------------------------------------------------------------------------

const BASE = "https://api.golfcourseapi.com/v1";

export function register(server: McpServer): void {
  // 1. golfcourse_search_courses
  server.tool(
    "golfcourse_search_courses",
    "Search for golf courses by name with optional country, state, and limit filters.",
    {
      search: z.string().describe("Search query for course name"),
      country: z.string().optional().describe("Filter by country code (e.g. US, GB)"),
      state: z.string().optional().describe("Filter by state/province"),
      limit: z.number().optional().describe("Max number of results to return"),
    },
    async ({ search, country, state, limit }) => {
      try {
        const url = buildUrl(`${BASE}/courses/search`, { search, country, state, limit });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. golfcourse_get_course
  server.tool(
    "golfcourse_get_course",
    "Get detailed information about a specific golf course.",
    {
      course_id: z.string().describe("Course identifier"),
    },
    async ({ course_id }) => {
      try {
        const url = `${BASE}/courses/${encodeURIComponent(course_id)}`;
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. golfcourse_get_courses_nearby
  server.tool(
    "golfcourse_get_courses_nearby",
    "Find golf courses near a geographic location.",
    {
      lat: z.number().describe("Latitude"),
      lng: z.number().describe("Longitude"),
      radius: z.number().optional().describe("Search radius in miles"),
    },
    async ({ lat, lng, radius }) => {
      try {
        const url = buildUrl(`${BASE}/courses/nearby`, { lat, lng, radius });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. golfcourse_get_countries
  server.tool(
    "golfcourse_get_countries",
    "List all countries that have golf courses in the database.",
    {},
    async () => {
      try {
        const data = await fetchJson(`${BASE}/countries`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. golfcourse_get_states
  server.tool(
    "golfcourse_get_states",
    "List states/provinces for a given country.",
    {
      country_code: z.string().describe("Country code (e.g. US, GB, CA)"),
    },
    async ({ country_code }) => {
      try {
        const url = `${BASE}/countries/${encodeURIComponent(country_code)}/states`;
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. golfcourse_get_course_reviews
  server.tool(
    "golfcourse_get_course_reviews",
    "Get reviews for a specific golf course.",
    {
      course_id: z.string().describe("Course identifier"),
    },
    async ({ course_id }) => {
      try {
        const url = `${BASE}/courses/${encodeURIComponent(course_id)}/reviews`;
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
