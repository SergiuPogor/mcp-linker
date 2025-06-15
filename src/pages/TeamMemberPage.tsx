import { AddTeamMemberForm } from "@/components/team/AddTeamMemberForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { api } from "@/lib/api";
import { TeamMember, TeamMemberRole } from "@/types/team";
import { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

export default function TeamMembers() {
  const { teamId } = useParams<{ teamId: string }>();
  const id = teamId!;
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      const data = await api.get(`/teams/${id}/members`);
      setMembers(data.data as unknown as TeamMember[]);
    } catch (error) {
      toast.error("Failed to fetch team members. Please try again.");
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (newMemberData: {
    email: string;
    role: TeamMemberRole;
  }) => {
    if (!newMemberData.email.trim()) return;

    setIsAddingMember(true);
    try {
      const userData = await api.get(
        `/users/by-email?email=${encodeURIComponent(newMemberData.email)}`,
      );

      const payload = {
        team_id: id,
      };

      // Convert role to uppercase for API
      const roleUppercase = newMemberData.role.toUpperCase();

      await api.post(
        `/teams/${id}/members?user_id_to_add=${userData.data.id}&role=${roleUppercase}`,
        payload,
      );

      toast.success("Team member added successfully.");

      fetchTeamMembers();
    } catch (error) {
      console.error("Failed to add team member:", error);
      toast.error("Failed to add team member. Please try again.");
    } finally {
      setIsAddingMember(false);
    }
  };

  /*
  const handleUpdateMemberRole = async (
    memberId: string,
    newRole: TeamMemberRole,
  ) => {
    try {
      await api.put(`/teams/${id}/members/${memberId}`,
        { role: newRole },
      );

      toast.success("Member role updated successfully.");

      fetchTeamMembers();
    } catch (error) {
      console.error("Failed to update member role:", error);
      toast.error("Failed to update member role. Please try again.");
    }
  };*/

  const handleRemoveMember = async (memberId: string) => {
    try {
      await api.delete(`/teams/${id}/members/${memberId}`);

      toast.success("Team member removed successfully.");

      fetchTeamMembers();
    } catch (error) {
      console.error("Failed to remove team member:", error);
      toast.error("Failed to remove team member. Please try again.");
    }
  };

  const getRoleBadgeVariant = (role: TeamMemberRole) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      case "member":
        return "outline";
      default:
        return "outline";
    }
  };

  const columns: ColumnDef<TeamMember>[] = [
    {
      accessorKey: "user.fullname",
      header: "Name",
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="font-medium">
            {member.user?.fullname || member.user?.email || "Unknown user"}
          </div>
        );
      },
    },
    {
      accessorKey: "user.email",
      header: "Email",
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="text-muted-foreground">{member.user?.email}</div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as TeamMemberRole;
        return <Badge variant={getRoleBadgeVariant(role)}>{role}</Badge>;
      },
    },
    {
      accessorKey: "joinedAt",
      header: "Joined At",
      cell: ({ row }) => {
        const date = row.getValue("joinedAt") as string;
        return new Date(date).toLocaleDateString();
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const member = row.original;
        if (member.role === "owner") return null;

        return (
          <div className="flex items-center space-x-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently remove{" "}
                    <span className="font-bold">
                      {member.user?.fullname || member.user?.email}
                    </span>{" "}
                    from this team.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  return (
    <main className="bg-white dark:bg-black rounded-t-3xl min-h-[60vh] py-2">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Team Members</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={fetchTeamMembers}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <AddTeamMemberForm
            onAddMember={handleAddMember}
            isAddingMember={isAddingMember}
          />

          <DataTable
            columns={columns}
            data={members}
            isLoading={isLoading}
            searchPlaceholder="Search members..."
            emptyMessage="No members found. Add your first team member to get started."
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
          />
        </div>
      </div>
    </main>
  );
}
