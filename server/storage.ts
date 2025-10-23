import {
  type Agent,
  type InsertAgent,
  type Task,
  type InsertTask,
  type Template,
  type InsertTemplate,
  type Message,
  type InsertMessage,
  type AgentStatistics,
  type UsageData,
  type AgentUsage,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Agents
  getAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, agent: Partial<Agent>): Promise<Agent | undefined>;
  deleteAgent(id: string): Promise<boolean>;
  
  // Tasks
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<Task>): Promise<Task | undefined>;
  
  // Messages
  getMessagesByTaskId(taskId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Templates
  getTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  incrementTemplateDownloads(id: string): Promise<void>;
  
  // Statistics
  getStatistics(): Promise<AgentStatistics>;
  getUsageData(): Promise<UsageData[]>;
  getTopAgents(): Promise<AgentUsage[]>;
}

export class MemStorage implements IStorage {
  private agents: Map<string, Agent>;
  private tasks: Map<string, Task>;
  private messages: Map<string, Message>;
  private templates: Map<string, Template>;

  constructor() {
    this.agents = new Map();
    this.tasks = new Map();
    this.messages = new Map();
    this.templates = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample Agents
    const sampleAgents: Agent[] = [
      {
        id: "1",
        name: "Customer Support Pro",
        description: "Intelligent customer support agent that handles inquiries, troubleshooting, and ticket management with empathy and efficiency.",
        systemPrompt: "You are a professional customer support agent. Your goal is to help customers resolve their issues quickly and professionally. Always be empathetic, patient, and thorough in your responses.",
        source: "built-in",
        status: "active",
        capabilities: ["customer-service", "troubleshooting", "ticket-management"],
        tools: ["web-search", "api-call"],
        category: "Support",
        icon: "CS",
        createdBy: "AgentOS",
        rating: 5,
        usageCount: 245,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
      {
        id: "2",
        name: "Data Analyst",
        description: "Advanced data analysis agent that processes datasets, generates insights, and creates visualizations from complex data.",
        systemPrompt: "You are an expert data analyst. Analyze data thoroughly, identify patterns and trends, and provide actionable insights. Use statistical methods and create clear visualizations.",
        source: "built-in",
        status: "active",
        capabilities: ["data-analysis", "statistics", "visualization"],
        tools: ["data-analysis", "code-execution"],
        category: "Analytics",
        icon: "DA",
        createdBy: "AgentOS",
        rating: 5,
        usageCount: 189,
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-10"),
      },
      {
        id: "3",
        name: "Sales Assistant",
        description: "AI-powered sales agent that qualifies leads, schedules meetings, and provides product recommendations based on customer needs.",
        systemPrompt: "You are a sales assistant focused on helping customers find the right solutions. Ask qualifying questions, understand needs, and recommend appropriate products or services.",
        source: "community",
        status: "active",
        capabilities: ["lead-qualification", "product-recommendation"],
        tools: ["web-search", "api-call"],
        category: "Sales",
        icon: "SA",
        createdBy: "SalesTeam",
        rating: 4,
        usageCount: 167,
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-01"),
      },
      {
        id: "4",
        name: "Code Reviewer",
        description: "Automated code review agent that analyzes code quality, identifies bugs, suggests improvements, and enforces best practices.",
        systemPrompt: "You are an experienced code reviewer. Analyze code for bugs, security issues, performance problems, and adherence to best practices. Provide constructive feedback.",
        source: "user-created",
        status: "testing",
        capabilities: ["code-review", "security-analysis"],
        tools: ["code-execution", "file-access"],
        category: "Development",
        icon: "CR",
        createdBy: "DevTeam",
        rating: 4,
        usageCount: 92,
        createdAt: new Date("2024-02-10"),
        updatedAt: new Date("2024-02-10"),
      },
    ];

    sampleAgents.forEach(agent => this.agents.set(agent.id, agent));

    // Sample Templates
    const sampleTemplates: Template[] = [
      {
        id: "t1",
        name: "Email Marketing Assistant",
        description: "Create engaging email campaigns, write compelling subject lines, and optimize for conversions. Perfect for marketing teams.",
        category: "Marketing",
        agentConfig: {
          systemPrompt: "You are an email marketing expert. Create compelling email content that drives engagement and conversions.",
          tools: ["web-search", "api-call"],
          capabilities: ["email-writing", "copywriting"],
        },
        icon: "EM",
        downloads: 1240,
        rating: 5,
        createdBy: "Marketing Pro",
        featured: true,
        createdAt: new Date("2024-01-05"),
      },
      {
        id: "t2",
        name: "Meeting Scheduler",
        description: "Intelligent scheduling agent that finds optimal meeting times, sends invites, and manages calendar conflicts automatically.",
        category: "Operations",
        agentConfig: {
          systemPrompt: "You help schedule meetings efficiently by finding optimal times and managing calendars.",
          tools: ["api-call"],
          capabilities: ["scheduling", "calendar-management"],
        },
        icon: "MS",
        downloads: 987,
        rating: 5,
        createdBy: "ProductivityHub",
        featured: true,
        createdAt: new Date("2024-01-08"),
      },
      {
        id: "t3",
        name: "Content Moderator",
        description: "Automated content moderation for user-generated content, detecting inappropriate material and ensuring community guidelines compliance.",
        category: "Support",
        agentConfig: {
          systemPrompt: "You moderate content to ensure it follows community guidelines and is appropriate.",
          tools: ["web-search"],
          capabilities: ["content-moderation", "safety"],
        },
        icon: "CM",
        downloads: 756,
        rating: 4,
        createdBy: "SafetyFirst",
        featured: false,
        createdAt: new Date("2024-01-12"),
      },
      {
        id: "t4",
        name: "Research Assistant",
        description: "Comprehensive research agent that gathers information, summarizes findings, and provides cited sources for academic or business research.",
        category: "Analytics",
        agentConfig: {
          systemPrompt: "You are a research assistant that helps gather, analyze, and summarize information from various sources.",
          tools: ["web-search", "file-access"],
          capabilities: ["research", "summarization"],
        },
        icon: "RA",
        downloads: 654,
        rating: 5,
        createdBy: "ResearchLab",
        featured: false,
        createdAt: new Date("2024-01-20"),
      },
      {
        id: "t5",
        name: "Social Media Manager",
        description: "Manage social media presence with automated posting, engagement tracking, and content suggestions tailored to your audience.",
        category: "Marketing",
        agentConfig: {
          systemPrompt: "You manage social media content and engagement, creating posts that resonate with the target audience.",
          tools: ["web-search", "api-call", "image-generation"],
          capabilities: ["social-media", "content-creation"],
        },
        icon: "SM",
        downloads: 543,
        rating: 4,
        createdBy: "SocialGuru",
        featured: false,
        createdAt: new Date("2024-02-01"),
      },
      {
        id: "t6",
        name: "Bug Triage Agent",
        description: "Automatically categorize and prioritize bug reports, assign severity levels, and route to appropriate teams for faster resolution.",
        category: "Development",
        agentConfig: {
          systemPrompt: "You triage bug reports by analyzing severity, impact, and priority to help development teams respond efficiently.",
          tools: ["code-execution", "api-call"],
          capabilities: ["bug-triage", "prioritization"],
        },
        icon: "BT",
        downloads: 432,
        rating: 4,
        createdBy: "DevOps Team",
        featured: false,
        createdAt: new Date("2024-02-05"),
      },
    ];

    sampleTemplates.forEach(template => this.templates.set(template.id, template));

    // Sample Tasks
    const sampleTasks: Task[] = [
      {
        id: "task1",
        title: "Customer Inquiry - Product Features",
        description: "Help customer understand premium plan features",
        status: "completed",
        agentIds: ["1"],
        progress: 100,
        executionTime: 2340,
        cost: 15,
        createdAt: new Date("2024-02-20T10:30:00"),
        completedAt: new Date("2024-02-20T10:32:20"),
      },
      {
        id: "task2",
        title: "Sales Data Analysis Q1 2024",
        description: "Analyze quarterly sales performance and trends",
        status: "completed",
        agentIds: ["2"],
        progress: 100,
        executionTime: 5670,
        cost: 42,
        createdAt: new Date("2024-02-19T14:15:00"),
        completedAt: new Date("2024-02-19T14:20:40"),
      },
      {
        id: "task3",
        title: "Lead Qualification - Enterprise Client",
        description: "Qualify new enterprise lead from contact form",
        status: "running",
        agentIds: ["3"],
        progress: 65,
        cost: 8,
        createdAt: new Date("2024-02-21T09:00:00"),
      },
      {
        id: "task4",
        title: "Code Review - Authentication Module",
        description: "Review pull request for new auth implementation",
        status: "pending",
        agentIds: ["4"],
        progress: 0,
        cost: 0,
        createdAt: new Date("2024-02-21T11:30:00"),
      },
    ];

    sampleTasks.forEach(task => this.tasks.set(task.id, task));
  }

  // Agent methods
  async getAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = randomUUID();
    const agent: Agent = {
      ...insertAgent,
      id,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.agents.set(id, agent);
    return agent;
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | undefined> {
    const agent = this.agents.get(id);
    if (!agent) return undefined;

    const updatedAgent = {
      ...agent,
      ...updates,
      updatedAt: new Date(),
    };
    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }

  async deleteAgent(id: string): Promise<boolean> {
    return this.agents.delete(id);
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      ...insertTask,
      id,
      createdAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask = {
      ...task,
      ...updates,
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  // Message methods
  async getMessagesByTaskId(taskId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.taskId === taskId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  // Template methods
  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values()).sort((a, b) => {
      // Featured first, then by downloads
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (b.downloads || 0) - (a.downloads || 0);
    });
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const template: Template = {
      ...insertTemplate,
      id,
      downloads: 0,
      createdAt: new Date(),
    };
    this.templates.set(id, template);
    return template;
  }

  async incrementTemplateDownloads(id: string): Promise<void> {
    const template = this.templates.get(id);
    if (template) {
      template.downloads = (template.downloads || 0) + 1;
      this.templates.set(id, template);
    }
  }

  // Statistics methods
  async getStatistics(): Promise<AgentStatistics> {
    const agents = await this.getAgents();
    const tasks = await this.getTasks();

    const totalAgents = agents.length;
    const activeAgents = agents.filter(a => a.status === "active").length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "completed").length;
    const failedTasks = tasks.filter(t => t.status === "failed").length;
    const totalCost = tasks.reduce((sum, t) => sum + (t.cost || 0), 0);
    const executionTimes = tasks.filter(t => t.executionTime).map(t => t.executionTime!);
    const avgExecutionTime = executionTimes.length > 0
      ? Math.round(executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length)
      : 0;
    const apiCalls = totalTasks * 3; // Estimate

    return {
      totalAgents,
      activeAgents,
      totalTasks,
      completedTasks,
      failedTasks,
      totalCost,
      avgExecutionTime,
      apiCalls,
    };
  }

  async getUsageData(): Promise<UsageData[]> {
    // Generate sample usage data for the past 7 days
    const data: UsageData[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      data.push({
        date: dateStr,
        apiCalls: Math.floor(Math.random() * 500) + 200,
        cost: Math.floor(Math.random() * 50) + 20,
        tasks: Math.floor(Math.random() * 30) + 10,
      });
    }
    
    return data;
  }

  async getTopAgents(): Promise<AgentUsage[]> {
    const agents = await this.getAgents();
    
    return agents
      .filter(a => a.usageCount && a.usageCount > 0)
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 5)
      .map(agent => ({
        agentId: agent.id,
        agentName: agent.name,
        usageCount: agent.usageCount || 0,
        successRate: Math.floor(Math.random() * 20) + 80, // 80-100%
        avgExecutionTime: Math.floor(Math.random() * 2000) + 500,
        totalCost: Math.floor(Math.random() * 100) + 50,
      }));
  }
}

export const storage = new MemStorage();
