# ConvoxAI Backend

FastAPI-powered backend service for audio transcription, AI summarization, and RAG-based chatbot queries.

## Requirements

| Requirement | Version/Details |
|-------------|-----------------|
| Python | 3.12+ |
| Supabase | Account required (database, auth, storage) |
| Pinecone | Account required (vector database) |
| AI Provider | Google Gemini or Groq API key |

---

## Quick Start

### 1. Install Dependencies

```bash
cd Backend
python3.12 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the Backend directory:

```env
# AI Model Providers
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key

# Vector Database
PINECONE_API_KEY=your_pinecone_api_key

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Security
JWT_SECRET=change_this_in_production
```

### 3. Initialize Database

Run these SQL scripts in the Supabase SQL Editor (in order):

1. `database/schema.sql` — Core tables
2. `database/add_summary_columns.sql` — Summary fields
3. `database/storage_policies.sql` — RLS policies

### 4. Start the Server

```bash
python main.py
```

- **API Base:** `http://localhost:8000`
- **Interactive Docs:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## Project Structure

```
Backend/
├── app/                    # API Layer
│   ├── app.py              # FastAPI application & middleware
│   ├── auth.py             # Authentication endpoints
│   ├── chat_history.py     # Conversation management
│   ├── chat_query.py       # RAG chatbot endpoints
│   └── storage.py          # File storage endpoints
│
├── core/                   # Business Logic
│   ├── chatbot.py          # RAG implementation with LangChain
│   ├── models.py           # Pydantic data models
│   ├── summarizer.py       # Audio transcription & summarization
│   └── prompts/            # LLM prompt templates
│
├── utils/                  # Utilities
│   ├── audio.py            # Audio file processing
│   ├── embeddings.py       # Sentence transformer embeddings
│   ├── vector_store.py     # Pinecone integration
│   ├── validation.py       # Input validation helpers
│   ├── db_helpers.py       # Database utilities
│   └── supabase_client.py  # Supabase client setup
│
├── database/               # SQL Scripts
│   ├── schema.sql          # Table definitions
│   ├── add_summary_columns.sql
│   └── storage_policies.sql
│
├── config.py               # Centralized configuration
├── main.py                 # Application entry point
└── requirements.txt        # Python dependencies
```

---

## API Reference

All endpoints require JWT authentication via `Authorization: Bearer <token>` header (except signup/login).

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Authenticate and get token |
| POST | `/auth/logout` | Invalidate session |
| GET | `/auth/me` | Get current user profile |

### Audio Processing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/summarize` | Transcribe and summarize audio file |
| POST | `/transcript` | Get transcript only |
| GET | `/models` | List available AI models |

### Storage

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/storage/files` | List user's audio files |
| GET | `/storage/file/{id}` | Get file metadata and summary |
| PATCH | `/storage/file/{id}` | Update file summary |
| DELETE | `/storage/file/{id}` | Delete file permanently |
| GET | `/storage/file/{id}/url` | Get signed URL for playback |

### Chat (RAG)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/query` | Send query to RAG chatbot |
| GET | `/chat/conversations` | List user conversations |
| GET | `/chat/conversations/{id}/messages` | Get conversation history |
| DELETE | `/chat/conversations/{id}` | Delete conversation |

---

## Configuration

Key settings in `config.py`:

```python
# Language Models
GEMINI_MODEL_NAME = "gemini-2.5-flash"
GEMINI_TEMPERATURE = 0.7
GROQ_MODEL_NAME = "qwen/qwen3-32b"
GROQ_TEMPERATURE = 0.6

# Audio Transcription
WHISPER_MODEL_SIZE = "tiny"  # Options: tiny, base, small, medium, large

# Text Embeddings
EMBEDDINGS_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDINGS_DIMENSION = 384

# Text Chunking
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 50

# Vector Database
PINECONE_INDEX_NAME = "convox-ai"

# File Limits
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
```

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profile data |
| `audio_files` | File metadata and summaries |
| `chat_conversations` | Conversation sessions |
| `chat_messages` | Individual chat messages |

All tables have Row Level Security (RLS) enabled for user data isolation.

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `fastapi` | Web framework |
| `uvicorn` | ASGI server |
| `langchain` | LLM orchestration |
| `langchain-google-genai` | Gemini integration |
| `langchain-groq` | Groq integration |
| `faster-whisper` | Audio transcription |
| `sentence-transformers` | Text embeddings |
| `pinecone-client` | Vector database |
| `supabase` | Database & authentication |
| `pydantic` | Data validation |
| `pydub` | Audio file processing |
| `python-jose` | JWT handling |

---

## Security

- **Authentication:** Supabase Auth with JWT tokens
- **Authorization:** Row Level Security (RLS) on all database tables
- **Data Protection:** Parameterized queries, signed URLs for file access
- **Input Validation:** Pydantic models, file type and size validation
- **Secrets:** Environment variables for all credentials

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API won't start | Verify all `.env` values are set correctly |
| Whisper model fails | Try smaller model size (`tiny` or `base`) |
| Pinecone errors | Check API key and ensure index exists with 384 dimensions |
| Database connection fails | Verify Supabase URL and keys, check RLS policies |
| Import errors | Run `pip install -r requirements.txt --upgrade` |

---

## License

MIT
