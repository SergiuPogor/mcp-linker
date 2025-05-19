import { Input } from "@/components/ui/input";
import { getSupabaseAuthInfo } from "@/services/auth";
import { useEffect, useState } from "react";

export default function OnBoardingPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [me, setMe] = useState<Record<string, any>>();
  const [access_token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const getUserInfo = async () => {
      const { token, user } = await getSupabaseAuthInfo();
      setToken(token);
      setMe(user);
      setEmail(user.email ?? null);

      if (username) {
        try {
          await fetch("/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ username }),
          });
        } catch (error) {
          console.error("Failed to post username:", error);
        }
      }
    };
    getUserInfo();
  }, []);

  return (
    <div>
      <textarea name="" id="" value={JSON.stringify(me)}>

      </textarea>
      
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (access_token && username) {
            try {
              await fetch("/users", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${access_token}`,
                },
                body: JSON.stringify({ username, email }),
              });
            } catch (error) {
              console.error("Failed to post username:", error);
            }
          }
        }}
      >
        <Input
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
