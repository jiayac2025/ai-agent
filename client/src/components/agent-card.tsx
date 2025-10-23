import { Agent } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, MoreVertical, Play, Settings2, Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AgentCardProps {
  agent: Agent;
  onEdit?: () => void;
  onDelete?: () => void;
  onExecute?: () => void;
  showActions?: boolean;
}

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

export function AgentCard({ agent, onEdit, onDelete, onExecute, showActions = true }: AgentCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="hover-elevate group" data-testid={`agent-card-${agent.id}`}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {agent.icon || getInitials(agent.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base" data-testid={`agent-name-${agent.id}`}>
                {agent.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={cn("text-xs", sourceColors[agent.source])}>
                  {agent.source}
                </Badge>
                <Badge variant="outline" className={cn("text-xs", statusColors[agent.status])}>
                  {agent.status}
                </Badge>
              </div>
            </div>
          </div>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid={`agent-menu-${agent.id}`}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onExecute && (
                  <DropdownMenuItem onClick={onExecute} data-testid={`agent-execute-${agent.id}`}>
                    <Play className="h-4 w-4 mr-2" />
                    Execute
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit} data-testid={`agent-edit-${agent.id}`}>
                    <Settings2 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-destructive" data-testid={`agent-delete-${agent.id}`}>
                    <Bot className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <CardDescription className="line-clamp-2 text-sm">
          {agent.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {agent.category && (
            <div className="text-xs text-muted-foreground">
              Category: <span className="text-foreground">{agent.category}</span>
            </div>
          )}
          {agent.tools && agent.tools.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {agent.tools.slice(0, 3).map((tool) => (
                <Badge key={tool} variant="secondary" className="text-xs">
                  {tool}
                </Badge>
              ))}
              {agent.tools.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{agent.tools.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>{agent.usageCount || 0} uses</span>
          </div>
          {agent.rating !== undefined && agent.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-chart-4 text-chart-4" />
              <span>{agent.rating}/5</span>
            </div>
          )}
        </div>
        {agent.createdBy && (
          <div className="text-xs">by {agent.createdBy}</div>
        )}
      </CardFooter>
    </Card>
  );
}
