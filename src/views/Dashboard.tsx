import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/axios";
import { getSupabaseAuthInfo, signOut } from "@/services/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OnBoardingPage() {
  const navigate = useNavigate();
  const [me, setMe] = useState<Record<string, any>>();
  const [access_token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [isVerifyingToken, setIsVerifyingToken] = useState<boolean>(false);

  const sendMe = async () => {
    try {
      await api.post(
        `/users`,
        { username },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        },
      );
      console.log("sync username ok");
    } catch (error) {
      console.error("Failed to post username:", error);
    }
  };

  useEffect(() => {
    const getUserInfo = async () => {
      const { token, user } = await getSupabaseAuthInfo();
      setToken(token);
      setMe(user);
      setIsVerifyingToken(true);

      if (user && token) {
        try {
          await api.get(`/auth/me`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          navigate("/discover");
        } catch (error) {
          console.error("Failed to fetch user info:", error);
        }
      }

      setIsVerifyingToken(false);
    };
    getUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/discover");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {isVerifyingToken && (
        <div className="text-gray-500">Verifying token...</div>
      )}

      <Button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 mt-6"
        variant="destructive"
      >
        Logout
      </Button>
      {!isVerifyingToken && (
        <>
          <div className="text-sm text-gray-700">
            <strong>Access Token:</strong>{" "}
            {access_token ? "Available" : "Not Found"}
          </div>

          {me?.user_metadata.user_name ? (
            <div className="space-y-2">
              <div className="text-lg font-semibold">Welcome to MCP-Linker</div>
              <div>
                <strong>Username:</strong> {me.user_metadata.user_name}
              </div>
              <div>
                <strong>Email:</strong> {me.email}
              </div>
              <div>
                <strong>User ID:</strong> {me.id}
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMe();
              }}
              className="space-y-2"
            >
              <Input
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Submit
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
