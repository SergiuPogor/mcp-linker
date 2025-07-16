import { DxtManifestSchema } from "@/schemas";
import { getDb } from ".";

// Insert manifest with all fields from DxtManifestSchema
export async function insertManifest(manifestObj: any) {
  try {
    const parsed = DxtManifestSchema.parse(manifestObj);
    const db = await getDb();
    await db.execute(
      `INSERT INTO dxt_manifests
        (name, display_name, version, dxt_version, "$schema", description, long_description, author, repository, homepage, documentation, support, icon, screenshots, server, tools, tools_generated, prompts, prompts_generated, keywords, license, compatibility, user_config)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parsed.name,
        parsed.display_name ?? null,
        parsed.version,
        parsed.dxt_version,
        parsed.$schema ?? null,
        parsed.description ?? null,
        parsed.long_description ?? null,
        parsed.author ? JSON.stringify(parsed.author) : null,
        parsed.repository ? JSON.stringify(parsed.repository) : null,
        parsed.homepage ?? null,
        parsed.documentation ?? null,
        parsed.support ?? null,
        parsed.icon ?? null,
        parsed.screenshots ? JSON.stringify(parsed.screenshots) : null,
        parsed.server ? JSON.stringify(parsed.server) : null,
        parsed.tools ? JSON.stringify(parsed.tools) : null,
        parsed.tools_generated === undefined
          ? null
          : parsed.tools_generated
            ? true
            : false,
        parsed.prompts ? JSON.stringify(parsed.prompts) : null,
        parsed.prompts_generated === undefined
          ? null
          : parsed.prompts_generated
            ? true
            : false,
        parsed.keywords ? JSON.stringify(parsed.keywords) : null,
        parsed.license ?? null,
        parsed.compatibility ? JSON.stringify(parsed.compatibility) : null,
        parsed.user_config ? JSON.stringify(parsed.user_config) : null,
      ],
    );
  } catch (err) {
    console.error("Insert manifest failed", err);
  }
}
