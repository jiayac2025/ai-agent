import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Agent, insertWorkflowSchema, Workflow, WorkflowNode, workflowExecutionTypes, workflowStatusTypes } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitBranch, Plus, Save, ArrowUp, ArrowDown, X, Activity, Workflow as WorkflowIcon } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const formSchema = insertWorkflowSchema.extend({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().min(1, "Description is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function WorkflowBuilder() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/workflows/builder/:id");
  const isEditMode = !!params?.id;
  const workflowId = params?.id;
  const { toast } = useToast();

  const [selectedAgents, setSelectedAgents] = useState<WorkflowNode[]>([]);
  const [availableAgentId, setAvailableAgentId] = useState("");

  const { data: agents } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const { data: existingWorkflow, isLoading: isLoadingWorkflow } = useQuery<Workflow>({
    queryKey: ["/api/workflows", workflowId],
    enabled: isEditMode,
    retry: false,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      executionType: "sequential",
      status: "draft",
      nodes: [],
      createdBy: "current-user",
    },
  });

  useEffect(() => {
    if (existingWorkflow) {
      form.reset({
        name: existingWorkflow.name,
        description: existingWorkflow.description,
        executionType: existingWorkflow.executionType,
        status: existingWorkflow.status,
        nodes: existingWorkflow.nodes,
        createdBy: existingWorkflow.createdBy || "current-user",
      });
      setSelectedAgents(existingWorkflow.nodes);
    }
  }, [existingWorkflow, form]);

  const createWorkflowMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/workflows", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: "Workflow created",
        description: "Your workflow has been created successfully.",
      });
      setLocation("/workflows");
    },
    onError: () => {
      toast({
        title: "Failed to create workflow",
        description: "Please check your inputs and try again.",
        variant: "destructive",
      });
    },
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("PUT", `/api/workflows/${workflowId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workflows", workflowId] });
      toast({
        title: "Workflow updated",
        description: "Your workflow has been updated successfully.",
      });
      setLocation("/workflows");
    },
    onError: () => {
      toast({
        title: "Failed to update workflow",
        description: "Please check your inputs and try again.",
        variant: "destructive",
      });
    },
  });

  const addAgent = () => {
    if (!availableAgentId || !agents) return;

    const agent = agents.find(a => a.id === availableAgentId);
    if (!agent) return;

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      agentId: agent.id,
      order: selectedAgents.length,
    };

    setSelectedAgents([...selectedAgents, newNode]);
    setAvailableAgentId("");
  };

  const removeAgent = (nodeId: string) => {
    const updatedAgents = selectedAgents.filter(n => n.id !== nodeId);
    const reordered = updatedAgents.map((n, idx) => ({ ...n, order: idx }));
    setSelectedAgents(reordered);
  };

  const moveAgent = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedAgents.length) return;

    const updated = [...selectedAgents];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    const reordered = updated.map((n, idx) => ({ ...n, order: idx }));
    setSelectedAgents(reordered);
  };

  const onSubmit = (data: FormData) => {
    if (selectedAgents.length === 0) {
      toast({
        title: "No agents selected",
        description: "Please add at least one agent to the workflow.",
        variant: "destructive",
      });
      return;
    }

    const workflowData = {
      ...data,
      nodes: selectedAgents,
    };

    if (isEditMode) {
      updateWorkflowMutation.mutate(workflowData);
    } else {
      createWorkflowMutation.mutate(workflowData);
    }
  };

  if (isEditMode && isLoadingWorkflow) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Activity className="h-12 w-12 animate-pulse text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  const availableAgents = (agents || []).filter(
    a => !selectedAgents.some(n => n.agentId === a.id)
  );

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" data-testid="page-title">
            <GitBranch className="h-8 w-8 text-primary" />
            {isEditMode ? "Edit Workflow" : "Create Workflow"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditMode ? "Update your workflow configuration" : "Configure a new multi-agent workflow"}
          </p>
        </div>
        <Button variant="outline" onClick={() => setLocation("/workflows")} data-testid="button-cancel">
          Cancel
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>Define the workflow name and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workflow Name</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Customer Support Pipeline" {...field} data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this workflow does..."
                        {...field}
                        data-testid="textarea-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="executionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Execution Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-execution-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workflowExecutionTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workflowStatusTypes.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agent Configuration</CardTitle>
              <CardDescription>Add and order agents in the workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={availableAgentId} onValueChange={setAvailableAgentId}>
                  <SelectTrigger className="flex-1" data-testid="select-agent">
                    <SelectValue placeholder="Select an agent to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={addAgent}
                  disabled={!availableAgentId}
                  data-testid="button-add-agent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {selectedAgents.length === 0 ? (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                  <WorkflowIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No agents added yet</p>
                  <p className="text-xs mt-1">Select an agent above to get started</p>
                </div>
              ) : (
                <div className="space-y-2" data-testid="agent-list">
                  {selectedAgents.map((node, index) => {
                    const agent = agents?.find(a => a.id === node.agentId);
                    return (
                      <div
                        key={node.id}
                        className="flex items-center gap-2 border rounded-lg p-3 bg-card"
                        data-testid={`agent-node-${index}`}
                      >
                        <Badge variant="secondary" className="w-8 h-8 rounded-md flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{agent?.name || "Unknown Agent"}</p>
                          <p className="text-xs text-muted-foreground truncate">{agent?.description}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveAgent(index, 'up')}
                            disabled={index === 0}
                            data-testid={`button-move-up-${index}`}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveAgent(index, 'down')}
                            disabled={index === selectedAgents.length - 1}
                            data-testid={`button-move-down-${index}`}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAgent(node.id)}
                            data-testid={`button-remove-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/workflows")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createWorkflowMutation.isPending || updateWorkflowMutation.isPending}
              data-testid="button-save-workflow"
            >
              <Save className="h-4 w-4 mr-2" />
              {isEditMode ? "Update Workflow" : "Create Workflow"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
