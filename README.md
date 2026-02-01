
# ConvoxAI 🎙️

> An AI-powered call summarization and analysis platform with RAG (Retrieval-Augmented Generation) capabilities

ConvoxAI is an end-to-end intelligent call analysis system that transcribes audio files, generates comprehensive summaries, and provides an interactive AI chatbot to query your call data. Built with FastAPI, React, and powered by state-of-the-art AI models.

---

## ✨ Features

### 🎯 Core Capabilities
- **Audio Transcription**: Convert audio files to text using Faster Whisper
- **AI-Powered Summarization**: Generate detailed summaries with key insights, sentiment analysis, and participant detection
- **RAG-Based Chatbot**: Query your call history using natural language with context-aware responses
- **Multi-Format Support**: WAV, MP3, M4A, FLAC, OGG audio formats
- **User Authentication**: Secure authentication powered by Supabase
- **Cloud Storage**: Persistent audio file storage with Supabase Storage
- **PDF Export**: Download professional call summary reports
- **Real-time Analysis**: Instant processing and insights

### 🤖 AI Models
- **LLM Options**: Google Gemini 2.5 Flash & Groq (Qwen3-32B)
- **Transcription**: Faster Whisper (configurable model size)
- **Embeddings**: Sentence Transformers (all-MiniLM-L6-v2)
- **Vector Store**: Pinecone for semantic search

---

## 🏗️ Architecture

### Backend Stack
- **Framework**: FastAPI (Python 3.12+)
- **AI/ML**: LangChain, LangGraph, Faster Whisper, Sentence Transformers
- **Database**: Supabase (PostgreSQL)
- **Vector Store**: Pinecone
- **Authentication**: Supabase Auth + JWT
- **Storage**: Supabase Storage
- **Audio Processing**: PyDub, Faster Whisper

### Frontend Stack
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Hooks & Context API
- **Routing**: React Router DOM
- **HTTP Client**: Axios

---

## 📁 Project Structure

```
ConvoxAI/
├── Backend/
│   ├── api/                    # FastAPI routes
│   │   ├── app.py             # Main FastAPI application
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── chat_history.py    # Chat conversation management
│   │   ├── chat_query.py      # RAG chatbot endpoints
│   │   └── storage.py         # File storage endpoints
│   ├── core/                   # Core business logic
│   │   ├── chatbot.py         # RAG chatbot implementation
│   │   ├── models.py          # Pydantic models
│   │   ├── summarizer.py      # Audio summarization logic
│   │   └── prompts/           # LLM prompt templates
│   ├── database/              # Database schemas
│   │   ├── schema.sql         # Supabase table definitions
│   │   └── storage_policies.sql
│   ├── utils/                 # Utility functions
│   │   ├── audio.py           # Audio processing
│   │   ├── validation.py      # Input validation
│   │   ├── vector_store.py    # Pinecone integration
│   │   └── logger_config.py   # Logging configuration
│   ├── config.py              # Centralized configuration
│   ├── main.py                # Application entry point
│   └── requirements.txt       # Python dependencies
│
├── Frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── auth/          # Authentication UI
│   │   │   ├── ui/            # Reusable UI components
│   │   │   ├── call-summarizer.tsx
│   │   │   ├── dashboard.tsx  # Main dashboard
│   │   │   ├── chat-interface.tsx
│   │   │   └── sidebar.tsx
│   │   ├── contexts/          # React contexts
│   │   │   └── auth-context.tsx
│   │   ├── lib/               # Utilities & API client
│   │   │   ├── api.ts         # Backend API integration
│   │   │   ├── supabase.ts    # Supabase client
│   │   │   └── utils.ts
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx            # Root component
│   │   └── main.tsx           # Entry point
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Python**: 3.12 or higher
- **Node.js**: 18 or higher
- **Supabase Account**: For authentication and storage
- **Pinecone Account**: For vector database
- **API Keys**: Google Gemini and/or Groq

### Backend Setup

1. **Navigate to Backend directory**
   ```bash
   cd Backend
   ```

2. **Create virtual environment**
   ```bash
   uv init
   uv venv -p 3.12
   .venv\Scripts\actiavte
   ```

3. **Install dependencies**
   ```bash
    uv add -r requirements.txt
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the `Backend` directory:
   ```env
   # AI Model API Keys
   Groq_API_Key=your_groq_api_key
   Gemini_API_Key=your_gemini_api_key
   Pinecone_API_Key=your_pinecone_api_key

   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key

   # JWT Configuration
   JWT_SECRET=your_secret_key_change_in_production
   ```

5. **Set up Supabase Database**
   
   Run the SQL scripts in your Supabase SQL Editor:
   ```bash
   # Execute in order:
   database/schema.sql
   database/add_summary_columns.sql
   database/storage_policies.sql
   ```

6. **Run the backend server**
   ```bash
   uv run main.py
   ```
   
   The API will be available at:
   - **Server**: http://localhost:8000
   - **API Docs**: http://localhost:8000/docs
   - **ReDoc**: http://localhost:8000/redoc

### Frontend Setup

1. **Navigate to Frontend directory**
   ```bash
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `Frontend` directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at: http://localhost:5173

---

## 📖 Usage

### 1. Authentication
- Sign up or log in using the authentication page
- Credentials are securely managed via Supabase Auth

### 2. Upload & Analyze Audio
- Drag and drop an audio file or click to browse
- Supported formats: WAV, MP3, M4A, FLAC, OGG
- Maximum file size: 50MB
- Click "Upload & Analyze" to process

### 3. View Summary
The dashboard displays:
- **Executive Summary**: AI-generated overview
- **Call Metrics**: Duration, participants, sentiment
- **Key Insights**: Important discussion points
- **Full Transcript**: Complete conversation text

### 4. Export & Share
- **Download PDF**: Generate a professional report
- **Share**: Copy summary to clipboard or use Web Share API
- **Play Audio**: Listen to the original recording

### 5. AI Chat Assistant
- Click the "Analyze with AI" button (✨ Sparkles icon)
- Ask questions about your calls:
  - "What were the main topics discussed?"
  - "What was the sentiment of the conversation?"
  - "Summarize the key action items"
- The chatbot uses RAG to provide context-aware answers

---

## 🔧 Configuration

### Backend Configuration (`Backend/config.py`)

```python
# AI Model Settings
GEMINI_MODEL_NAME = "gemini-2.5-flash"
GEMINI_TEMPERATURE = 0.7
GROQ_MODEL_NAME = "qwen/qwen3-32b"
GROQ_TEMPERATURE = 0.6

# Whisper Settings
WHISPER_MODEL_SIZE = "tiny"  # Options: tiny, base, small, medium, large

# Text Processing
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 50

# Embeddings
EMBEDDINGS_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDINGS_DIMENSION = 384

# Pinecone
PINECONE_INDEX_NAME = "convox-ai"
PINECONE_METRIC = "cosine"

# Retrieval
RETRIEVER_SEARCH_TYPE = "similarity"
RETRIEVER_TOP_K = 5

# File Limits
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
```

---

## � API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

### Audio Processing
- `POST /summarize` - Upload and summarize audio file
- `POST /transcript` - Get audio transcription only
- `POST /models` - Test LLM model connectivity

### Storage
- `POST /storage/upload` - Upload audio file to storage
- `GET /storage/files` - List user's audio files
- `GET /storage/file/{file_id}` - Get file metadata
- `PATCH /storage/file/{file_id}` - Update file summary
- `DELETE /storage/file/{file_id}` - Delete audio file
- `GET /storage/file/{file_id}/url` - Get signed URL for playback

### Chat
- `POST /chat/query` - Query chatbot with RAG
- `GET /chat/conversations` - List conversations
- `POST /chat/conversations` - Create new conversation
- `GET /chat/conversations/{id}/messages` - Get conversation messages
- `POST /chat/conversations/{id}/messages` - Add message to conversation
- `DELETE /chat/conversations/{id}` - Delete conversation

---

## �️ Database Schema

### Tables
- **profiles**: User profile information
- **audio_files**: Uploaded audio file metadata
- **chat_conversations**: Chat conversation threads
- **chat_messages**: Individual chat messages

All tables have Row Level Security (RLS) enabled for data protection.

---

## 📦 Dependencies

### Key Backend Dependencies
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `langchain` - LLM orchestration
- `langchain-google-genai` - Google Gemini integration
- `langchain-groq` - Groq integration
- `langchain-pinecone` - Vector store integration
- `faster-whisper` - Audio transcription
- `sentence-transformers` - Text embeddings
- `supabase` - Database & auth client
- `pydantic` - Data validation
- `pydub` - Audio processing

### Key Frontend Dependencies
- `react` & `react-dom` - UI framework
- `react-router-dom` - Routing
- `@supabase/supabase-js` - Supabase client
- `axios` - HTTP client
- `@radix-ui/*` - Headless UI components
- `tailwindcss` - Styling
- `lucide-react` - Icons
- `jspdf` - PDF generation
- `zod` - Schema validation

---

## 🔐 Security

- **Authentication**: Supabase Auth with JWT tokens
- **Row Level Security**: Database-level access control
- **API Key Protection**: Environment variables for sensitive data
- **CORS Configuration**: Restricted origins
- **File Validation**: Type and size checks
- **Secure Storage**: Signed URLs with expiration

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## � Acknowledgments

- **LangChain** - LLM orchestration framework
- **Supabase** - Backend infrastructure
- **Pinecone** - Vector database
- **Google Gemini** - AI model
- **Groq** - High-performance inference
- **Radix UI** - Accessible components
- **shadcn/ui** - Beautiful UI components

---

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check the [API Documentation](http://localhost:8000/docs)

---

## 🗺️ Roadmap

- [ ] Real-time audio streaming
- [ ] Multi-language support
- [ ] Speaker diarization
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Batch processing
- [ ] Custom model fine-tuning
- [ ] Integration with CRM systems

---
