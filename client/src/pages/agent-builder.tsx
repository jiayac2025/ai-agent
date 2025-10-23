import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertAgentSchema, type InsertAgent, toolTypes, agentStatusTypes } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Sparkles, Wrench, FileJson, TestTube, Save, Play } from "lucide-react";
import { useLocation } from "wouter";
import { z } from "zod";

const formSchema = insertAgentSchema.extend({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  systemPrompt: z.string().min(20, "System prompt must be at least 20 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function AgentBuilder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      systemPrompt: "",
      source: "user-created",
      status: "testing",
      category: "",
      tools: [],
      capabilities: [],
      icon: "",
      rating: 0,
    },
  });

  const createAgentMutation = useMutation({
    mutationFn: async (data: InsertAgent) => {
      return await apiRequest("POST", "/api/agents", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Agent created successfully",
        description: "Your agent has been created and is ready to use.",
      });
      setLocation("/agents");
    },
    onError: () => {
      toast({
        title: "Failed to create agent",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const agentData: InsertAgent = {
      ...data,
      tools: selectedTools as any,
    };
    createAgentMutation.mutate(agentData);
  };

  const handleTest = () => {
    setTestOutput(`Testing agent "${form.watch("name")}"...\n\nAgent response: This is a simulated response based on the system prompt and configuration. In production, this would interact with the actual AI model.`);
  };

  const watchedValues = form.watch();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">Agent Builder</h1>
        <p className="text-muted-foreground mt-1">
          Create and configure custom AI agents for your organization
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic" data-testid="tab-basic">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="prompt" data-testid="tab-prompt">
                  <Bot className="h-4 w-4 mr-2" />
                  Prompt
                </TabsTrigger>
                <TabsTrigger value="tools" data-testid="tab-tools">
                  <Wrench className="h-4 w-4 mr-2" />
                  Tools
                </TabsTrigger>
                <TabsTrigger value="test" data-testid="tab-test">
                  <TestTube className="h-4 w-4 mr-2" />
                  Test
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Basic Information</CardTitle>
                    <CardDescription>Define the core identity of your agent</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Agent Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Customer Support Agent"
                        {...form.register("name")}
                        data-testid="input-agent-name"
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what this agent does and how it helps users..."
                        rows={3}
                        {...form.register("description")}
                        data-testid="input-agent-description"
                      />
                      {form.formState.errors.description && (
                        <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          placeholder="e.g., Support, Sales, Analytics"
                          {...form.register("category")}
                          data-testid="input-agent-category"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={form.watch("status")}
                          onValueChange={(value) => form.setValue("status", value as any)}
                        >
                          <SelectTrigger data-testid="select-agent-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {agentStatusTypes.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prompt" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">System Prompt Configuration</CardTitle>
                    <CardDescription>
                      Define the agent's behavior, personality, and capabilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="systemPrompt">System Prompt *</Label>
                      <Textarea
                        id="systemPrompt"
                        placeholder="You are a helpful AI assistant that..."
                        rows={12}
                        className="font-mono text-sm"
                        {...form.register("systemPrompt")}
                        data-testid="input-system-prompt"
                      />
                      {form.formState.errors.systemPrompt && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.systemPrompt.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {form.watch("systemPrompt")?.length || 0} characters
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tools" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tool Bindings</CardTitle>
                    <CardDescription>
                      Select the tools this agent can use to accomplish tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      {toolTypes.map((tool) => (
                        <div
                          key={tool}
                          className="flex items-center space-x-2 rounded-md border p-3 hover-elevate"
                        >
                          <Checkbox
                            id={tool}
                            checked={selectedTools.includes(tool)}
                            onCheckedChange={(checked) => {
                              setSelectedTools(
                                checked
                                  ? [...selectedTools, tool]
                                  : selectedTools.filter((t) => t !== tool)
                              );
                            }}
                            data-testid={`checkbox-tool-${tool}`}
                          />
                          <label
                            htmlFor={tool}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                          >
                            {tool}
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="test" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Test Your Agent</CardTitle>
                    <CardDescription>
                      Verify your agent's behavior before deploying
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="testInput">Test Input</Label>
                      <Textarea
                        id="testInput"
                        placeholder="Enter a sample question or task..."
                        rows={3}
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        data-testid="input-test-input"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleTest}
                      disabled={!testInput}
                      data-testid="button-test-agent"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Run Test
                    </Button>
                    {testOutput && (
                      <div className="space-y-2">
                        <Label>Test Output</Label>
                        <div className="rounded-md bg-muted p-4 font-mono text-sm whitespace-pre-wrap">
                          {testOutput}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={createAgentMutation.isPending}
                data-testid="button-create-agent"
              >
                <Save className="h-4 w-4 mr-2" />
                {createAgentMutation.isPending ? "Creating..." : "Create Agent"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/agents")}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Live Preview</CardTitle>
                <CardDescription>See how your agent will appear</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {watchedValues.name
                        ? watchedValues.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                        : "AI"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                      {watchedValues.name || "Agent Name"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        user-created
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {watchedValues.status || "testing"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3">
                  {watchedValues.description || "No description provided yet..."}
                </p>

                {watchedValues.category && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">Category: </span>
                    <span className="text-foreground">{watchedValues.category}</span>
                  </div>
                )}

                {selectedTools.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Enabled Tools:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedTools.map((tool) => (
                        <Badge key={tool} variant="secondary" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {watchedValues.systemPrompt && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">System Prompt Preview:</p>
                    <div className="rounded-md bg-muted p-3 text-xs font-mono line-clamp-6">
                      {watchedValues.systemPrompt}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
