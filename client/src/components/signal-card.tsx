import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, CheckCircle, ArrowUp, ArrowDown } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useWhop } from "@/hooks/use-whop";
import { formatDistanceToNow } from "date-fns";
import type { Signal } from "@shared/schema";

interface SignalCardProps {
  signal: Signal & {
    readCount?: number;
    isRead?: boolean;
  };
}

export function SignalCard({ signal }: SignalCardProps) {
  const { user } = useWhop();
  const queryClient = useQueryClient();
  const [isRead, setIsRead] = useState(signal.isRead || false);

  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/signals/${signal.id}/read`);
    },
    onSuccess: () => {
      setIsRead(true);
      queryClient.invalidateQueries({ queryKey: ["/api/signals"] });
    },
  });

  const handleMarkAsRead = () => {
    if (!isRead && !markAsReadMutation.isPending) {
      markAsReadMutation.mutate();
    }
  };

  const signalTypeConfig = {
    BUY: { 
      class: "signal-buy text-white", 
      icon: ArrowUp, 
      color: "bg-chart-2" 
    },
    SELL: { 
      class: "signal-sell text-white", 
      icon: ArrowDown, 
      color: "bg-destructive" 
    },
    BUY_LIMIT: { 
      class: "signal-limit text-white", 
      icon: ArrowUp, 
      color: "bg-chart-1" 
    },
    SELL_LIMIT: { 
      class: "signal-limit text-white", 
      icon: ArrowDown, 
      color: "bg-chart-1" 
    },
  };

  const config = signalTypeConfig[signal.side];
  const Icon = config.icon;

  const riskColors = {
    SAFE: "bg-chart-2 text-black",
    NORMAL: "bg-chart-3 text-black", 
    RISKY: "bg-destructive text-destructive-foreground"
  };

  const entry = parseFloat(signal.entry);
  const stopLoss = parseFloat(signal.stopLoss);
  const isLong = signal.side === "BUY" || signal.side === "BUY_LIMIT";
  const risk = Math.abs(entry - stopLoss);

  // Calculate primary R/R ratio
  const primaryTP = signal.takeProfits[0];
  let primaryRR = "–";
  if (primaryTP) {
    const tpPrice = parseFloat(primaryTP.price);
    const reward = isLong ? tpPrice - entry : entry - tpPrice;
    primaryRR = `${(reward / risk).toFixed(1)}R`;
  }

  const timeAgo = formatDistanceToNow(new Date(signal.createdAt), { addSuffix: true });

  return (
    <Card 
      className={`relative transition-opacity ${isRead ? 'opacity-75' : ''}`}
      data-testid={`signal-card-${signal.id}`}
    >
      <CardContent className="p-6">
        {/* Signal Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Badge className={`${config.class} px-3 py-1 flex items-center space-x-1`}>
              <Icon className="h-3 w-3" />
              <span>{signal.side.replace('_', ' ')}</span>
            </Badge>
            <h3 className="text-lg font-semibold" data-testid="signal-instrument">
              {signal.instrument}
            </h3>
            {signal.riskTag && (
              <Badge 
                className={`${riskColors[signal.riskTag]} text-xs`}
                data-testid="signal-risk"
              >
                {signal.riskTag}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span data-testid="signal-time">{timeAgo}</span>
            {!isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAsRead}
                disabled={markAsReadMutation.isPending}
                className="h-auto p-1"
                data-testid="button-mark-read"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
            {isRead && (
              <CheckCircle className="h-4 w-4 text-chart-2" data-testid="signal-read-indicator" />
            )}
          </div>
        </div>

        {/* Signal Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-muted rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Entry</div>
            <div className="text-lg font-mono font-bold text-chart-2" data-testid="signal-entry">
              {parseFloat(signal.entry).toFixed(5)}
            </div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Stop Loss</div>
            <div className="text-lg font-mono font-bold text-destructive" data-testid="signal-stop-loss">
              {parseFloat(signal.stopLoss).toFixed(5)}
            </div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Risk/Reward</div>
            <div className="text-lg font-mono font-bold text-foreground" data-testid="signal-rr">
              {primaryRR}
            </div>
          </div>
        </div>

        {/* Take Profit Levels */}
        {signal.takeProfits.length > 0 && (
          <div className="mb-4">
            <div className="text-sm text-muted-foreground mb-2">Take Profit Levels</div>
            <div className="flex flex-wrap gap-2" data-testid="signal-take-profits">
              {signal.takeProfits.map((tp, index) => (
                <div key={index} className="bg-accent rounded-lg p-2 flex items-center space-x-2">
                  <span className="text-xs text-accent-foreground">TP{index + 1}:</span>
                  <span className="font-mono font-medium text-accent-foreground">
                    {parseFloat(tp.price).toFixed(5)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {tp.ratio}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TradingView Embed */}
        {signal.tradingViewLink && (
          <div className="tradingview-embed bg-muted rounded-lg mb-4" data-testid="tradingview-embed">
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">TradingView Chart</p>
                <p className="text-xs">{signal.instrument} Analysis</p>
              </div>
            </div>
          </div>
        )}

        {/* Additional Notes */}
        {signal.notes && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Notes</div>
            <p className="text-sm" data-testid="signal-notes">{signal.notes}</p>
          </div>
        )}

        {/* Signal Footer */}
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-3">
          <div className="flex items-center space-x-4">
            <span data-testid="signal-id">Signal #{signal.id.slice(-4)}</span>
            <span className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span data-testid="signal-read-count">{signal.readCount || 0} read</span>
            </span>
          </div>
          <div className="text-xs">
            <strong>Disclaimer:</strong> Trading involves risk. Past performance does not guarantee future results.
          </div>
        </div>

        {/* Unread indicator */}
        {!isRead && (
          <div 
            className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full" 
            data-testid="unread-indicator"
          ></div>
        )}
      </CardContent>
    </Card>
  );
}
