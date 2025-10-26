import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Workflow, workflowStatusTypes } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Play, Edit2, Trash2, GitBranch, Activity } from "lucide-react";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Workflows() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: workflows, isLoading } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"],
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/workflows/${id}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: "Workflow deleted",
        description: "The workflow has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete workflow",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const filteredWorkflows = (workflows || []).filter((workflow) =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColors = {
    draft: "bg-muted text-muted-foreground border-muted",
    active: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    paused: "bg-chart-4/10 text-chart-4 border-chart-4/20",
    archived: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" data-testid="page-title">
            <GitBranch className="h-8 w-8 text-primary" />
            Workflows
          </h1>
          <p className="text-muted-foreground mt-1">
            Orchestrate multi-agent workflows for complex tasks
          </p>
        </div>
        <Button onClick={() => setLocation("/workflows/builder")} data-testid="button-create-workflow">
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search workflows..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-testid="input-search-workflows"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Activity className="h-12 w-12 animate-pulse text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading workflows...</p>
          </div>
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-3">
            <GitBranch className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No workflows found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search"
                : "Create your first workflow to orchestrate multiple agents"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setLocation("/workflows/builder")} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="workflows-grid">
          {filteredWorkflows.map((workflow) => (
            <Card key={workflow.id} className="hover-elevate" data-testid={`workflow-card-${workflow.id}`}>
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{workflow.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className={cn("text-xs", statusColors[workflow.status])}>
                        {workflow.status}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {workflow.executionType}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="line-clamp-2 text-sm">
                  {workflow.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {workflow.nodes.length} agent{workflow.nodes.length !== 1 ? 's' : ''} configured
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setLocation(`/workflows/builder/${workflow.id}`)}
                    data-testid={`button-edit-${workflow.id}`}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteWorkflowMutation.mutate(workflow.id)}
                    disabled={deleteWorkflowMutation.isPending}
                    data-testid={`button-delete-${workflow.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
