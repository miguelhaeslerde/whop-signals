import { useQuery } from "@tanstack/react-query";
import { SignalCard } from "@/components/signal-card";
import { Sidebar } from "@/components/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Filter, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Signal } from "@shared/schema";

export default function Feed() {
  const { data: signals, isLoading, error } = useQuery<Signal[]>({
    queryKey: ["/api/signals"],
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/user/stats"],
  });

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Failed to load signals</h2>
          <p className="text-muted-foreground">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Signal Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" data-testid="feed-title">Trading Signals</h1>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-chart-2 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Live</span>
              </div>
              <Button variant="ghost" size="sm" data-testid="button-filter">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 border border-border rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                  </div>
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Signal Cards */}
          {signals && signals.length > 0 && (
            <div className="space-y-4" data-testid="signals-list">
              {signals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {signals && signals.length === 0 && !isLoading && (
            <div className="text-center py-12" data-testid="empty-signals">
              <Rss className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No signals yet</h3>
              <p className="text-muted-foreground">
                New trading signals will appear here when they're posted.
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1">
          <Sidebar stats={stats} />
        </div>
      </div>
    </div>
  );
}
