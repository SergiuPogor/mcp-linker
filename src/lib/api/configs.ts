import supabase from "@/utils/supabase";

export async function fetchServerConfig(server_id: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("server_configs")
    .select("config_items")
    .eq("server_id", server_id)
    .single();

  if (error || !data) return [];

  const items = data.config_items;
  return Array.isArray(items) ? items : [];
}
