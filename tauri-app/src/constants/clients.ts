const clients = [
  { value: "claude", label: "Claude Desktop", free: true },
  { value: "cursor", label: "Cursor", free: true },
  { value: "claude_code", label: "Claude Code", free: true },
  { value: "cline", label: "Cline", free: true },
  { value: "roo_code", label: "Roo Code", free: true },
  { value: "vscode", label: "VSCode", free: true },
  { value: "windsurf", label: "Windsurf", free: true },
  { value: "cherrystudio", label: "Cherry Studio", free: true },
  { value: "mcphub", label: "mcphub.nvim", free: true },
];

export const availableClients = clients;
export const clientOptions = [
  ...clients,
  { value: "custom", label: "Custom", free: true },
];
