# Enterprise AI Agent Management Platform - Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based with Enterprise SaaS Patterns
- **Primary References:** Linear (clean technical aesthetic), Notion (flexible content organization), Retool (enterprise dashboards)
- **Key Principles:** Professional clarity, data-first hierarchy, technical sophistication, workflow transparency

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background Base: 222 14% 8%
- Surface: 222 14% 11%
- Surface Elevated: 222 14% 14%
- Border Subtle: 222 14% 18%
- Border: 222 14% 24%

**Semantic Colors:**
- Primary Brand: 262 83% 58% (vibrant purple for CTAs, active states)
- Success: 142 76% 36% (agent active, completed tasks)
- Warning: 38 92% 50% (pending, review needed)
- Error: 0 84% 60% (failed tasks, errors)
- Info: 199 89% 48% (neutral information)

**Text Hierarchy:**
- Primary Text: 210 20% 98%
- Secondary Text: 215 20% 65%
- Tertiary Text: 215 16% 47%

### B. Typography

**Font System:**
- Primary: Inter (via Google Fonts) - all UI text
- Monospace: JetBrains Mono - code snippets, API responses, technical data

**Scale:**
- Display: text-4xl font-bold (agent names, page headers)
- Heading: text-2xl font-semibold (section titles)
- Subheading: text-lg font-medium (card headers)
- Body: text-base (standard content)
- Small: text-sm (metadata, timestamps)
- Tiny: text-xs (labels, tags)

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section spacing: space-y-6, space-y-8
- Card gaps: gap-4, gap-6
- Container margins: mx-4, mx-6

**Grid Structure:**
- Dashboard: 12-column grid (grid-cols-12)
- Cards: 2-3 column layouts on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Agent marketplace: 4-column masonry grid on large screens

**Container Widths:**
- Full app: max-w-screen-2xl
- Content areas: max-w-7xl
- Forms: max-w-2xl
- Chat: max-w-4xl

### D. Component Library

**Navigation:**
- Left sidebar (w-64): Logo, primary nav, user profile at bottom
- Top header (h-16): Breadcrumbs, global search, notifications, user menu
- Persistent navigation across all pages with active state indicators

**Admin Dashboard:**
- Stats cards grid: Key metrics (total agents, active tasks, API calls, costs) with trend indicators
- Activity timeline: Recent agent deployments, task completions
- Usage charts: Line/bar charts for API usage over time
- System health monitors: Status indicators for services

**Agent Builder:**
- Multi-step form layout with progress indicator
- Left panel: Configuration form sections (collapsible accordions)
- Right panel: Live preview of agent card
- Form sections: Basic info, system prompt (textarea with character count), capabilities (checkbox grid), tools (multi-select with search), I/O schema (JSON editor)
- Test panel: Chat interface for agent testing with sample inputs

**Agent Marketplace:**
- Filter sidebar: Source type, category, capabilities
- Grid of agent cards with hover effects showing quick stats
- Agent card: Icon/avatar, name, description (2 lines), creator badge, download/install count, rating
- Detail modal: Full description, configuration preview, reviews, install button

**Agent Management:**
- Table view with sortable columns: Name, type, status, created date, usage, cost
- Row actions: Edit, duplicate, delete, view analytics
- Bulk actions toolbar for multiple selection
- Source filters: Built-in, My Agents, Community

**Multi-Agent Orchestration:**
- Canvas area: Node-based workflow editor
- Node types: Start, Agent, Condition, End (distinct shapes/colors)
- Connection lines: Bezier curves with directional arrows
- Side panel: Node configuration when selected
- Top toolbar: Save, run, validate workflow

**Task Execution Chat:**
- Two-column layout: Chat (main) + Task details sidebar
- Message bubbles: User (right-aligned, primary color), Agent (left-aligned, surface color with agent avatar)
- Agent collaboration indicators: Show which agent is responding
- Progress indicators: Subtasks, intermediate steps
- Code blocks: Syntax highlighted with copy button
- Action buttons: Retry, stop execution, export conversation

**Data Visualization:**
- Use Chart.js or Recharts for graphs
- Color-coded metrics aligned with semantic colors
- Tooltips on hover for detailed information
- Responsive scaling for different viewport sizes

**Forms & Inputs:**
- Consistent form field styling with labels above inputs
- Input backgrounds: Slightly lighter than surface (222 14% 16%)
- Focus states: Primary color border with subtle glow
- Validation states: Inline error messages in error color

### E. Animations

**Strategic Motion (Minimal):**
- Page transitions: Subtle fade-in (200ms)
- Modal/drawer entry: Slide + fade (250ms)
- Card hover: Subtle lift with shadow (150ms)
- Button press: Scale down (100ms)
- No scroll-triggered animations
- No workflow canvas auto-animations

## Additional Specifications

**Icons:** Font Awesome 6 (via CDN) - use regular and solid variants
- Navigation: Solid style
- Actions: Regular style for consistency

**Empty States:**
- Illustrations or icons with helpful text
- Primary CTA to guide next action
- Examples: "No agents yet" → "Create your first agent"

**Loading States:**
- Skeleton screens for data-heavy pages
- Spinner for quick actions
- Progress bars for multi-step processes

**Accessibility:**
- Dark mode optimized for readability
- All interactive elements keyboard navigable
- ARIA labels for complex components
- Minimum contrast ratio of 4.5:1

**Images:**
- Agent avatars: Circular, 40px standard size, with fallback initials
- Marketplace thumbnails: 16:9 aspect ratio preview images
- No hero images (utility-focused application)
- Use placeholder API (like UI Avatars) for agent icons