import { TranslationSchema } from "../schema";

const ja: { translation: TranslationSchema } = {
  translation: {
    get: "取得",
    install: "インストール",
    addTo: "追加",
    appStore: "MCPストア",
    categories: {
      discover: "発見",
      arcade: "アーケード",
      create: "作成",
      work: "仕事",
      manage: "管理",
      updates: "アップデート",
      recentlyAdded: "最近追加",
      favs: "お気に入り", // <-- 新增
    },
    content: {
      discover: "注目のコンテンツを発見",
      arcade: "Apple Arcadeのゲーム",
      create: "クリエイティブアプリ",
      work: "生産性向上アプリ",
      manage: "管理",
      updates: "アプリの更新",
      recentlyAdded: "最近追加されたアプリ",
      favs: "お気に入り", // <-- 新增
    },
    featured: {
      title: "今週の注目アプリ",
      description: "編集者が厳選したアプリをチェック",
      button: "詳細を見る",
    },
    featuredApps: "注目アプリ",
    username: "ユーザー名",
    viewProfile: "プロフィールを見る",
    selectFolder: "フォルダを選択",
  },
};

export default ja;
