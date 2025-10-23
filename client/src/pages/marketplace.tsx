import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Template } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Download, Star, TrendingUp, Filter, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

const categories = ["All", "Support", "Sales", "Analytics", "Marketing", "Development", "Operations"];
const sortOptions = ["Featured", "Most Downloaded", "Highest Rated", "Newest"];

export default function Marketplace() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Featured");

  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const installTemplateMutation = useMutation({
    mutationFn: async (template: Template) => {
      return await apiRequest("POST", "/api/agents/from-template", { templateId: template.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Template installed",
        description: "Agent created successfully from template.",
      });
    },
    onError: () => {
      toast({
        title: "Installation failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const filteredTemplates = (templates || [])
    .filter((template) => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "Most Downloaded") return (b.downloads || 0) - (a.downloads || 0);
      if (sortBy === "Highest Rated") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "Featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return 0;
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">Agent Marketplace</h1>
        <p className="text-muted-foreground mt-1">
          Discover and install pre-built AI agents from the community
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-templates"
          />
        </div>
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[160px]" data-testid="select-category">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]" data-testid="select-sort">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-5/6 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-3">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No templates found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="templates-grid">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className={cn(
                "hover-elevate group",
                template.featured && "border-primary"
              )}
              data-testid={`template-card-${template.id}`}
            >
              <CardHeader className="space-y-3">
                {template.featured && (
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/20">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {template.icon || template.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate" data-testid={`template-name-${template.id}`}>
                      {template.name}
                    </CardTitle>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {template.category}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    <span>{template.downloads || 0}</span>
                  </div>
                  {template.rating !== undefined && template.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-chart-4 text-chart-4" />
                      <span>{template.rating}/5</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t pt-4">
                <span className="text-xs text-muted-foreground">
                  by {template.createdBy}
                </span>
                <Button
                  size="sm"
                  onClick={() => installTemplateMutation.mutate(template)}
                  disabled={installTemplateMutation.isPending}
                  data-testid={`button-install-${template.id}`}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Install
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
