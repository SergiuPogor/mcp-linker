import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export function EmptyState({ 
  description, 
  buttonText, 
  onButtonClick 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col justify-center items-center h-full text-muted-foreground space-y-4">
      <p>{description}</p>
      {buttonText && onButtonClick && (
        <Button onClick={onButtonClick}>
          {buttonText}
        </Button>
      )}
    </div>
  );
}