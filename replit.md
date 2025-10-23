# College Prep Organizer

A comprehensive web application helping high school seniors and their parents stay organized during the college preparation journey from senior year through college move-in.

## Overview

This application provides a complete solution for managing college preparation tasks, deadlines, and documents. Built with shared access for both students and parents, it ensures nothing falls through the cracks during this critical transition period.

## Features

### Core Features (MVP)
- **Dashboard** - Overview with progress tracking, upcoming tasks, and category breakdowns
- **Task Management** - Complete checklist system with due dates, priorities, and assignments
- **Calendar View** - Visual timeline of all deadlines and milestones
- **Document Tracking** - Organize transcripts, recommendations, financial aid forms, and more
- **Shared Access** - Role-based views for students and parents
- **Progress Tracking** - Category-wise and overall completion percentages
- **Authentication** - Secure login via Replit Auth (Google, GitHub, email)
- **Dark Mode** - Full theme support with light/dark mode toggle

### Task Features
- Create, edit, and delete tasks
- Categorize by type (Admissions, Financial Aid, Housing, etc.)
- Set priorities (Low, Medium, High, Urgent)
- Assign to student or parent
- Add due dates and notes
- Mark as completed
- Filter and search functionality

### Document Features
- Track various document types
- Status tracking (Pending, Received, Submitted)
- Due date management
- Notes and descriptions
- Search and filter capabilities

## Architecture

### Frontend
- React with TypeScript
- Wouter for routing
- TanStack Query for data fetching
- Shadcn UI components with Tailwind CSS
- Date-fns for date handling
- Responsive design (mobile, tablet, desktop)

### Backend
- Express.js server
- PostgreSQL database (Neon)
- Drizzle ORM
- Replit Auth (OpenID Connect)
- Session management with PostgreSQL store

### Database Schema

**users** - User accounts via Replit Auth
- id, email, firstName, lastName, profileImageUrl
- role (student/parent)

**categories** - Task categories
- id, name, description, color, icon, sortOrder

**tasks** - College prep checklist items
- id, userId, categoryId, title, description
- dueDate, priority, status, assignedTo
- notes, completedAt

**documents** - Document tracking
- id, userId, taskId, name, description
- type, status, dueDate, notes

**sessions** - Authentication sessions

## Project Structure

```
client/
  src/
    components/
      ui/ - Shadcn UI components
      app-sidebar.tsx - Main navigation sidebar
      task-card.tsx - Task list item component
      task-dialog.tsx - Task creation/edit modal
      document-card.tsx - Document list item
      document-dialog.tsx - Document creation/edit modal
      progress-ring.tsx - Circular progress indicator
      category-progress.tsx - Category progress cards
      theme-provider.tsx - Dark mode context
      theme-toggle.tsx - Theme switcher button
    pages/
      landing.tsx - Public landing page
      dashboard.tsx - Main dashboard with overview
      tasks.tsx - Task list and management
      calendar.tsx - Calendar view of deadlines
      documents.tsx - Document tracking
      settings.tsx - User settings and preferences
    hooks/
      useAuth.ts - Authentication hook
    lib/
      queryClient.ts - TanStack Query setup
      authUtils.ts - Auth helper functions
server/
  db.ts - Database connection
  storage.ts - Data access layer
  routes.ts - API routes
  replitAuth.ts - Authentication setup
shared/
  schema.ts - Shared database schema and types
```

## API Endpoints

### Authentication
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - Logout and end session
- `GET /api/callback` - OAuth callback
- `GET /api/auth/user` - Get current user (protected)
- `PATCH /api/auth/user/role` - Update user role (protected)

### Tasks
- `GET /api/tasks` - List all user tasks (protected)
- `GET /api/tasks/stats` - Get task statistics (protected)
- `POST /api/tasks` - Create new task (protected)
- `PATCH /api/tasks/:id` - Update task (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)

### Categories
- `GET /api/categories` - List all categories

### Documents
- `GET /api/documents` - List all user documents (protected)
- `POST /api/documents` - Create new document (protected)
- `PATCH /api/documents/:id` - Update document (protected)
- `DELETE /api/documents/:id` - Delete document (protected)

## User Preferences

- **Role Selection**: Users can identify as student or parent
- **Theme**: Light or dark mode preference
- **View Preferences**: Filter and sort options per page

## Recent Changes

- **2025-10-22**: Deployment optimizations
  - Added health check endpoint at `/` for deployment health checks
  - Moved category seeding to development mode only (not production)
  - Server starts immediately and stays alive for production deployments
  - All integration requirements complete with consistent error handling

- **2025-01-22**: Initial MVP implementation
  - Complete frontend with all pages and components
  - Database schema and backend API design
  - Replit Auth integration
  - Dark mode support
  - Responsive design across all breakpoints

## Deployment

### Production Configuration
- Health check endpoint: `GET /api/health` returns `{ status: 'ok', service: 'College Prep Organizer' }`
- Frontend served at: `GET /` returns the React application HTML
- Category seeding: Only runs in development mode to prevent startup delays
- Server listens on port 5000 (configurable via PORT env variable)
- Database categories must be seeded manually in production on first deployment

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `SESSION_SECRET` - Session encryption key (auto-configured)
- `NODE_ENV` - Set to 'production' for deployment
- `PORT` - Server port (default: 5000)

## Development Notes

### Design System
- Primary color: Purple (262° 83% 58%)
- Success: Green for completed tasks
- Warning: Orange for upcoming deadlines
- Destructive: Red for overdue items
- Font: Inter (Google Fonts)
- Design philosophy: Linear-inspired productivity with Notion-like organization

### Key Design Decisions
- Sidebar navigation on desktop, bottom nav on mobile
- Card-based layouts for better visual organization
- Subtle hover states and transitions
- Consistent spacing using Tailwind's spacing scale
- Accessible color contrast ratios
- Empty states with clear CTAs

### Testing Considerations
- All interactive elements have data-testid attributes
- Auth flow requires Replit Auth setup
- Database operations use PostgreSQL transactions
- Session management with secure cookies
