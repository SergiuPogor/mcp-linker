import { TranslationSchema } from "../schema";

const es: { translation: TranslationSchema } = {
  translation: {
    get: "Get",
    confirmDeletion: "Confirm Deletion",
    deleteConfirmation: "Are you sure you want to delete {{serverKey}}?",
    cancel: "Cancel",
    delete: "Delete",
    install: "Instalar",
    addTo: "Add to",
    mcpLinker: "MCP Linker",
    categories: {
      discover: "Descubrir",
      arcade: "Arcade",
      create: "Crear",
      favs: "Favoritos",
      work: "Trabajo",
      manage: "Gestionar",
      updates: "Actualizaciones",
      recentlyAdded: "Añadido recientemente",
    },
    content: {
      discover: "Descubrir contenido destacado",
      arcade: "Juegos de Apple Arcade",
      create: "Servidores creativos",
      work: "Servidores de productividad",
      manage: "Gestionar",
      favs: "Favoritos",
      updates: "Actualizaciones de servidores",
      recentlyAdded: "Servidores añadidos recientemente",
    },
    featured: {
      title: "Aplicación destacada de la semana",
      description: "Explora aplicaciones seleccionadas por nuestros editores",
      button: "Ver detalles",
    },
    featuredServers: "Servidores destacados",
    username: "Nombre de usuario",
    viewProfile: "Ver perfil",
    selectFolder: "Seleccionar carpeta",
    search: {
      placeholder: "Search servers by name...",
    },
    serverForm: {
      command: "Command",
      arguments: "Arguments",
      env: "Environment Variables",
    },
  },
};

export default es;
