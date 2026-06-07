# Chronos - Personal Time Operating System

Chronos is a personal time operating system designed to combine task planning, scheduling, calendar management, and productivity tracking into a single, cohesive dashboard. It features a premium, minimalist, dark-mode-first interface inspired by modern design principles.

## Core Features

- **Interactive Dashboard**: A three-panel layout featuring Today's Timeline, Weekly Flow, and Chronos Grid.
- **Task Management**: Full CRUD operations with priority levels (Critical, High, Medium, Low), task categorization, and source attribution (Chronos, Google Calendar, Microsoft Teams).
- **Weekly Flow**: A visualized weekly overview displaying workload percentage, task counts, and priority markers.
- **Chronos Grid**: A contribution-style monthly heatmap tracking daily productivity intensity and focus scores.
- **AI Scheduler Interface**: An intelligent scheduling assistant capable of breaking down projects and goals into actionable, scheduled subtasks.
- **Productivity Analytics**: Detailed metrics including daily scores, streak tracking, weekly consistency, and most productive hours.
- **Local Persistence**: State management leveraging local storage for instant, offline-capable data persistence.

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Motion (formerly Framer Motion)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **State Management**: React Context API

## Prerequisites

- Node.js 18.17 or later
- npm (or equivalent package manager)

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Banisher2005/Chronos.git
   cd Chronos/chrono-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open the application:**
   Navigate to `http://localhost:3000` in your web browser.

## Project Structure

```text
src/
├── app/                  # Next.js app router pages and layouts
│   ├── ai/               # AI Scheduler page
│   ├── analytics/        # Productivity analytics page
│   ├── calendar/         # Monthly calendar view
│   ├── grid/             # Full-page Chronos Grid heatmap
│   ├── settings/         # User preferences and data management
│   ├── globals.css       # Global stylesheet and Tailwind configuration
│   ├── layout.tsx        # Root layout with sidebar navigation
│   └── page.tsx          # Main three-panel dashboard
├── components/           # Reusable UI components
├── lib/                  # Core utilities, state management, and types
```

## License

This project is licensed under the MIT License.
