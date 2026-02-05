# ConvoxAI Frontend

Modern React + TypeScript + Vite application for AI-powered call analysis and interactive querying.

## Requirements

| Requirement | Version/Details |
|-------------|-----------------|
| Node.js | 18+ |
| npm | 9+ (or yarn 3+) |
| Supabase | Account required |
| Backend | Running at http://localhost:8000 |

---

## Quick Start

### 1. Install Dependencies

```bash
cd Frontend
npm install
```

### 2. Configure Environment

Create a `.env` file in the Frontend directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Start Development Server

```bash
npm run dev
```

Application available at: `http://localhost:5173`

---

## Project Structure

```
Frontend/
├── src/
│   ├── components/           # React Components
│   │   ├── auth/             # Authentication UI
│   │   │   ├── auth-page.tsx
│   │   │   ├── login-form.tsx
│   │   │   └── signup-form.tsx
│   │   ├── ui/               # Reusable UI (shadcn/ui)
│   │   ├── dashboard.tsx     # Main dashboard view
│   │   ├── call-summarizer.tsx  # Audio upload & summary
│   │   ├── chat-interface.tsx   # AI chatbot
│   │   ├── sidebar.tsx       # Navigation
│   │   └── profile-page.tsx  # User profile
│   │
│   ├── contexts/             # React Contexts
│   │   └── auth-context.tsx  # Authentication state
│   │
│   ├── lib/                  # Utilities
│   │   ├── api.ts            # Backend API client
│   │   ├── supabase.ts       # Supabase client
│   │   └── utils.ts          # Helper functions
│   │
│   ├── types/                # TypeScript Definitions
│   │   └── api.ts            # API types
│   │
│   ├── App.tsx               # Root component
│   └── main.tsx              # Entry point
│
├── public/                   # Static assets
├── index.html                # HTML template
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript config
└── package.json              # Dependencies
```

---

## Features

| Feature | Description |
|---------|-------------|
| **Authentication** | Sign up, login, and session management via Supabase Auth |
| **Audio Upload** | Drag-and-drop interface with progress tracking |
| **Call Summary** | AI-generated summary with transcript, sentiment, key points |
| **AI Chatbot** | Natural language queries via RAG-powered chatbot |
| **PDF Export** | Download professional summary reports |
| **Theme Toggle** | Dark/light mode with system preference detection |
| **Responsive UI** | Mobile-friendly design with Tailwind CSS |

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Create optimized production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework with hooks |
| **TypeScript** | Static type checking |
| **Vite** | Fast build tool with HMR |
| **Tailwind CSS 4** | Utility-first styling |
| **Radix UI** | Accessible UI primitives |
| **shadcn/ui** | Pre-built components |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client |
| **Supabase JS** | Auth and database client |
| **jsPDF** | PDF generation |

---

## Authentication Flow

1. User signs up or logs in via Supabase Auth
2. JWT token stored in local storage
3. `AuthContext` provides user state across the app
4. `ProtectedRoute` component guards authenticated pages
5. Token automatically refreshed by Supabase client

---

## API Integration

The `lib/api.ts` module handles all backend communication:

- **Base URL:** Configured via `VITE_API_BASE_URL`
- **Auth Header:** JWT automatically included in requests
- **Error Handling:** Interceptors for consistent error responses
- **Typed Responses:** Full TypeScript support

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5173 in use | Run `npm run dev -- --port 3000` |
| API connection fails | Verify backend is running and `VITE_API_BASE_URL` is correct |
| Build fails | Delete `node_modules` and run `npm install` again |
| TypeScript errors | Run `npx tsc --noEmit` to check types |
| Auth not working | Verify Supabase URL and anon key in `.env` |

---

## Deployment

### Production Build

```bash
npm run build
```

Output is in the `dist/` directory, ready for static hosting.

### Docker

```bash
docker build -t convoxai-frontend .
docker run -p 3000:80 convoxai-frontend
```

### Railway

```bash
railway up
```

Configuration is in `railway.toml`.

---

## License

MIT
