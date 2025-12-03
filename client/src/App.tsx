import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AutomatonProvider } from "@/lib/automaton-context";
import NotFound from "@/pages/not-found";
import Editor from "@/pages/editor";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Editor} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AutomatonProvider>
          <Toaster />
          <Router />
        </AutomatonProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
