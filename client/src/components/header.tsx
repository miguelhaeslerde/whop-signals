import { useWhop } from "@/hooks/use-whop";
import { useLocation } from "wouter";
import { TrendingUp, Plus, BarChart3, Rss } from "lucide-react";

export function Header() {
  const { context, isAdmin } = useWhop();
  const [location, setLocation] = useLocation();

  const navigation = [
    { id: "feed", label: "Feed", icon: Rss, path: "/" },
    ...(isAdmin ? [{ id: "compose", label: "Compose", icon: Plus, path: "/compose" }] : []),
  ];

  const productName = context?.product?.name || "Signal Pro";

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg" data-testid="brand-name">
                {productName}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setLocation(item.path)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-foreground border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`nav-${item.id}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Live Indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-chart-2 rounded-full animate-pulse" data-testid="online-indicator"></div>
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </div>
      </div>
    </header>
  );
}
