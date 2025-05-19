import { LabeledInput } from "../shared/LabeledInput";

interface SellInfoSectionProps {
  projectDescription: string;
  setProjectDescription: (value: string) => void;
  projectUrl: string;
  setProjectUrl: (value: string) => void;
}

export const SellInfoSection = ({
  projectDescription,
  setProjectDescription,
  projectUrl,
  setProjectUrl,
}: SellInfoSectionProps) => {
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
    </div>
  );
};
