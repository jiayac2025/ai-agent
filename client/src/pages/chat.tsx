import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Bot, User, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
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
    id: "gpt-4",
    name: "GPT-4",
    provider: "OpenAI",
    description: "Advanced reasoning and creativity",
    contextWindow: 8192,
    costPer1kTokens: 0.06,
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    description: "Fast and efficient for most tasks",
    contextWindow: 16384,
    costPer1kTokens: 0.002,
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
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    description: "Most intelligent Claude model",
    contextWindow: 200000,
    costPer1kTokens: 0.075,
  },
  {
    id: "claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    description: "Fastest Claude model",
    contextWindow: 200000,
    costPer1kTokens: 0.00125,
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    description: "Google's most capable AI model",
    contextWindow: 32768,
    costPer1kTokens: 0.00125,
  },
  {
    id: "llama-3-70b",
    name: "Llama 3 70B",
    provider: "Meta",
    description: "Open source, powerful reasoning",
    contextWindow: 8192,
    costPer1kTokens: 0.0009,
  },
];

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const [selectedModel, setSelectedModel] = useState<AIModel>("gpt-4-turbo");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const currentModel = AI_MODELS.find((m) => m.id === selectedModel);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (in real implementation, this would call the selected AI model's API)
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `This is a simulated response from ${currentModel?.name}. In a production environment, this would be an actual response from the ${currentModel?.provider} API.\n\nYour message was: "${userMessage.content}"`,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Chat
        </h1>
        <p className="text-muted-foreground mt-2">
          Select an AI model and start chatting directly
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Model Selection Sidebar */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Model Settings
            </CardTitle>
            <CardDescription>Choose your AI model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
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
            </div>

            {currentModel && (
              <div className="space-y-3 pt-4 border-t">
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Provider</div>
                  <Badge variant="outline">{currentModel.provider}</Badge>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Description</div>
                  <p className="text-sm">{currentModel.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Context</div>
                    <p className="text-sm font-medium">
                      {(currentModel.contextWindow / 1000).toFixed(0)}K tokens
                    </p>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Cost</div>
                    <p className="text-sm font-medium">${currentModel.costPer1kTokens.toFixed(4)}/1K</p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setMessages([]);
                }}
                data-testid="button-clear-chat"
              >
                Clear Chat
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="flex flex-col h-[calc(100vh-16rem)]">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Chat with {currentModel?.name}</CardTitle>
                <CardDescription>Powered by {currentModel?.provider}</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {messages.length} messages
              </Badge>
            </div>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 overflow-y-auto p-6" data-testid="chat-messages">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <Bot className="h-16 w-16 text-muted-foreground/40" />
                <div>
                  <h3 className="text-lg font-semibold">Start a conversation</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ask anything and get intelligent responses from {currentModel?.name}
                  </p>
                </div>
              </div>
            ) : (
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
            )}
          </CardContent>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Message ${currentModel?.name}...`}
                className="resize-none min-h-[60px]"
                disabled={isLoading}
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSend}
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
      </div>
    </div>
  );
}
