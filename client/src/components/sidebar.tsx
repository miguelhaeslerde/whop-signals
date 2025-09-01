import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3, Globe } from "lucide-react";

interface SidebarProps {
  stats?: {
    winRate: number;
    avgRR: number;
    signalsToday: number;
    totalSignals: number;
  };
}

export function Sidebar({ stats }: SidebarProps) {
  const defaultStats = {
    winRate: 73.2,
    avgRR: 2.4,
    signalsToday: 3,
    totalSignals: 1247,
  };

  const displayStats = stats || defaultStats;

  return (
    <div className="space-y-6">
      {/* Performance Stats */}
      <Card data-testid="performance-stats">
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <BarChart3 className="h-4 w-4 mr-2 text-primary" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Win Rate</span>
            <span className="font-semibold text-chart-2" data-testid="win-rate">
              {displayStats.winRate}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avg R/R</span>
            <span className="font-semibold" data-testid="avg-rr">
              {displayStats.avgRR}R
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Signals Today</span>
            <span className="font-semibold" data-testid="signals-today">
              {displayStats.signalsToday}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Signals</span>
            <span className="font-semibold" data-testid="total-signals">
              {displayStats.totalSignals.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Active Positions */}
      <Card data-testid="active-positions">
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <TrendingUp className="h-4 w-4 mr-2 text-primary" />
            Active Signals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-2 bg-muted rounded">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
              <span className="text-sm font-medium">EURUSD</span>
            </div>
            <span className="text-xs text-chart-2">+0.8R</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-muted rounded">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-destructive rounded-full"></div>
              <span className="text-sm font-medium">GBPUSD</span>
            </div>
            <span className="text-xs text-destructive">-0.3R</span>
          </div>
        </CardContent>
      </Card>

      {/* Market Status */}
      <Card data-testid="market-status">
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <Globe className="h-4 w-4 mr-2 text-primary" />
            Market Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">London</span>
            <span className="text-xs text-chart-2 flex items-center">
              <div className="w-2 h-2 bg-chart-2 rounded-full mr-1"></div>
              Open
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">New York</span>
            <span className="text-xs text-chart-2 flex items-center">
              <div className="w-2 h-2 bg-chart-2 rounded-full mr-1"></div>
              Open
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Tokyo</span>
            <span className="text-xs text-muted-foreground flex items-center">
              <div className="w-2 h-2 bg-muted-foreground rounded-full mr-1"></div>
              Closed
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
