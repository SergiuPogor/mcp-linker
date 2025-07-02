import { Button } from "@/components/ui/button";
import { signOut } from "@/services/auth";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 mt-6"
        variant="destructive"
      >
        Logout
      </Button>
    </div>
  );
}
