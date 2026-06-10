<div align="center">
  
  # Chrono v1.1
  
  **AI-powered personal time operating system.** <br>
  An intelligent, premium productivity platform designed to replace fragmented calendars, task lists, and focus timers with a single, visually stunning interface.
  
  Installable on all devices as a Progressive Web App (PWA).

  [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
  
  [**View Demo**](https://chronos-os.com) • [**Report Bug**](https://github.com/Banisher2005/Chrono/issues)
</div>

<br>

> *Your life is scattered. Calendar. Tasks. Meetings. Notes. Chrono connects everything into a single, intelligent timeline.*

## ✨ Features

- **The Chrono Brain (AI):** Powered by Google Gemini, the built-in AI doesn't just chat—it *acts*. It understands your entire schedule, can parse complex NLP commands, and autonomously proposes additions, updates, and deletions to your timeline.
- **Universal Command Center (`Ctrl+K`):** Navigate the entire application, trigger focus modes, or type natural language (e.g., *"study physics tomorrow at 5pm"*) to instantly create tasks.
- **Chrono Grid (Heatmap):** A GitHub-style contribution graph for your personal productivity. Visualize streaks, track your deepest focus days, and monitor long-term momentum.
- **Deep Focus Mode:** Select a task and enter a distraction-free Pomodoro session. Chrono tracks your actual time spent versus estimated time, logging it automatically upon completion.
- **Progressive Web App (PWA):** Install Chrono directly onto your mobile or desktop home screen. Runs in standalone full-screen mode with offline fallback caching, touch gestures, and smooth animations.
- **Chrono Wrapped:** A beautiful, shareable Spotify-style summary of your annual or monthly productivity stats, complete with customizable themes (Glass, Cyberpunk, Spotify Gradient).
- **Public Profiles:** Share your work ethic with the world. Generate a `/u/username` link showing off your Chrono Grid and streaks while keeping your task details strictly private.

## 🛠 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + Custom Glassmorphism
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Authentication & DB:** [Supabase](https://supabase.com/) (OAuth Google)
- **AI Engine:** [Google Gemini API](https://deepmind.google/technologies/gemini/)
- **Deployment:** [Vercel](https://vercel.com/)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase Project
- A Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Banisher2005/Chrono.git
   cd Chrono
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Copy the `.env.example` file to `.env.local` and populate your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

5. **PWA Installation:**
   - On **Mobile (Chrome/Safari):** Open the website, tap "Share" or the menu button, and select "Add to Home Screen".
   - On **Desktop (Chrome/Edge):** Open the website, click the install icon in the URL bar, and select "Install".

## 🧠 System Architecture

Chrono utilizes a **hybrid state model**:
- **Global Store (`Zustand`):** Acts as the central nervous system on the client. It stores the normalized `Task` objects and productivity metadata.
- **AI Tool Calling (`Gemini`):** The AI module receives a compressed JSON representation of the `Zustand` state in its system prompt. When the user requests a change, the AI responds with a structured JSON patch payload (`updatedTasks`, `deletedTaskIds`).
- **Command & Accept Workflow:** Before the AI alters the global state, the user is presented with a diff UI to manually `Accept` or `Reject` the proposed timeline modifications, ensuring the user is always in control.

## 🎨 Design Philosophy

Chrono is built to feel like a premium SaaS product, heavily inspired by the aesthetics of Linear, Apple, and Raycast. 
It relies on a strict dark mode palette, smooth micro-interactions, layout animations, and extensive use of glassmorphism (`backdrop-blur`) to create depth without visual clutter.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
<div align="center">
  <i>Built with obsession.</i>
</div>
