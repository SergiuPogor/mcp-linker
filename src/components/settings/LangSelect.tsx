import { Globe } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const languages = [
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "es", label: "ES" },
  { code: "ja", label: "日本语" },
  { code: "de", label: "Deutsch" },
];

export default function LangSelect() {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setCurrentLang(lng);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Change language"
          className="w-10 h-10"
        >
          <Globe className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-32 p-1">
        <ul className="text-sm space-y-1">
          {languages.map((lang) => (
            <li key={lang.code}>
              <button
                onClick={() => changeLanguage(lang.code)}
                className={`w-full px-3 py-2 text-left hover:bg-accent ${
                  currentLang === lang.code ? "font-semibold" : ""
                }`}
              >
                {lang.label}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
