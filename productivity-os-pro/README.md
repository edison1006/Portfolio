# Productivity OS **Pro**

Enhanced React productivity suite:
-  Task manager (CRUD, search, tags, priorities, due date)
-  Pomodoro timer (work/break, start/pause/reset)
-  Habit tracker (7-day grid)
-  7-day activity chart (Recharts)
-  Quick notes (localStorage)
-  **Kanban board** with drag-and-drop (@hello-pangea/dnd)
-  **Export/Import JSON** for tasks/habits/board/notes
-  Light/Dark theme toggle
-  Data Panel: GitHub user + repos fetch demo

No backend required. All data persists to `localStorage`.

## Tech Stack
- React + Vite
- Tailwind CSS
- Framer Motion
- Recharts
- @hello-pangea/dnd (drag-and-drop)
- lucide-react (icons)
- sonner (toasts)

## Quick Start

```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy to Vercel (recommended)
1. Create a new Vercel project and **Import** this repo/folder.
2. Framework preset: **Vite** (auto-detected).
3. Build command: `vite build` (or `npm run build`)
4. Output directory: `dist`
5. Deploy 🚀

## Export / Import
- Click **Export** -> saves a JSON snapshot.
- Click **Import** and select a previously exported JSON to restore.

## Structure
```
productivity-os-pro/
├─ index.html
├─ package.json
├─ postcss.config.js
├─ tailwind.config.js
├─ vite.config.js
└─ src/
   ├─ index.css
   ├─ main.jsx
   └─ App.jsx
```

## Ideas
- Multi-board support + column editing
- Realtime sync via Supabase
- Auth + shareable links
- i18n (English/中文)
- Unit tests (Vitest + React Testing Library)
