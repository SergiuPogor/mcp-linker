import {
  Card,
  CardContent,
  CardDescription,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "es", label: "ES" },
  { code: "ja", label: "日本语" },
  { code: "de", label: "Deutsch" },
  { code: "tc", label: "繁體中文" },
];

export default function LangSelect() {
  const { i18n, t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setCurrentLang(lng);
  };

  return (
    <Card>
      <CardContent className="flex justify-between items-center">
        <span className="flex flex-col">
          <CardTitle className="flex items-center gap-2">
            {t("language", "Language")}
          </CardTitle>
          <CardDescription>Language for the app UI</CardDescription>
        </span>
        <Select value={currentLang} onValueChange={changeLanguage}>
          <SelectTrigger className="w-full max-w-[200px]">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
