import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertAgentSchema, type InsertAgent, type Agent, toolTypes, agentStatusTypes } from "@shared/schema";
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
import { Bot, Sparkles, Wrench, FileJson, TestTube, Save, Play, Code } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { z } from "zod";

const formSchema = insertAgentSchema.extend({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().min(1, "Description is required"),
  systemPrompt: z.string().min(1, "System prompt is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function AgentBuilder() {
  const [, params] = useRoute("/builder/:id");
  const agentId = params?.id;
  const isEditMode = !!agentId;
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [inputSchemaText, setInputSchemaText] = useState("");
  const [outputSchemaText, setOutputSchemaText] = useState("");
  const [schemaErrors, setSchemaErrors] = useState<{ input?: string; output?: string }>({});

  const { data: existingAgent, isLoading: isLoadingAgent } = useQuery<Agent>({
    queryKey: ["/api/agents", agentId],
    enabled: isEditMode,
    retry: false,
  });

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

  // Populate form when editing an existing agent
  useEffect(() => {
    if (existingAgent && isEditMode) {
      form.reset({
        name: existingAgent.name,
        description: existingAgent.description,
        systemPrompt: existingAgent.systemPrompt,
        source: existingAgent.source,
        status: existingAgent.status,
        category: existingAgent.category || "",
        tools: existingAgent.tools || [],
        capabilities: existingAgent.capabilities || [],
        icon: existingAgent.icon || "",
        rating: existingAgent.rating || 0,
      });
      
      setSelectedTools(existingAgent.tools || []);
      
      if (existingAgent.inputSchema) {
        setInputSchemaText(JSON.stringify(existingAgent.inputSchema, null, 2));
      }
      
      if (existingAgent.outputSchema) {
        setOutputSchemaText(JSON.stringify(existingAgent.outputSchema, null, 2));
      }
    }
  }, [existingAgent, isEditMode, form]);

  const createAgentMutation = useMutation({
    mutationFn: async (data: InsertAgent) => {
      const response = await apiRequest("POST", "/api/agents", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Agent created successfully",
        description: "Your agent has been created and is ready to use.",
      });
      setLocation("/agents");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create agent",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const updateAgentMutation = useMutation({
    mutationFn: async (data: InsertAgent) => {
      const response = await apiRequest("PUT", `/api/agents/${agentId}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/agents", agentId] });
      toast({
        title: "Agent updated successfully",
        description: "Your changes have been saved.",
      });
      setLocation("/agents");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update agent",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const validateAndParseSchema = (schemaText: string, type: "input" | "output"): Record<string, any> | undefined => {
    if (!schemaText.trim()) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(schemaText);
      setSchemaErrors((prev) => ({ ...prev, [type]: undefined }));
      return parsed;
    } catch (error) {
      const errorMsg = `Invalid JSON format`;
      setSchemaErrors((prev) => ({ ...prev, [type]: errorMsg }));
      throw new Error(errorMsg);
    }
  };

  const onSubmit = (data: FormData) => {
    try {
      const inputSchema = validateAndParseSchema(inputSchemaText, "input");
      const outputSchema = validateAndParseSchema(outputSchemaText, "output");

      const agentData: InsertAgent = {
        ...data,
        tools: selectedTools as any,
        inputSchema,
        outputSchema,
      };
      
      if (isEditMode) {
        updateAgentMutation.mutate(agentData);
      } else {
        createAgentMutation.mutate(agentData);
      }
    } catch (error: any) {
      toast({
        title: "Schema validation failed",
        description: error?.message || "Please fix the schema errors before submitting.",
        variant: "destructive",
      });
    }
  };

  const isSubmitting = createAgentMutation.isPending || updateAgentMutation.isPending;

  const handleTest = () => {
    setTestOutput(`Testing agent "${form.watch("name")}"...\n\nAgent response: This is a simulated response based on the system prompt and configuration. In production, this would interact with the actual AI model.`);
  };

  const watchedValues = form.watch();

  if (isEditMode && isLoadingAgent) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading agent...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">
          {isEditMode ? "Edit Agent" : "Agent Builder"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isEditMode 
            ? "Update your agent configuration and settings" 
            : "Create and configure custom AI agents for your organization"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
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
                <TabsTrigger value="schema" data-testid="tab-schema">
                  <FileJson className="h-4 w-4 mr-2" />
                  Schema
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

              <TabsContent value="schema" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Input/Output Schema</CardTitle>
                    <CardDescription>
                      Define the structure of data your agent expects and returns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="inputSchema">Input Schema (JSON)</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setInputSchemaText(JSON.stringify({
                              type: "object",
                              properties: {
                                query: {
                                  type: "string",
                                  description: "User query or request"
                                },
                                context: {
                                  type: "object",
                                  description: "Additional context data"
                                }
                              },
                              required: ["query"]
                            }, null, 2));
                          }}
                          data-testid="button-use-input-template"
                        >
                          <Code className="h-3 w-3 mr-1" />
                          Use Template
                        </Button>
                      </div>
                      <Textarea
                        id="inputSchema"
                        placeholder='{\n  "type": "object",\n  "properties": {\n    "query": { "type": "string" }\n  }\n}'
                        rows={10}
                        className="font-mono text-sm"
                        value={inputSchemaText}
                        onChange={(e) => {
                          setInputSchemaText(e.target.value);
                          setSchemaErrors((prev) => ({ ...prev, input: undefined }));
                        }}
                        data-testid="input-schema-json"
                      />
                      {schemaErrors.input && (
                        <p className="text-sm text-destructive">{schemaErrors.input}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Optional: Define expected input using JSON Schema format
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="outputSchema">Output Schema (JSON)</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setOutputSchemaText(JSON.stringify({
                              type: "object",
                              properties: {
                                response: {
                                  type: "string",
                                  description: "Agent's response text"
                                },
                                confidence: {
                                  type: "number",
                                  description: "Confidence score (0-1)"
                                },
                                metadata: {
                                  type: "object",
                                  description: "Additional metadata"
                                }
                              },
                              required: ["response"]
                            }, null, 2));
                          }}
                          data-testid="button-use-output-template"
                        >
                          <Code className="h-3 w-3 mr-1" />
                          Use Template
                        </Button>
                      </div>
                      <Textarea
                        id="outputSchema"
                        placeholder='{\n  "type": "object",\n  "properties": {\n    "response": { "type": "string" }\n  }\n}'
                        rows={10}
                        className="font-mono text-sm"
                        value={outputSchemaText}
                        onChange={(e) => {
                          setOutputSchemaText(e.target.value);
                          setSchemaErrors((prev) => ({ ...prev, output: undefined }));
                        }}
                        data-testid="output-schema-json"
                      />
                      {schemaErrors.output && (
                        <p className="text-sm text-destructive">{schemaErrors.output}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Optional: Define expected output using JSON Schema format
                      </p>
                    </div>

                    <div className="rounded-md bg-muted p-4 space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <FileJson className="h-4 w-4" />
                        About Schemas
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Schemas help validate data and provide clear contracts for your agent's inputs and outputs. They're optional but recommended for production agents.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Use JSON Schema format to describe the structure, types, and requirements of your data.
                      </p>
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
                disabled={isSubmitting}
                data-testid="button-create-agent"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting 
                  ? (isEditMode ? "Updating..." : "Creating...") 
                  : (isEditMode ? "Update Agent" : "Create Agent")}
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

                {(inputSchemaText || outputSchemaText) && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Schema Configured:</p>
                    <div className="flex flex-wrap gap-1">
                      {inputSchemaText && (
                        <Badge variant="secondary" className="text-xs">
                          <FileJson className="h-3 w-3 mr-1" />
                          Input Schema
                        </Badge>
                      )}
                      {outputSchemaText && (
                        <Badge variant="secondary" className="text-xs">
                          <FileJson className="h-3 w-3 mr-1" />
                          Output Schema
                        </Badge>
                      )}
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
