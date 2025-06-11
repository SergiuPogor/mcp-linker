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
