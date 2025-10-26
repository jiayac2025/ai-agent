import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import Dashboard from "@/pages/dashboard";
import AgentBuilder from "@/pages/agent-builder";
import Marketplace from "@/pages/marketplace";
import Agents from "@/pages/agents";
import Tasks from "@/pages/tasks";
import TaskExecute from "@/pages/task-execute";
import Chat from "@/pages/chat";
import Workflows from "@/pages/workflows";
import WorkflowBuilder from "@/pages/workflow-builder";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/builder" component={AgentBuilder} />
      <Route path="/builder/:id" component={AgentBuilder} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/agents" component={Agents} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/tasks/execute" component={TaskExecute} />
      <Route path="/workflows" component={Workflows} />
      <Route path="/workflows/builder" component={WorkflowBuilder} />
      <Route path="/workflows/builder/:id" component={WorkflowBuilder} />
      <Route path="/chat" component={Chat} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 min-w-0">
              <header className="flex items-center justify-between px-6 py-4 border-b bg-background sticky top-0 z-50">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-auto">
                <div className="container max-w-7xl mx-auto p-6">
                  <Router />
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
