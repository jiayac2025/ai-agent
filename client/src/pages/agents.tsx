import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Agent, agentSourceTypes } from "@shared/schema";
import { AgentCard } from "@/components/agent-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, Grid3x3, List, Activity } from "lucide-react";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export default function Agents() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const { data: agents, isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const deleteAgentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/agents/${id}`, null);
      // DELETE returns 204 No Content, so no JSON to parse
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Agent deleted",
        description: "The agent has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete agent",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const filteredAgents = (agents || []).filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = sourceFilter === "all" || agent.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const sourceColors = {
    "built-in": "bg-chart-2/10 text-chart-2 border-chart-2/20",
    "user-created": "bg-chart-1/10 text-chart-1 border-chart-1/20",
    "community": "bg-chart-3/10 text-chart-3 border-chart-3/20",
  };

  const statusColors = {
    active: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    inactive: "bg-muted text-muted-foreground border-muted",
    testing: "bg-chart-4/10 text-chart-4 border-chart-4/20",
    archived: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">My Agents</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your AI agents
          </p>
        </div>
        <Button onClick={() => setLocation("/builder")} data-testid="button-create-agent">
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-agents"
          />
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={sourceFilter} onValueChange={setSourceFilter}>
            <TabsList>
              <TabsTrigger value="all" data-testid="filter-all">All</TabsTrigger>
              {agentSourceTypes.map((source) => (
                <TabsTrigger key={source} value={source} data-testid={`filter-${source}`}>
                  {source.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className={cn("rounded-r-none", viewMode === "grid" && "bg-muted")}
              onClick={() => setViewMode("grid")}
              data-testid="button-view-grid"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("rounded-l-none border-l", viewMode === "table" && "bg-muted")}
              onClick={() => setViewMode("table")}
              data-testid="button-view-table"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Activity className="h-12 w-12 animate-pulse text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading agents...</p>
          </div>
        </div>
      ) : filteredAgents.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-3">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No agents found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || sourceFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first agent to get started"}
            </p>
            {!searchQuery && sourceFilter === "all" && (
              <Button onClick={() => setLocation("/builder")} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
            )}
          </div>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="agents-grid">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onEdit={() => {}}
              onDelete={() => deleteAgentMutation.mutate(agent.id)}
              onExecute={() => setLocation(`/tasks/new?agentId=${agent.id}`)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Usage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id} data-testid={`agent-row-${agent.id}`}>
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", sourceColors[agent.source])}>
                      {agent.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", statusColors[agent.status])}>
                      {agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{agent.category || "—"}</TableCell>
                  <TableCell className="text-right">{agent.usageCount || 0}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAgentMutation.mutate(agent.id)}
                      disabled={deleteAgentMutation.isPending}
                      data-testid={`button-delete-${agent.id}`}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
