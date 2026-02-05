# ConvoxAI

AI-powered call transcription, summarization, and analysis platform with RAG chatbot capabilities.

## Overview

ConvoxAI is an intelligent call analysis system that transcribes audio files, generates contextual summaries with sentiment analysis, and provides an interactive AI chatbot for natural language querying. Built with FastAPI and React, powered by state-of-the-art language models.

## Features

| Feature | Description |
|---------|-------------|
| **Audio Transcription** | Convert audio files to text using Faster Whisper (WAV, MP3, M4A, FLAC, OGG) |
| **AI Summarization** | Generate detailed summaries with sentiment analysis, key insights, and action items |
| **RAG Chatbot** | Query call history using natural language with context-aware responses |
| **Secure Authentication** | User management powered by Supabase Auth with JWT tokens |
| **Cloud Storage** | Persistent audio file storage with Supabase Storage |
| **PDF Reports** | Export professional call summary reports |
| **Real-time Processing** | Instant audio analysis and insights delivery |

## Tech Stack

### Backend
| Component | Technology |
|-----------|-----------|
| Web Framework | FastAPI (Python 3.12+) |
| LLM Orchestration | LangChain, LangGraph |
| Audio Processing | Faster Whisper, PyDub |
| Vector Database | Pinecone |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth + JWT |

### Frontend
| Component | Technology |
|-----------|-----------|
| UI Framework | React 18+ with TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI + shadcn/ui |
| HTTP Client | Axios |

---

## Project Structure

```
ConvoxAI/
├── Backend/                    # FastAPI Backend Service
│   ├── app/                    # API routes and endpoints
│   ├── core/                   # Business logic (chatbot, summarizer)
│   ├── utils/                  # Utilities (audio, embeddings, validation)
│   ├── database/               # SQL schemas and RLS policies
│   ├── config.py               # Centralized configuration
│   └── main.py                 # Application entry point
│
├── Frontend/                   # React Frontend Application
│   ├── src/
│   │   ├── components/         # React components (auth, ui, pages)
│   │   ├── contexts/           # Auth context provider
│   │   ├── lib/                # API client and utilities
│   │   └── types/              # TypeScript definitions
│   └── vite.config.ts          # Vite configuration
│
└── README.md
```

**Detailed documentation:**
- [Backend/README.md](Backend/README.md) — API reference, configuration, database schema
- [Frontend/README.md](Frontend/README.md) — Component structure, features, deployment

---

## Requirements

| Requirement | Details |
|-------------|---------|
| Python | 3.12+ |
| Node.js | 18+ |
| Supabase | Account for database, auth, and storage |
| Pinecone | Account for vector database |
| AI Provider | Google Gemini or Groq API key |

---

## Quick Start

### Backend Setup

```bash
cd Backend
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# Create .env with API keys (see Backend/README.md)
python main.py
```

Server runs at: `http://localhost:8000`

### Frontend Setup

```bash
cd Frontend
npm install
# Create .env with Supabase config (see Frontend/README.md)
npm run dev
```

App runs at: `http://localhost:5173`

See [Backend/README.md](Backend/README.md) and [Frontend/README.md](Frontend/README.md) for complete setup instructions.

---

## Usage

1. **Sign Up / Login** — Create an account with email and password
2. **Upload Audio** — Drag and drop or select audio file (max 50 MB)
3. **View Summary** — See AI-generated summary with transcript, sentiment, and key points
4. **Chat with AI** — Ask natural language questions about your calls
5. **Export** — Download PDF reports of call summaries

### Example Chat Queries

- "What were the main topics discussed?"
- "What was the overall sentiment of the conversation?"
- "What are the key action items mentioned?"

---

## Configuration

### Backend (`Backend/config.py`)

```python
# Language Models
GEMINI_MODEL_NAME = "gemini-2.5-flash"
GROQ_MODEL_NAME = "qwen/qwen3-32b"

# Audio Transcription
WHISPER_MODEL_SIZE = "tiny"  # tiny | base | small | medium | large

# Embeddings
EMBEDDINGS_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
```

### Frontend (`.env`)

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_API_BASE_URL=http://localhost:8000
```

---

## API Documentation

Interactive API documentation available when backend is running:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

See [Backend/README.md](Backend/README.md) for complete endpoint reference.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add: description of changes"`
4. Push to your fork: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT

---

## Resources

| Resource | Link |
|----------|------|
| Backend Documentation | [Backend/README.md](Backend/README.md) |
| Frontend Documentation | [Frontend/README.md](Frontend/README.md) |
| Issue Tracker | [GitHub Issues](https://github.com/Dhruv610ag/ConvoxAI/issues) |
| API Documentation | `http://localhost:8000/docs` |
