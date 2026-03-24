/*
 this page don't use console in tauri
*/

export default function OnBoarding() {
  // Show welcome message
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to MCP Linker</h1>
        <p>Setting up your account...</p>
      </div>
    </div>
  );
}
