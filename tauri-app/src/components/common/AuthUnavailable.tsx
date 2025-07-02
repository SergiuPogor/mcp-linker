import { AlertCircle } from "lucide-react";

export default function AuthUnavailable() {
  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
      <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
      <h1 className="text-3xl font-bold mb-4">Authentication Unavailable</h1>
      {/* Description */}
      <p className="mb-6 text-gray-500 max-w-md">
        Authentication features are currently disabled. Please configure
        Supabase environment variables to enable user authentication.
      </p>
      {/* Environment variable instructions */}
      <div className="bg-gray-100 p-4 rounded-lg text-sm text-left max-w-md">
        <p className="font-semibold mb-2">Required environment variables:</p>
        <code className="block text-xs">
          VITE_SUPABASE_URL=your_supabase_url
          <br />
          VITE_SUPABASE_ANON_KEY=your_supabase_key
        </code>
      </div>
    </div>
  );
} 