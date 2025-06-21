const clients = [
  { value: "claude_code", label: "Claude Code" },
  { value: "claude", label: "Claude Desktop" },
  { value: "cursor", label: "Cursor" },
  { value: "cline", label: "Cline" },
  { value: "vscode", label: "VSCode" },
  { value: "windsurf", label: "Windsurf" },
  { value: "cherrystudio", label: "Cherry Studio" },
  { value: "mcphub", label: "mcphub.nvim" },
];

export const availableClients = clients;
export const clientOptions = [...clients, { value: "custom", label: "Custom" }];
