# College Prep Organizer - Design Guidelines

## Design Approach
**Selected System:** Linear-inspired productivity design with Notion-like organization patterns
**Rationale:** This is a utility-focused application where clarity, efficiency, and information hierarchy are paramount. The Linear design system excels at task visualization and progress tracking, while Notion's organizational patterns work well for document management and categorization.

**Core Principles:**
- Clarity over decoration: Every element serves a functional purpose
- Information density balanced with breathing room
- Consistent, predictable interactions
- Seamless experience across desktop, tablet, and mobile

---

## Color Palette

**Light Mode:**
- **Background:** 0 0% 100% (pure white)
- **Surface:** 240 5% 96% (off-white cards)
- **Border:** 240 6% 90% (subtle dividers)
- **Primary:** 262 83% 58% (vibrant purple - actions, CTAs)
- **Primary Hover:** 262 90% 50%
- **Text Primary:** 240 10% 10% (near-black)
- **Text Secondary:** 240 5% 45% (muted gray)
- **Success:** 142 76% 36% (task completion)
- **Warning:** 38 92% 50% (approaching deadlines)
- **Danger:** 0 84% 60% (overdue items)

**Dark Mode:**
- **Background:** 240 10% 8% (deep dark)
- **Surface:** 240 8% 12% (card backgrounds)
- **Border:** 240 6% 18% (subtle dividers)
- **Primary:** 262 90% 65% (lighter purple for dark bg)
- **Primary Hover:** 262 95% 70%
- **Text Primary:** 240 5% 96% (near-white)
- **Text Secondary:** 240 5% 65% (muted light gray)
- **Success/Warning/Danger:** Same hues, adjusted lightness for dark mode

---

## Typography

**Font Stack:**
- **Primary:** Inter (Google Fonts) - body text, UI elements, forms
- **Headings:** Inter (600-700 weight) - maintains consistency

**Scale:**
- **Display (h1):** text-4xl (36px) font-semibold - page titles
- **Heading (h2):** text-2xl (24px) font-semibold - section headers
- **Subheading (h3):** text-xl (20px) font-medium - category titles
- **Body:** text-base (16px) - primary content
- **Small:** text-sm (14px) - secondary info, labels
- **Tiny:** text-xs (12px) - timestamps, metadata

**Line Heights:**
- Display/Headings: leading-tight (1.25)
- Body text: leading-relaxed (1.625)
- UI elements: leading-normal (1.5)

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 4, 6, 8, 12, 16** for consistency
- Component padding: p-4, p-6, p-8
- Section gaps: gap-4, gap-6, gap-8
- Margins: m-2, m-4, m-8, m-12

**Grid Structure:**
- **Desktop:** Max-width container (max-w-7xl) with sidebar navigation
- **Tablet:** Collapsible sidebar, full-width content
- **Mobile:** Bottom navigation, stacked single-column layout

**Responsive Breakpoints:**
- Mobile: Base (< 768px)
- Tablet: md (768px+)
- Desktop: lg (1024px+)
- Wide: xl (1280px+)

---

## Component Library

### Navigation
**Desktop Sidebar:**
- Fixed left sidebar (w-64), full height
- Navigation items with icons (Heroicons) + labels
- Active state: Primary color background, white text
- Hover: Subtle background tint (primary 10% opacity)
- User profile at bottom with student/parent toggle

**Mobile Bottom Nav:**
- Fixed bottom bar with 4-5 primary actions
- Icon-only with active state indicator
- Hamburger menu for secondary navigation

### Task Components
**Task List Item:**
- Checkbox (left), title, due date, priority badge (right)
- Hover: Slight elevation (shadow-sm)
- Completed: Strikethrough text, reduced opacity
- Height: min-h-12, padding p-3

**Task Card (Detail View):**
- White/dark surface with border
- Header: Title, priority, assigned to (student/parent)
- Body: Description, due date, category tags
- Footer: Notes, attachments, completion toggle
- Padding: p-6

### Progress Indicators
**Category Progress Bars:**
- Height: h-2, rounded-full
- Background: Muted gray
- Fill: Primary color gradient
- Label: Percentage text-sm above bar
- Categories: Admissions (35%), Financial Aid (20%), Housing (15%), etc.

**Overall Dashboard Card:**
- Large circular progress indicator (center)
- Percentage text-5xl font-bold
- Surrounding: 4-6 category mini-cards in grid
- Card elevation: shadow-md

### Calendar View
**Month Grid:**
- 7-column grid (Sunday-Saturday)
- Date cells: p-2, min-h-20
- Today: Border with primary color
- Tasks: Small colored dots indicating category
- Responsive: Stacks to list view on mobile

**Agenda View:**
- Chronological list grouped by date
- Date headers: Sticky positioned
- Task items: Compact with expand option

### Document Tracker
**Document Cards:**
- Grid layout (2-3 columns desktop, 1 mobile)
- Icon representing document type
- Title, status badge, upload date
- Actions: View, Download, Delete icons
- Upload zone: Dashed border, drag-and-drop

### Forms & Inputs
**Text Inputs:**
- Border: 1px solid border color
- Focus: 2px primary border, no ring
- Height: h-10 for single-line, auto for textarea
- Padding: px-3 py-2
- Dark mode: Dark surface background, light text

**Buttons:**
- Primary: bg-primary, text-white, px-6 py-2, rounded-md
- Secondary: border with primary color, transparent bg
- Ghost: No background, primary text color
- Sizes: Default (h-10), Small (h-8), Large (h-12)

**Checkboxes/Radio:**
- Custom styled with primary color
- Size: w-5 h-5
- Checked: Filled primary with white checkmark

### Modal/Overlay
**Task Detail Modal:**
- Max-width: max-w-2xl
- Background: Surface color with border
- Backdrop: Dark overlay (bg-black/50)
- Padding: p-6
- Close button: Top-right corner

**Notification Toast:**
- Bottom-right position (mobile: bottom-center)
- Width: max-w-sm
- Auto-dismiss after 4 seconds
- Success/Warning/Error color coding

---

## Animations

**Micro-interactions (minimal):**
- Hover transitions: 150ms ease
- Modal fade-in: 200ms ease-out
- Task completion: Subtle scale + fade
- Progress bar fills: 300ms ease-in-out

**NO animations for:**
- Page transitions
- List reordering
- Scroll-triggered effects

---

## Images

**Profile Avatars:**
- Student and parent profile photos
- Size: 40px default, 80px in profile settings
- Fallback: Colored circle with initials

**Document Thumbnails:**
- PDF/Image previews in document tracker
- Size: 120x120 aspect-square
- Placeholder: Document icon if no preview

**Empty States:**
- Illustration placeholders for empty task lists
- Style: Simple line drawings, primary color accent
- Size: max-w-xs centered

**No hero images** - This is a utility app, not a marketing site

---

## Key UX Patterns

**Shared Access Model:**
- Clear visual indicator of student vs. parent view
- Toggle switch in header/sidebar
- Color-coded assignments (who's responsible)

**Smart Defaults:**
- Pre-populated checklist based on college prep timeline
- Auto-categorization of tasks
- Deadline suggestions based on typical timelines

**Mobile Optimization:**
- Swipe gestures for task completion
- Collapsible sections to reduce scrolling
- Bottom sheet for quick actions
- Thumb-friendly tap targets (min 44x44px)

**Accessibility:**
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators (2px primary outline)
- Sufficient color contrast (WCAG AA minimum)
- Screen reader friendly task status announcements