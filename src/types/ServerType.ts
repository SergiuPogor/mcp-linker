export type ServerType = {
  id: string;
  name: string;
  developer?: string;
  icon_url?: string;
  description: string;
  category?: string;
  source: string;
  isOfficial: boolean;
  githubStars: number;
  downloads: number;
  rating: number;
  views: number;
  isFavorited: boolean;
};
