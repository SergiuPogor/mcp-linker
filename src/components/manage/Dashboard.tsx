import { Card, CardContent } from "@/components/ui/card";
import { Server, Cloud, Users, Activity } from "lucide-react";

interface DashboardProps {
  personalStats: {
    total: number;
    active: number;
    disabled: number;
  };
  teamStats: {
    total: number;
  };
}

export const Dashboard = ({ personalStats, teamStats }: DashboardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Personal Total Servers */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Personal Total</p>
              <p className="text-2xl font-bold text-blue-900">{personalStats.total}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Server className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Active Servers */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Personal Active</p>
              <p className="text-2xl font-bold text-green-900">{personalStats.active}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <Activity className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Disabled Servers */}
      <Card className="border-orange-200 bg-orange-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Personal Disabled</p>
              <p className="text-2xl font-bold text-orange-900">{personalStats.disabled}</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Cloud className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Servers */}
      <Card className="border-purple-200 bg-purple-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Team Total</p>
              <p className="text-2xl font-bold text-purple-900">{teamStats.total}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
