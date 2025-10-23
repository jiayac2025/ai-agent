import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task, Agent } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Clock, CheckCircle2, XCircle, Play, Loader2, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusIcons = {
  pending: Clock,
  running: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
  cancelled: XCircle,
};

const statusColors = {
  pending: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  running: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  completed: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground border-muted",
};

export default function Tasks() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [taskInput, setTaskInput] = useState("");

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: agents } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const filteredTasks = (tasks || []).filter((task) => {
    return task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCreateTask = () => {
    if (selectedAgent) {
      setLocation(`/tasks/execute?agentId=${selectedAgent}`);
      setCreateDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            View and manage agent execution tasks
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-task">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Select an agent and provide initial input to start a new task
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="agent">Select Agent</Label>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger id="agent" data-testid="select-task-agent">
                    <SelectValue placeholder="Choose an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {(agents || []).filter(a => a.status === "active").map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="input">Task Description (Optional)</Label>
                <Textarea
                  id="input"
                  placeholder="Describe what you want the agent to do..."
                  rows={3}
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  data-testid="input-task-description"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateTask}
                disabled={!selectedAgent}
                data-testid="button-start-task"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-testid="input-search-tasks"
        />
      </div>

      {/* Tasks List */}
      {tasksLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-3/4 bg-muted rounded" />
                <div className="h-4 w-1/2 bg-muted rounded mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-3 w-full bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-3">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No tasks found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "Try adjusting your search" : "Create a new task to get started"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2" data-testid="tasks-grid">
          {filteredTasks.map((task) => {
            const StatusIcon = statusIcons[task.status];
            return (
              <Card
                key={task.id}
                className="hover-elevate cursor-pointer"
                onClick={() => setLocation(`/tasks/${task.id}`)}
                data-testid={`task-card-${task.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base" data-testid={`task-title-${task.id}`}>
                      {task.title}
                    </CardTitle>
                    <Badge variant="outline" className={cn("text-xs", statusColors[task.status])}>
                      <StatusIcon className={cn("h-3 w-3 mr-1", task.status === "running" && "animate-spin")} />
                      {task.status}
                    </Badge>
                  </div>
                  {task.description && (
                    <CardDescription className="line-clamp-2">
                      {task.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {task.progress !== undefined && task.progress > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{task.progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {task.createdAt ? format(new Date(task.createdAt), "MMM d, yyyy") : "Unknown"}
                    </span>
                  </div>
                  {task.executionTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{task.executionTime}ms</span>
                    </div>
                  )}
                  {task.cost !== undefined && task.cost > 0 && (
                    <span>${(task.cost / 100).toFixed(2)}</span>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
