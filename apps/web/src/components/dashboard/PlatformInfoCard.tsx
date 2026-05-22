import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface PlatformInfoCardProps {
  role: string | null;
}

export function PlatformInfoCard({ role }: PlatformInfoCardProps) {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Platform Info
        </CardTitle>
        <CardDescription>System overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Your Role</span>
            <Badge variant={role === "administrator" ? "default" : "secondary"}>
              {role === "administrator" ? "Administrator" : "Data Collector"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Data Source</span>
            <span className="text-sm font-medium">Instagram Comments</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Leagues</span>
            <span className="text-sm font-medium">Liga 1 & Liga 2</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">API Status</span>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Connected</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Version</span>
            <span className="text-sm font-medium font-mono">v1.0.0</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
