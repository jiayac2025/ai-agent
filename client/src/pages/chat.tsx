import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Bot, User, Lightbulb, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import type { AIModel, AIModelInfo } from "@shared/schema";

const AI_MODELS: AIModelInfo[] = [
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    description: "Most capable model, best for complex tasks",
    contextWindow: 128000,
    costPer1kTokens: 0.03,
  },
  {
    id: "claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    description: "Best balance of intelligence and speed",
    contextWindow: 200000,
    costPer1kTokens: 0.015,
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    description: "Google's most capable AI model",
    contextWindow: 32768,
    costPer1kTokens: 0.00125,
  },
];

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  {
    icon: Target,
    title: "I need help choosing the right agent type",
    prompt: "I want to build an AI agent for my business but I'm not sure what type would work best. Can you help me understand what kinds of agents are possible and which would fit my use case?",
  },
  {
    icon: Lightbulb,
    title: "How do I design effective agent prompts?",
    prompt: "I'm new to building AI agents. What are the best practices for writing system prompts that will make my agent effective and reliable?",
  },
  {
    icon: Zap,
    title: "What tools should my agent use?",
    prompt: "I want to create an agent that can help with customer support. What tools and capabilities should I enable for it to be most effective?",
  },
];

export default function Chat() {
  const [, setLocation] = useLocation();
  const [selectedModel, setSelectedModel] = useState<AIModel>("gpt-4-turbo");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const currentModel = AI_MODELS.find((m) => m.id === selectedModel);

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Hello! I'm your AI Agent Consultant, powered by ${currentModel?.name}.\n\nI'm here to help you build effective AI agents for your enterprise. I can guide you through:\n\n• Choosing the right agent type for your use case\n• Designing effective system prompts and behaviors\n• Selecting the best tools and capabilities\n• Best practices for agent deployment\n• Troubleshooting and optimization strategies\n\nWhat would you like to build today?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const handleSend = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      let responseContent = "";

      if (content.toLowerCase().includes("agent type") || content.toLowerCase().includes("use case")) {
        responseContent = `Great question! Let me help you understand the different types of AI agents you can build:\n\n**1. Customer Support Agents**\nBest for: Handling inquiries, troubleshooting, FAQ assistance\nTools needed: Web search, knowledge base access, ticket creation\n\n**2. Data Analysis Agents**\nBest for: Processing reports, generating insights, visualizing data\nTools needed: Data analysis, API calls, file access\n\n**3. Sales & Marketing Agents**\nBest for: Lead qualification, email campaigns, content generation\nTools needed: API calls, web search, text generation\n\n**4. Code Review Agents**\nBest for: Code analysis, bug detection, best practices enforcement\nTools needed: Code execution, file access, web search\n\nWhat type of business problem are you trying to solve? I can help you narrow down the best approach.`;
      } else if (content.toLowerCase().includes("prompt") || content.toLowerCase().includes("system prompt")) {
        responseContent = `Excellent! Writing effective system prompts is crucial for agent success. Here are the key principles:\n\n**1. Be Specific & Clear**\nDefine exactly what role the agent plays and what it should/shouldn't do.\n\n**2. Set Behavioral Guidelines**\n• Tone (professional, friendly, technical)\n• Response style (concise, detailed, step-by-step)\n• Boundaries (what questions to decline)\n\n**3. Include Examples**\nShow the agent how to handle common scenarios.\n\n**4. Define Success Criteria**\nWhat does a good response look like?\n\nWould you like me to help you draft a system prompt for your specific use case? Tell me what kind of agent you're building.`;
      } else if (content.toLowerCase().includes("tool") || content.toLowerCase().includes("capabilit")) {
        responseContent = `Let me explain the available tools and when to use them:\n\n**Web Search**\nUse for: Agents that need current information, research capabilities\nExample: Market analysis, competitor research\n\n**Code Execution**\nUse for: Agents that process data, run calculations, generate reports\nExample: Analytics agents, automation agents\n\n**File Access**\nUse for: Agents that work with documents, databases, or content\nExample: Document processing, data migration\n\n**API Calls**\nUse for: Agents that integrate with external services\nExample: CRM updates, payment processing\n\n**Data Analysis**\nUse for: Agents that need to extract insights from datasets\nExample: Business intelligence, forecasting\n\nFor your customer support use case, I'd recommend: **Web Search** (for knowledge lookup) + **API Calls** (for ticket creation) + **File Access** (for documentation).\n\nReady to build this agent? I can walk you through the Agent Builder.`;
      } else {
        responseContent = `I understand you're looking to build an AI agent. To provide the most helpful guidance, could you tell me more about:\n\n• What business process are you trying to automate?\n• Who will be interacting with this agent? (customers, employees, etc.)\n• What kind of tasks should it handle?\n• Do you have any specific requirements or constraints?\n\nOnce I understand your needs better, I can guide you through:\n1. Choosing the optimal agent configuration\n2. Writing an effective system prompt\n3. Selecting the right tools and capabilities\n4. Best practices for deployment\n\nFeel free to click one of the suggested prompts above if you're not sure where to start!`;
      }

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Agent Consultant
        </h1>
        <p className="text-muted-foreground mt-2">
          Get expert guidance on building and deploying AI agents for your enterprise
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Chat Interface */}
        <Card className="flex flex-col h-[calc(100vh-16rem)]">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Agent Consultant
                </CardTitle>
                <CardDescription>Powered by {currentModel?.name}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation("/builder")}
                  data-testid="button-go-to-builder"
                >
                  Open Agent Builder
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 overflow-y-auto p-6" data-testid="chat-messages">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                  data-testid={`message-${message.role}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything about building AI agents..."
                className="resize-none min-h-[60px]"
                disabled={isLoading}
                data-testid="input-chat-message"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[60px] w-[60px] flex-shrink-0"
                data-testid="button-send-message"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </Card>

        {/* Guidance Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Quick Start</CardTitle>
              <CardDescription>Common questions to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {SUGGESTED_PROMPTS.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-3"
                  onClick={() => handleSuggestedPrompt(suggestion.prompt)}
                  disabled={isLoading}
                  data-testid={`button-suggestion-${index}`}
                >
                  <div className="flex gap-3 items-start">
                    <suggestion.icon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{suggestion.title}</span>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Consultant Model</CardTitle>
              <CardDescription>AI model powering this consultation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as AIModel)}>
                <SelectTrigger data-testid="select-ai-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id} data-testid={`model-option-${model.id}`}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {currentModel && (
                <div className="space-y-3 pt-3 border-t">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Provider</div>
                    <Badge variant="outline">{currentModel.provider}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Context</div>
                      <p className="text-sm font-medium">
                        {(currentModel.contextWindow / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Cost</div>
                      <p className="text-sm font-medium">${currentModel.costPer1kTokens.toFixed(4)}/1K</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setLocation("/marketplace")}
                data-testid="button-view-templates"
              >
                Browse Agent Templates
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setLocation("/agents")}
                data-testid="button-view-agents"
              >
                View My Agents
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setMessages([]);
                  const welcomeMessage: ChatMessage = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: `Hello! I'm your AI Agent Consultant, powered by ${currentModel?.name}.\n\nI'm here to help you build effective AI agents for your enterprise. I can guide you through:\n\n• Choosing the right agent type for your use case\n• Designing effective system prompts and behaviors\n• Selecting the best tools and capabilities\n• Best practices for agent deployment\n• Troubleshooting and optimization strategies\n\nWhat would you like to build today?`,
                    timestamp: new Date(),
                  };
                  setMessages([welcomeMessage]);
                }}
                data-testid="button-clear-chat"
              >
                Start New Conversation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
