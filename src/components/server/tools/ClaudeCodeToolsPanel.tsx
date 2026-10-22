import { Button } from "@/components/ui/button";
import { requirePro } from "@/stores/license";
import { invoke } from "@tauri-apps/api/core";
import { Loader2, RefreshCw } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

interface ClaudeToolsResponse {
  name: string;
  status: "connected" | "pending" | "failed" | "needs-auth" | "disabled";
  tools: { name: string; description?: string; annotations?: { readOnly?: boolean; destructive?: boolean; openWorld?: boolean } }[];
}

export function ClaudeCodeToolsPanel({ serverName, workingDir, saveRevision }: { serverName: string; workingDir?: string | null; saveRevision: number }) {
  const [data, setData] = useState<ClaudeToolsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [disabled, setDisabled] = useState<string[]>([]);
  const [policyLoaded, setPolicyLoaded] = useState(false);
  const [policyDirty, setPolicyDirty] = useState(false);
  const [policyBusy, setPolicyBusy] = useState(false);
  const [policyMessage, setPolicyMessage] = useState<string | null>(null);
  const generation = useRef(0);
  const busy = useRef(false);
  const id = useId();
  useEffect(() => {
    generation.current += 1; busy.current = false;
    setData(null); setError(null); setLoading(false); setSearch("");
    setDisabled([]); setPolicyLoaded(false); setPolicyDirty(false); setPolicyBusy(false); setPolicyMessage(null);
    const current = generation.current;
    if (workingDir && serverName) {
      invoke<{ disabledTools: string[] }>("claude_get_tool_policy", { serverName, workingDir }).then(policy => {
        if (generation.current === current) { setDisabled(policy.disabledTools); setPolicyLoaded(true); }
      }).catch(error => { if (generation.current === current) setPolicyMessage(error instanceof Error ? error.message : String(error)); });
    }
    return () => { generation.current += 1; };
  }, [serverName, workingDir, saveRevision]);
  const toggleTool = (name: string, allow: boolean) => {
    setDisabled(list => allow ? list.filter(tool => tool !== name) : [...new Set([...list, name])]);
    setPolicyDirty(true); setPolicyMessage(null);
  };
  const savePolicy = async () => {
    if (!workingDir || policyBusy || !requirePro("toolPolicy")) return;
    const current = generation.current;
    setPolicyBusy(true); setPolicyMessage(null);
    try {
      const saved = await invoke<{ disabledTools: string[] }>("claude_set_tool_policy", { serverName, workingDir, disabledTools: disabled });
      if (generation.current !== current) return;
      setDisabled(saved.disabledTools); setPolicyDirty(false); setPolicyMessage("Tool access saved. Restart the Claude Code session to apply it.");
    } catch (error) { if (generation.current === current) setPolicyMessage(error instanceof Error ? error.message : String(error)); }
    finally { if (generation.current === current) setPolicyBusy(false); }
  };
  const load = async () => {
    if (!workingDir || !serverName || busy.current) return;
    busy.current = true; setLoading(true); setError(null); setData(null);
    const current = generation.current;
    try {
      const response = await invoke<ClaudeToolsResponse>("claude_mcp_tools", { serverName, workingDir });
      if (generation.current === current) setData(response);
    } catch (error) {
      if (generation.current === current) setError(error instanceof Error ? error.message : String(error));
    } finally {
      if (generation.current === current) { busy.current = false; setLoading(false); }
    }
  };
  const tools = data?.tools.filter(tool => `${tool.name} ${tool.description ?? ""}`.toLowerCase().includes(search.toLowerCase())) ?? [];
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div><h3 className="text-sm font-semibold">Tools in Claude Code</h3><p className="mt-1 text-xs text-muted-foreground">{data ? `${data.status} · ${data.tools.length} tools` : "View the tools available through Claude Code."}</p></div>
      <Button size="sm" onClick={load} disabled={loading || !workingDir || !serverName}>{loading ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}{loading ? "Reading tools..." : data ? "Refresh tools" : "View tools"}</Button>
    </div>
    <p className="text-xs text-muted-foreground">Uses the saved server configuration in the selected project. Claude Code handles authentication. No prompt or tool call is sent.</p>
    {!workingDir && <p className="text-sm text-muted-foreground">Select a Claude Code project first.</p>}
    {error && <p role="alert" className="rounded-md border border-destructive/30 p-3 text-sm text-destructive">{error}</p>}
    {data?.status === "needs-auth" && <p role="status" className="text-sm">Claude Code requires authentication for this server. Open /mcp in Claude Code, sign in, then refresh tools.</p>}
    {data?.status === "failed" && <p role="status" className="text-sm">Claude Code could not connect. Check this server in /mcp, then refresh tools.</p>}
    {data?.status === "disabled" && <p className="text-sm text-muted-foreground">This server is disabled in Claude Code.</p>}
    {!!data?.tools.length && <>
      <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
        <h4 className="text-sm font-medium">Tool access in Claude Code</h4>
        <p className="text-xs text-muted-foreground">Unchecked tools are denied for this project via permissions.deny in .claude/settings.local.json. Changes take effect in a new Claude Code session.</p>
        <Button type="button" variant="outline" size="sm" disabled={!policyLoaded || !policyDirty || policyBusy} onClick={savePolicy}>{policyBusy && <Loader2 className="size-3.5 animate-spin" />} Save tool access</Button>
        {policyMessage && <p role="status" className="text-xs">{policyMessage}</p>}
      </div>
      <label htmlFor={id} className="sr-only">Search tools</label>
      <input id={id} value={search} onChange={event => setSearch(event.target.value)} placeholder="Search tools..." className="w-full rounded-md border bg-transparent px-3 py-2 text-sm" />
      <div className="space-y-2">{tools.map(tool => <div key={tool.name} className="flex items-start gap-3 rounded-lg border p-3">
        <input type="checkbox" aria-label={`Allow ${tool.name} in Claude Code`} checked={!disabled.includes(tool.name)} disabled={!policyLoaded || policyBusy} onChange={event => toggleTool(tool.name, event.target.checked)} className="mt-1" />
        <div className="min-w-0 flex-1">
          <h4 className="break-all text-sm font-semibold">{tool.name}</h4>
          {tool.description && <p className="mt-1 break-words whitespace-pre-wrap text-xs text-muted-foreground">{tool.description}</p>}
        </div>
      </div>)}</div>
      {!tools.length && <p className="text-sm text-muted-foreground">No tools match your search.</p>}
    </>}
    {data?.status === "connected" && !data.tools.length && <p className="text-sm text-muted-foreground">Claude Code reports no tools for this server.</p>}
  </div>;
}
