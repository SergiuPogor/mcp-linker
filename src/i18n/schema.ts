export interface TranslationSchema {
  get: string;
  guest: string;
  loadMore: string;
  loading: string;
  searchPlaceholder: string;
  sellServer: string;
  addCustomServer: string;
  confirmDeletion: string;
  deleteConfirmation: string;
  cancel: string;
  delete: string;
  install: string;
  addTo: string;
  back: string;
  mcpLinker: string;
  nav: {
    discover: string;
    category: string;
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
  featuredServers: string;
  username: string;
  viewProfile: string;
  selectFolder: string;
  search: {
    placeholder: string;
    items: string;
    results: string;
    noResults: string;
    startSearching: string;
  };
  serverForm: {
    command: string;
    arguments: string;
    env: string;
    addEnv: string;
    headers: string;
    url: string;
  };
}
