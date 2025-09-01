import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WhopProvider } from "@/hooks/use-whop";
import { Header } from "@/components/header";
import Feed from "@/pages/feed";
import Compose from "@/pages/compose";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Switch>
          <Route path="/" component={Feed} />
          <Route path="/compose" component={Compose} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WhopProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </WhopProvider>
    </QueryClientProvider>
  );
}

export default App;
