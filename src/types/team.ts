// Team response type from API
export type TeamResponse = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

// Team list response type from API
export type TeamListResponse = {
  page: number;
  page_size: number;
  has_next: boolean;
  has_prev: boolean;
  teams: TeamResponse[];
};

// Form data type for team creation/editing
export type TeamFormData = {
  name: string;
  description: string;
};

// Team member types
export type TeamMemberRole = "owner" | "admin" | "member" | "viewer";

export type TeamMember = {
  id: string;
  userId: string;
  teamId: string;
  role: TeamMemberRole;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    fullname?: string;
  };
};

export type TeamMembersResponse = {
  members: TeamMember[];
};

export type TeamMembershipResponse = {
  memberships: Array<{
    id: string;
    role: TeamMemberRole;
    joinedAt: string;
    team: TeamResponse;
  }>;
};

export type AddTeamMemberData = {
  email: string;
  role: TeamMemberRole;
};
