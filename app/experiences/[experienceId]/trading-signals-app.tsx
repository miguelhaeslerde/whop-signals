"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

// Import existing components
import { WhopHeader } from "./components/whop-header";
import { SignalCard } from "@/client/src/components/signal-card";
import { SignalComposer } from "@/client/src/components/signal-composer";
import { Skeleton } from "@/client/src/components/ui/skeleton";

interface WhopUser {
  id: string;
  name: string;
  username: string;
  email: string;
}

interface WhopExperience {
  id: string;
  name: string;
  description?: string;
}

interface TradingSignalsAppProps {
  user: WhopUser;
  experience: WhopExperience;
  userRole: 'admin' | 'customer' | 'no_access';
  hasAccess: boolean;
}

interface Signal {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  status: 'ACTIVE' | 'CLOSED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
  description?: string;
}

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      refetchInterval: 30000, // Auto-refetch every 30 seconds
    },
  },
});

export default function TradingSignalsApp({ 
  user, 
  experience, 
  userRole, 
  hasAccess 
}: TradingSignalsAppProps) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'feed' | 'compose'>('feed');

  const isAdmin = userRole === 'admin';

  // Mock context for existing components
  const mockWhopContext = {
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
    },
    membership: {
      id: 'mock-membership',
      status: 'active',
      plan_id: 'pro-plan',
    },
    product: {
      id: experience.id,
      name: experience.name,
      role: isAdmin ? 'admin' : 'member',
      logo: null,
    },
  };

  // Fetch signals
  const fetchSignals = async () => {
    try {
      const response = await fetch('/api/signals', {
        headers: {
          'X-Whop-User-ID': user.id,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSignals(data);
      }
    } catch (error) {
      console.error('Error fetching signals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchSignals, 30000);
    return () => clearInterval(interval);
  }, [user.id]);

  const handleSignalCreated = () => {
    fetchSignals(); // Refresh signals after creating new one
    setCurrentView('feed'); // Navigate back to feed
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="min-h-screen bg-background">
          {/* Header with proper context */}
          <WhopHeader 
            isAdmin={isAdmin}
            currentView={currentView}
            onViewChange={setCurrentView}
            productName={experience.name}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {currentView === 'feed' ? (
              <div>
                {/* Welcome message */}
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    Welcome, {user.name}
                  </h1>
                  <p className="text-muted-foreground">
                    {isAdmin 
                      ? "You have admin access. You can create and manage trading signals."
                      : "You have subscriber access. View the latest trading signals below."
                    }
                  </p>
                </div>

                {/* Signals Feed */}
                <div className="space-y-6">
                  {loading ? (
                    // Loading skeletons
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-card p-6 rounded-lg border">
                        <div className="flex items-center justify-between mb-4">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ))
                  ) : signals.length === 0 ? (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        No signals yet
                      </h3>
                      <p className="text-muted-foreground">
                        {isAdmin 
                          ? "Create your first trading signal to get started."
                          : "Check back later for new trading signals."
                        }
                      </p>
                    </div>
                  ) : (
                    signals.map((signal) => (
                      <SignalCard key={signal.id} signal={signal} />
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div>
                {isAdmin ? (
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-8">
                      Create New Signal
                    </h1>
                    <SignalComposer onSignalCreated={handleSignalCreated} />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-destructive mb-2">
                      Access Denied
                    </h3>
                    <p className="text-muted-foreground">
                      Only admins can create trading signals.
                    </p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}