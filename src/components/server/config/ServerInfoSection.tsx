import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { LabeledInput } from "@/components/shared/LabeledInput";
import { CategoryType } from "@/types/cat";
import { useEffect, useState } from "react";

interface SellInfoSectionProps {
  projectDescription: string;
  setProjectDescription: (value: string) => void;
  projectUrl: string;
  setProjectUrl: (value: string) => void;
  setSelectedCategoryId: (id: number) => void;
}

export const SellInfoSection = ({
  projectDescription,
  setProjectDescription,
  projectUrl,
  setProjectUrl,
  setSelectedCategoryId,
}: SellInfoSectionProps) => {
  const [categories, setCategories] = useState<CategoryType[]>([]);

  useEffect(() => {
    fetch("/cats.json")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategoryId(data[0].id);
        }
      });
  }, []);

  return (
    <div>
      <LabeledInput
        label="Project description"
        value={projectDescription}
        onChange={setProjectDescription}
      />
      <LabeledInput
        label="Project url"
        value={projectUrl}
        onChange={setProjectUrl}
      />

      <Select onValueChange={(value) => setSelectedCategoryId(Number(value))}>
        <SelectTrigger>
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
