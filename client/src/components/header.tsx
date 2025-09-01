import { useWhop } from "@/hooks/use-whop";
import { useLocation } from "wouter";
import { TrendingUp, Plus, BarChart3, Rss } from "lucide-react";

export function Header() {
  const { user, userRole, isAdmin } = useWhop();
  const [location, setLocation] = useLocation();

  const navigation = [
    { id: "feed", label: "Feed", icon: Rss, path: "/" },
    ...(isAdmin ? [{ id: "compose", label: "Compose", icon: Plus, path: "/compose" }] : []),
    { id: "analytics", label: "Analytics", icon: BarChart3, path: "/analytics" },
  ];

  const userInitials = user?.name?.split(" ").map((n: string) => n[0]).join("") || "U";

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
                Signal Pro
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

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium" data-testid="user-initials">
                  {userInitials}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium" data-testid="user-name">
                  {user?.name || user?.username || "User"}
                </p>
                <p className="text-xs text-muted-foreground" data-testid="user-role">
                  {userRole}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-chart-2 rounded-full" data-testid="online-indicator"></div>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
