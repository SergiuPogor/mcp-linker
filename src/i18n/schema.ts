export interface TranslationSchema {
  get: string;
  install: string;
  addTo: string;
  appStore: string;
  categories: {
    discover: string;
    arcade: string;
    create: string;
    work: string;
    manage: string;
    updates: string;
    favs: string;
    recentlyAdded: string;
  };
  content: {
    discover: string;
    arcade: string;
    create: string;
    work: string;
    manage: string;
    favs: string;
    updates: string;
    recentlyAdded: string;
  };
  featured: {
    title: string;
    description: string;
    button: string;
  };
  featuredApps: string;
  username: string;
  viewProfile: string;
  selectFolder: string;
}
