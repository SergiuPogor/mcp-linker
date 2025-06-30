"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, Users } from "lucide-react";

interface TeamMembersGuideDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newlyCreatedTeamName: string;
  onAddMembersNow: () => void;
}

export function TeamMembersGuideDialog({
  isOpen,
  onOpenChange,
  newlyCreatedTeamName,
  onAddMembersNow,
}: TeamMembersGuideDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            How to Add Team Members
          </DialogTitle>
          <DialogDescription>
            Follow these simple steps to invite colleagues to your team "
            {newlyCreatedTeamName}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
              0
            </div>
            <div>
              <p className="font-medium">
                Invite your team members download and register MCP Linker
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div>
              <p className="font-medium">Find Your Team</p>
              <p className="text-sm text-gray-600">
                Look for "{newlyCreatedTeamName}" in the teams list below
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div>
              <p className="font-medium">Click "Members" Icon Button</p>
              <p className="text-sm text-gray-600">
                Click the "Members" button in the team row to manage team
                members
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
              ✓
            </div>
            <div>
              <p className="font-medium">Add Members</p>
              <p className="text-sm text-gray-600">
                Click "Add Member" by email
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Got it
          </Button>
          <Button onClick={onAddMembersNow}>
            Add Members Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
