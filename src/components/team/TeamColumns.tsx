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
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TeamWithRoleResponse } from "@/types/team";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Users } from "lucide-react";

interface TeamColumnsProps {
  onEdit: (team: TeamWithRoleResponse) => void;
  onDelete: (teamId: string) => void;
  navigateToMembers: (teamId: string) => void;
}

export function useTeamColumns({
  onEdit,
  onDelete,
  navigateToMembers,
}: TeamColumnsProps): ColumnDef<TeamWithRoleResponse>[] {
  return [
    {
      accessorKey: "name",
      header: "Team Name",
      cell: ({ row }) => {
        const team = row.original;
        return (
          <div className="font-medium">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigateToMembers(team.id)}
            >
              {row.getValue("name")}
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "userRole",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("userRole") as string;
        const roleColors = {
          OWNER: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
          MEMBER: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          VIEWER: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[role as keyof typeof roleColors]}`}>
            {role}
          </span>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string | null;
        return (
          <div className="max-w-[200px] truncate">
            {description || (
              <span className="text-muted-foreground">No description</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        return new Date(row.getValue("createdAt")).toLocaleDateString();
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
      cell: ({ row }) => {
        return new Date(row.getValue("updatedAt")).toLocaleDateString();
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const team = row.original;
        const isOwner = team.userRole === "OWNER";

        return (
          <div className="flex gap-2">
            {/* Manage Members Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigateToMembers(team.id)}
                  >
                    <Users className="mr-1 h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Manage Members</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Edit button - only for owners */}
            {isOwner && (
              <Button variant="outline" size="sm" onClick={() => onEdit(team)}>
                <Pencil className="mr-1 h-4 w-4" />
              </Button>
            )}

            {/* Delete button - only for owners */}
            {isOwner && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-1 h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the team "{team.name}" and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(team.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        );
      },
    },
  ];
}
