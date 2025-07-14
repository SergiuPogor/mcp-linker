// DXT manifest DB logic extracted from DxtPage
// All code comments are in English as per user rule

import Database from "@tauri-apps/plugin-sql";

// Share db connect
export async function getDb() {
  return await Database.load("sqlite:manifest.db");
}

// Ensure table exists for DXT manifests
export async function initTable() {
  const db = await getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS dxt_manifests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      display_name TEXT,
      version TEXT NOT NULL,
      dxt_version TEXT NOT NULL,
      "$schema" TEXT,
      description TEXT,
      long_description TEXT,
      author TEXT,
      repository TEXT,
      homepage TEXT,
      documentation TEXT,
      support TEXT,
      icon TEXT,
      screenshots TEXT,
      server TEXT,
      tools TEXT,
      tools_generated INTEGER,
      prompts TEXT,
      prompts_generated INTEGER,
      keywords TEXT,
      license TEXT,
      compatibility TEXT,
      user_config TEXT
    );
  `);
}

// Helper to parse JSON fields in manifest row
function parseManifestRow(row: any) {
  if (!row) return row;
  const jsonFields = [
    "author",
    "repository",
    "screenshots",
    "server",
    "tools",
    "prompts",
    "keywords",
    "compatibility",
    "user_config",
  ];
  for (const field of jsonFields) {
    if (row[field] && typeof row[field] === "string") {
      try {
        row[field] = JSON.parse(row[field]);
      } catch (e) {
        // If parsing fails, leave as string
      }
    }
  }
  // Convert tools_generated and prompts_generated to boolean
  for (const boolField of ["tools_generated", "prompts_generated"]) {
    if (row[boolField] !== undefined && row[boolField] !== null) {
      if (typeof row[boolField] === "string") {
        row[boolField] =
          row[boolField] === "true" ||
          row[boolField] === "1";
      } else {
        row[boolField] = Boolean(row[boolField]);
      }
    }
  }
  return row;
}
// Search manifests by keyword
export async function searchManifests(keyword: string) {
  try {
    const db = await getDb();
    const rows = (await db.select(
      `SELECT * FROM dxt_manifests
       WHERE name LIKE ? OR keywords LIKE ? OR display_name LIKE ? OR description LIKE ?`,
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`],
    )) as any[];
    // Map rows to parse JSON fields
    return rows.map(parseManifestRow);
  } catch (err) {
    console.error("Search failed", err);
    return [];
  }
}

// Get all manifests
export async function getAllManifests() {
  try {
    const db = await getDb();
    const rows = (await db.select("SELECT * FROM dxt_manifests")) as any[];
    // Map rows to parse JSON fields
    return rows.map(parseManifestRow);
  } catch (err) {
    console.error("Get all manifests failed", err);
    return [];
  }
}
