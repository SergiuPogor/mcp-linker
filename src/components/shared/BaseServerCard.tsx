import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface BaseServerCardProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
  headerClassName?: string;
}

export function BaseServerCard({
  title,
  description,
  actions,
  children,
  contentClassName,
  headerClassName,
}: BaseServerCardProps) {
  return (
    <Card>
      <CardHeader className={headerClassName}>
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions}
        </div>
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
