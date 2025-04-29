import { TranslationSchema } from "../schema";

const zh: { translation: TranslationSchema } = {
  translation: {
    get: "获取",
    install: "安装",
    addTo: "添加到",
    appStore: "MCP Store",
    categories: {
      discover: "发现",
      arcade: "Arcade",
      create: "创作",
      work: "工作",
      manage: "管理",
      updates: "更新",
      recentlyAdded: "最近添加",
      favs: "收藏", // <-- 新增
    },
    content: {
      discover: "发现精选内容",
      arcade: "Apple Arcade 游戏",
      create: "创作类应用",
      work: "办公效率应用",
      manage: "管理",
      updates: "应用更新",
      recentlyAdded: "最近添加的应用",
      favs: "收藏夹", // <-- 新增
    },
    featured: {
      title: "本周精选应用",
      description: "探索由编辑精心挑选的精彩应用",
      button: "查看详情",
    },
    featuredApps: "精选应用",
    username: "用户名",
    viewProfile: "查看个人资料",
    selectFolder: "选择文件夹",
  },
};

export default zh;
