import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Cloud, Server, Users } from "lucide-react";
import { ReactNode } from "react";
import { useNavigate } from "react-router";

interface DashboardProps {
  isAuthenticated: boolean;
  personalStats: {
    total: number;
    active: number;
    disabled: number;
  };
  teamStats: {
    total: number;
  };
}

// Reusable stat card component
interface StatCardProps {
  title: string;
  value: number | string;
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: ReactNode;
}

const StatCard = ({ title, value, variant, icon }: StatCardProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "default":
        return {
          card: "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/50",
          title: "text-blue-600 dark:text-blue-400",
          value: "text-blue-900 dark:text-blue-100",
          icon: "bg-blue-100 dark:bg-blue-900",
          iconColor: "text-blue-600 dark:text-blue-400"
        };
      case "secondary":
        return {
          card: "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/50",
          title: "text-green-600 dark:text-green-400",
          value: "text-green-900 dark:text-green-100",
          icon: "bg-green-100 dark:bg-green-900",
          iconColor: "text-green-600 dark:text-green-400"
        };
      case "destructive":
        return {
          card: "border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/50",
          title: "text-orange-600 dark:text-orange-400",
          value: "text-orange-900 dark:text-orange-100",
          icon: "bg-orange-100 dark:bg-orange-900",
          iconColor: "text-orange-600 dark:text-orange-400"
        };
      case "outline":
        return {
          card: "border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/50",
          title: "text-purple-600 dark:text-purple-400",
          value: "text-purple-900 dark:text-purple-100",
          icon: "bg-purple-100 dark:bg-purple-900",
          iconColor: "text-purple-600 dark:text-purple-400"
        };
      default:
        return {
          card: "border-border bg-muted/50",
          title: "text-muted-foreground",
          value: "text-foreground",
          icon: "bg-muted",
          iconColor: "text-muted-foreground"
        };
    }
  };

  const classes = getVariantClasses();

  return (
    <Card className={classes.card}>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${classes.title}`}>{title}</p>
            <p className={`text-2xl font-bold ${classes.value}`}>{value}</p>
          </div>
          <div className={`h-8 w-8 ${classes.icon} rounded-full flex items-center justify-center`}>
            <div className={classes.iconColor}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const Dashboard = ({
  isAuthenticated,
  personalStats,
  teamStats,
}: DashboardProps) => {
  const navigate = useNavigate();

  // Prepare stat card data
  const statCards = [
    {
      title: "Personal Total",
      value: personalStats.total,
      variant: "default" as const,
      icon: <Server className="h-4 w-4" />,
    },
    {
      title: "Personal Active",
      value: personalStats.active,
      variant: "secondary" as const,
      icon: <Activity className="h-4 w-4" />,
    },
    {
      title: "Personal Disabled",
      value: personalStats.disabled,
      variant: "destructive" as const,
      icon: <Cloud className="h-4 w-4" />,
    },
    {
      title: "Team Total",
      value: teamStats.total,
      variant: "outline" as const,
      icon: <Users className="h-4 w-4" />,
    },
  ];

  return (
    <>
      {/* Show login prompt if not authenticated */}
      {!isAuthenticated ? (
        <Card className="border-dashed border-2 border-yellow-300 dark:border-yellow-600 bg-yellow-50/50 dark:bg-yellow-950/50 col-span-full">
          <CardContent className="text-center">
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              Pro & Team Features
            </p>
            <p className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
              Unlock cloud sync, multi-device access, and advanced templates
            </p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => navigate("/auth")}
            >
              Login to Explore
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Render all stat cards */}
          {statCards.map((card, idx) => (
            <StatCard key={idx} {...card} />
          ))}
        </div>
      )}
    </>
  );
};
