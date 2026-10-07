const workspaceId = "00000000-0000-4000-8000-000000000001";
const websiteId = "00000000-0000-4000-8000-000000000002";
const now = Date.now();

const keywordSeeds = [
  ["project management software", [18, 15, 13, 11, 9, 7]],
  ["team collaboration workspace", [5, 6, 8, 9, 12, 14]],
  ["best productivity tool", [48, 44, 41, 39, 38, 37]],
  ["project documentation platform", [3, 3, 2, 3, 3, 3]],
  ["remote team knowledge base", [22, 27, null, 38, null, null]],
] as const;

export function buildDemoWorkspaceData() {
  const websites = [
    {
      id: websiteId,
      workspace_id: workspaceId,
      domain: "notion.so",
      created_at: new Date(now - 90 * 86400000).toISOString(),
    },
  ];
  const keywords = keywordSeeds.map(([keyword, positions], index) => ({
    id: `00000000-0000-4000-8000-00000000010${index}`,
    workspace_id: workspaceId,
    website_id: websiteId,
    keyword,
    pages_to_check: Math.max(
      3,
      Math.ceil(
        Math.max(...positions.filter((position): position is number => position != null)) / 10,
      ),
    ),
    market: "US",
    notes: null,
    created_at: new Date(now - 90 * 86400000).toISOString(),
  }));
  const runs = keywordSeeds.flatMap(([, positions], keywordIndex) =>
    positions.map((position, runIndex) => {
      const previous = runIndex ? (positions[runIndex - 1] ?? null) : null;
      return {
        id: `00000000-0000-4000-8000-${String(keywordIndex * 10 + runIndex).padStart(12, "0")}`,
        workspace_id: workspaceId,
        client_run_id: `demo-${keywordIndex}-${runIndex}`,
        keyword_id: keywords[keywordIndex]!.id,
        website_id: websiteId,
        position,
        found: position != null,
        previous_position: previous,
        position_change: position != null && previous != null ? previous - position : null,
        ranking_url: position != null ? "https://www.notion.so/product/ai" : null,
        result_title: position != null ? "Notion AI — Your connected workspace for work" : null,
        result_snippet:
          position != null
            ? "Write, plan, organize, and turn ideas into action with one connected AI workspace."
            : null,
        result_domain: position != null ? "notion.so" : null,
        result_page_number: position != null ? Math.ceil(position / 10) : null,
        result_position_on_page: position != null ? ((position - 1) % 10) + 1 : null,
        pages_checked: keywords[keywordIndex]!.pages_to_check,
        search_engine: "google",
        market: "US",
        device_id: null,
        checked_at: new Date(
          now - (5 - runIndex) * 14 * 86400000 - keywordIndex * 120000,
        ).toISOString(),
        synced_at: new Date(
          now - (5 - runIndex) * 14 * 86400000 - keywordIndex * 120000 + 4000,
        ).toISOString(),
      };
    }),
  );
  return {
    workspace: {
      id: workspaceId,
      name: "Demo workspace",
      owner_id: "demo-user",
      created_at: new Date(now - 90 * 86400000).toISOString(),
    },
    websites,
    keywords,
    runs,
    devices: [],
  };
}
