import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Agent, Message } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2, CheckCircle2, Clock, DollarSign, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearch } from "wouter";

export default function TaskExecute() {
  const searchParams = new URLSearchParams(useSearch());
  const agentId = searchParams.get("agentId");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [taskMetrics, setTaskMetrics] = useState({
    startTime: Date.now(),
    messageCount: 0,
    estimatedCost: 0,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: agent } = useQuery<Agent>({
    queryKey: ["/api/agents", agentId],
    enabled: !!agentId,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !agent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      taskId: "current",
      role: "user",
      content: input,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    // Simulate agent response
    setTimeout(() => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        taskId: "current",
        agentId: agent.id,
        role: "agent",
        content: `I understand you want me to ${input}. As ${agent.name}, I'll help you with that.\n\nBased on my configuration, I can:\n${agent.tools?.map(t => `- Use ${t}`).join('\n') || '- Process your request'}\n\nLet me work on this for you...`,
        metadata: {
          agentName: agent.name,
          processingTime: Math.floor(Math.random() * 500) + 200,
        },
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, agentMessage]);
      setIsProcessing(false);
      setTaskMetrics((prev) => ({
        ...prev,
        messageCount: prev.messageCount + 2,
        estimatedCost: prev.estimatedCost + 0.05,
      }));
    }, 1500);
  };

  const elapsedTime = Math.floor((Date.now() - taskMetrics.startTime) / 1000);

  if (!agentId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-8 max-w-md">
          <div className="text-center space-y-3">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No Agent Selected</h3>
            <p className="text-sm text-muted-foreground">
              Please select an agent to start a task execution
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="page-title">Task Execution</h1>
          {agent && (
            <p className="text-sm text-muted-foreground mt-1">
              Running with {agent.name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/20">
            <Activity className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4 flex-1 min-h-0">
        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="border-b">
              <CardTitle className="text-base">Conversation</CardTitle>
              <CardDescription>
                Interact with your AI agent to complete tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4" data-testid="chat-messages">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3 max-w-md">
                    <Bot className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
                    <h3 className="text-lg font-semibold">Start a Conversation</h3>
                    <p className="text-sm text-muted-foreground">
                      Send a message to begin interacting with {agent?.name || "the agent"}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                      data-testid={`message-${message.role}-${message.id}`}
                    >
                      {message.role === "agent" && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {agent?.name.slice(0, 2).toUpperCase() || "AI"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "rounded-lg px-4 py-3 max-w-[80%]",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.metadata?.processingTime && (
                          <p className="text-xs opacity-70 mt-2">
                            Processed in {message.metadata.processingTime}ms
                          </p>
                        )}
                      </div>
                      {message.role === "user" && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-muted text-xs">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {agent?.name.slice(0, 2).toUpperCase() || "AI"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg px-4 py-3 bg-muted">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </CardContent>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="resize-none"
                  rows={2}
                  disabled={isProcessing}
                  data-testid="input-message"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isProcessing}
                  size="icon"
                  className="h-auto"
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Task Details Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Agent Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {agent && (
                <>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {agent.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{agent.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{agent.category}</p>
                    </div>
                  </div>
                  {agent.tools && agent.tools.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Available Tools:</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.tools.map((tool) => (
                          <Badge key={tool} variant="secondary" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Task Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Duration</span>
                </div>
                <span className="text-sm font-medium">{elapsedTime}s</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <span>Messages</span>
                </div>
                <span className="text-sm font-medium">{taskMetrics.messageCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Est. Cost</span>
                </div>
                <span className="text-sm font-medium">${taskMetrics.estimatedCost.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Task Status</span>
                  <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                    In Progress
                  </Badge>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary w-1/3 transition-all" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
