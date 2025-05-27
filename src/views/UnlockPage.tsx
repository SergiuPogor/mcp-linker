import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/apiClient"; // your POST handler
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";

export default function UnlockPage() {
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleUnlock = async () => {
    setLoading(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      const res = await apiClient.post("/unlock", { license_key: licenseKey });

      if (res.data?.valid) {
        setStatus("success");
      } else {
        throw new Error("Invalid license key");
      }
    } catch (error: any) {
      setStatus("error");
      setErrorMsg(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 space-y-6">
      <h1 className="text-2xl font-bold text-center">Enter License Key</h1>

      <Input
        placeholder="Paste your Gumroad license key"
        value={licenseKey}
        onChange={(e) => setLicenseKey(e.target.value)}
      />

      <Button
        className="w-full"
        onClick={handleUnlock}
        disabled={loading || !licenseKey}
      >
        {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
        Unlock
      </Button>

      {status === "success" && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>License accepted. Enjoy the app!</AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertTitle>Invalid License</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
