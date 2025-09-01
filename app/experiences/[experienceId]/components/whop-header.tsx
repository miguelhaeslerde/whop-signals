"use client";

import { TrendingUp, Plus, Rss, Menu } from "lucide-react";
import { Button } from "@/client/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/client/src/components/ui/dropdown-menu";

interface WhopHeaderProps {
  isAdmin: boolean;
  currentView: 'feed' | 'compose';
  onViewChange: (view: 'feed' | 'compose') => void;
  productName?: string;
  productLogo?: string;
}

export function WhopHeader({ 
  isAdmin, 
  currentView, 
  onViewChange, 
  productName = "Trading Signals",
  productLogo 
}: WhopHeaderProps) {
  const navigation = [
    { id: "feed", label: "Feed", icon: Rss },
    ...(isAdmin ? [{ id: "compose", label: "Compose", icon: Plus }] : []),
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {productLogo ? (
                <img 
                  src={productLogo} 
                  alt={`${productName} logo`}
                  className="w-8 h-8 rounded-lg object-cover"
                  data-testid="product-logo"
                />
              ) : (
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <span className="font-semibold text-lg" data-testid="brand-name">
                {productName}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const isActive = currentView === item.id;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id as 'feed' | 'compose')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                  data-testid={`nav-${item.id}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="mobile-menu-trigger">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {navigation.map((item) => {
                  const isActive = currentView === item.id;
                  const Icon = item.icon;
                  
                  return (
                    <DropdownMenuItem key={item.id}>
                      <button
                        onClick={() => onViewChange(item.id as 'feed' | 'compose')}
                        className={`flex items-center space-x-2 w-full ${
                          isActive ? "bg-accent" : ""
                        }`}
                        data-testid={`mobile-nav-${item.id}`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}