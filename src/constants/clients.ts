const clients = [
  { value: "claude", label: "Claude Desktop", free: true },
  { value: "cursor", label: "Cursor", free: true },
  { value: "claude_code", label: "Claude Code", free: false },
  { value: "cline", label: "Cline", free: true },
  { value: "roo_code", label: "Roo Code", free: false },
  { value: "vscode", label: "VSCode", free: false },
  { value: "windsurf", label: "Windsurf", free: true },
  { value: "cherrystudio", label: "Cherry Studio", free: true },
  { value: "mcphub", label: "mcphub.nvim", free: true },
];

export const availableClients = clients;
export const clientOptions = [...clients, { value: "custom", label: "Custom", free: false }];
