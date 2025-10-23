import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, CheckCircle2, DollarSign, TrendingUp, Activity, Clock, AlertCircle } from "lucide-react";
import { AgentStatistics, UsageData, AgentUsage } from "@shared/schema";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<AgentStatistics>({
    queryKey: ["/api/statistics"],
  });

  const { data: usageData, isLoading: usageLoading } = useQuery<UsageData[]>({
    queryKey: ["/api/statistics/usage"],
  });

  const { data: topAgents, isLoading: agentsLoading } = useQuery<AgentUsage[]>({
    queryKey: ["/api/statistics/top-agents"],
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <Activity className="h-12 w-12 animate-pulse text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your AI agent platform performance and usage
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Agents"
          value={stats?.totalAgents || 0}
          icon={Bot}
          trend={{ value: 12, isPositive: true }}
          description="from last month"
        />
        <StatCard
          title="Active Tasks"
          value={stats?.totalTasks || 0}
          icon={Activity}
          trend={{ value: 8, isPositive: true }}
          description="from last week"
        />
        <StatCard
          title="Completed Tasks"
          value={stats?.completedTasks || 0}
          icon={CheckCircle2}
          description={`${stats?.failedTasks || 0} failed`}
        />
        <StatCard
          title="Total Cost"
          value={`$${((stats?.totalCost || 0) / 100).toFixed(2)}`}
          icon={DollarSign}
          trend={{ value: -5, isPositive: true }}
          description="cost reduction"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">API Usage Over Time</CardTitle>
            <CardDescription>Daily API calls for the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {usageLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Activity className="h-8 w-8 animate-pulse text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={usageData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="apiCalls"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Task Completion Rate</CardTitle>
            <CardDescription>Daily tasks completed vs. initiated</CardDescription>
          </CardHeader>
          <CardContent>
            {usageLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Activity className="h-8 w-8 animate-pulse text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={usageData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="tasks" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Agents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Performing Agents</CardTitle>
          <CardDescription>Most used agents by execution count and success rate</CardDescription>
        </CardHeader>
        <CardContent>
          {agentsLoading ? (
            <div className="h-[200px] flex items-center justify-center">
              <Activity className="h-8 w-8 animate-pulse text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {(topAgents || []).map((agent, index) => (
                <div key={agent.agentId} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-sm font-medium">
                    #{index + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{agent.agentName}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {agent.usageCount} uses
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-chart-3" />
                          {agent.successRate}%
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {agent.avgExecutionTime}ms
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${agent.successRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Health */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Status</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">Operational</div>
            <p className="text-xs text-muted-foreground mt-1">
              99.9% uptime
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgExecutionTime || 0}ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              -15ms from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.3%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Within acceptable range
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
