import { useTranslation } from "react-i18next";

/**
 * Hero Banner Component
 * Extracted from Discovery view for better reusability
 */
export function HeroBanner() {
  const { t } = useTranslation();

  return (
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 mb-8">
      <div className="p-6 md:p-8 text-white">
        <h2 className="text-xl md:text-2xl font-bold mb-2">
          {t("featured.title")}
        </h2>
        <p className="text-base md:text-lg mb-4">{t("featured.description")}</p>
        <button className="px-4 py-2 rounded-full font-semibold bg-white text-blue-600 border border-blue-600 shadow-sm hover:bg-blue-50 dark:bg-gray-900 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-800 transition-colors">
          {t("featured.button")}
        </button>
      </div>
      <div className="absolute right-8 bottom-8 w-24 h-24 md:w-32 md:h-32 bg-white/20 rounded-xl backdrop-blur-sm"></div>
    </div>
  );
}
