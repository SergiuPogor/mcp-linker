import { DxtCard } from "@/components/dxt";
import { DxtManifestSchema } from "@/schemas";
import { useEffect, useState } from "react";
import { z } from "zod";
import { invoke } from "@tauri-apps/api/core";

// Utility to normalize manifest data
function normalizeManifest(obj: any, index: number) {
  // Clean up null values
  for (const key in obj) {
    if (obj[key] === null) obj[key] = undefined;
  }
  
  // Fix common data issues
  const cleaned = {
    id: index,
    ...obj,
    // Ensure required fields have default values
    version: obj.version || obj.dxt_version || obj.server?.version || "1.0.0", // Use various fallbacks
    tools_generated: obj.tools_generated ?? false,
    prompts_generated: obj.prompts_generated ?? false,
    
    // Fix invalid URLs
    homepage: isValidUrl(obj.homepage) ? obj.homepage : undefined,
    documentation: isValidUrl(obj.documentation) ? obj.documentation : undefined,
    support: isValidUrl(obj.support) ? obj.support : undefined,
    
    // Clean up user_config if it exists
    user_config: obj.user_config ? cleanUserConfig(obj.user_config) : undefined,
  };
  
  // Remove unrecognized top-level fields that might cause issues
  const allowedFields = new Set([
    'id', 'name', 'display_name', 'description', 'author', 'homepage', 'icon', 
    'dxt_version', 'version', 'server', 'tools', 'prompts', 'resources', 'user_config',
    'tools_generated', 'prompts_generated', 'compatibility', 'source', 'documentation', 'support',
    'long_description', 'repository', 'screenshots', 'keywords', 'license', '$schema'
  ]);
  
  const filtered: any = {};
  for (const [key, value] of Object.entries(cleaned)) {
    if (allowedFields.has(key)) {
      filtered[key] = value;
    }
  }
  
  return filtered;
}

// Helper function to validate URLs
function isValidUrl(url: any): boolean {
  if (typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Helper function to clean user_config
function cleanUserConfig(userConfig: any): any {
  if (typeof userConfig !== 'object' || !userConfig) return {};
  
  const cleaned: any = {};
  for (const [key, value] of Object.entries(userConfig)) {
    if (typeof value === 'object' && value !== null) {
      // Clean up nested config objects, ensuring required fields
      const cleanedValue: any = {
        type: (value as any).type || "string", // Default type
        title: (value as any).title || key, // Use key as title if not provided
        description: (value as any).description || `Configuration for ${key}`, // Default description
        default: (value as any).default,
        required: (value as any).required,
        multiple: (value as any).multiple,
        sensitive: (value as any).sensitive,
        min: (value as any).min,
        max: (value as any).max,
      };
      
      // Remove undefined values
      Object.keys(cleanedValue).forEach(k => {
        if (cleanedValue[k] === undefined) {
          delete cleanedValue[k];
        }
      });
      
      cleaned[key] = cleanedValue;
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

export default function DxtPage() {
  const [dxtList, setDxtList] = useState<z.infer<typeof DxtManifestSchema>[]>(
    [],
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Load manifests from file system
  useEffect(() => {
    initializeManifests();
  }, []);

  async function initializeManifests() {
    setLoading(true);
    try {
      // Check if manifests exist locally
      const manifestsExist = await invoke<boolean>("check_manifests_exist");
      
      if (!manifestsExist) {
        console.log("No manifests found locally, downloading...");
        // Download and extract manifests if they don't exist
        await invoke("download_and_extract_manifests");
      }
      
      // Load manifests
      await loadManifests();
    } catch (err) {
      console.error("Failed to initialize manifests:", err);
      setDxtList([]);
      setLoading(false);
    }
  }

  async function loadManifests() {
    try {
      const result = await invoke<any[]>("load_manifests");
      const normalized = result.map((manifest, index) => normalizeManifest(manifest, index));
      
      // Parse each manifest individually and filter out invalid ones
      const validManifests: any[] = [];
      normalized.forEach((manifest, index) => {
        try {
          const parsed = DxtManifestSchema.parse(manifest);
          validManifests.push(parsed);
        } catch (parseError) {
          console.warn(`Skipping invalid manifest at index ${index}:`, parseError, manifest);
        }
      });
      
      console.log(`Successfully loaded ${validManifests.length} out of ${normalized.length} manifests`);
      
      if (validManifests.length === 0 && normalized.length > 0) {
        console.error("All manifests failed validation. This might indicate a schema mismatch.");
        // Try to show at least the raw data for debugging
        console.log("Sample raw manifest:", normalized[0]);
      }
      
      setDxtList(validManifests);
      
    } catch (err) {
      console.error("Failed to load manifests:", err);
      setDxtList([]);
    } finally {
      setLoading(false);
    }
  }

  // Search function - filter locally
  async function handleSearch() {
    if (search.trim() === "") {
      await loadManifests();
    } else {
      try {
        const result = await invoke<any[]>("load_manifests");
        const filtered = result.filter(manifest => 
          manifest.name?.toLowerCase().includes(search.toLowerCase()) ||
          manifest.display_name?.toLowerCase().includes(search.toLowerCase()) ||
          manifest.description?.toLowerCase().includes(search.toLowerCase())
        );
        const normalized = filtered.map((manifest, index) => normalizeManifest(manifest, index));
        
        // Parse each manifest individually and filter out invalid ones
        const validManifests: any[] = [];
        normalized.forEach((manifest, index) => {
          try {
            const parsed = DxtManifestSchema.parse(manifest);
            validManifests.push(parsed);
          } catch (parseError) {
            console.warn(`Skipping invalid manifest in search at index ${index}:`, parseError, manifest);
          }
        });
        
        setDxtList(validManifests);
      } catch (err) {
        console.error("Failed to search manifests:", err);
      }
    }
  }

  return (
    <div className="p-2">
      {/* loading indicator */}
      {loading && (
        <div className="mb-4 text-center">
          <div className="text-sm text-gray-500">Loading manifests...</div>
        </div>
      )}
      {/* action */}
      <div className="flex gap-2 mb-4">
        <input
          className="border px-2 py-1 rounded"
          placeholder="Search by name or keyword"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          className="px-3 py-1 bg-green-500 text-white rounded"
          onClick={handleSearch}
        >
          Search
        </button>
        <button
          className="px-3 py-1 bg-gray-400 text-white rounded"
          onClick={async () => {
            setSearch("");
            await loadManifests();
          }}
        >
          Reset
        </button>
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded"
          onClick={async () => {
            setLoading(true);
            try {
              await invoke("download_and_extract_manifests");
              await loadManifests();
            } catch (err) {
              console.error("Failed to refresh manifests:", err);
              setLoading(false);
            }
          }}
        >
          Refresh
        </button>
      </div>
      {/* Grid layout for DXT cards */}
      <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {dxtList.map((dxt, idx) => (
          <DxtCard key={idx} dxt={dxt} />
        ))}
      </div>
    </div>
  );
}
