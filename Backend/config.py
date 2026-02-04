import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("Groq_API_Key")
if not GROQ_API_KEY:
    raise EnvironmentError("Groq_API_Key not found in .env file")

GEMINI_API_KEY = os.getenv("Gemini_API_Key")
if not GEMINI_API_KEY:
    raise EnvironmentError("Gemini_API_Key not found in .env file")

PINECONE_API_KEY = os.getenv("Pinecone_API_Key")
if not PINECONE_API_KEY:
    raise EnvironmentError("Pinecone_API_Key not found in .env file")

GEMINI_MODEL_NAME = "gemini-2.5-flash"
GEMINI_TEMPERATURE = 0.7

GROQ_MODEL_NAME = "qwen/qwen3-32b"
GROQ_TEMPERATURE = 0.6

WHISPER_MODEL_SIZE = "tiny"

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 50
TEXT_SEPARATORS = ["\n\n", "\n", ".", " "]

EMBEDDINGS_MODEL_NAME = "models/text-embedding-004"
EMBEDDINGS_DIMENSION = 768

PINECONE_INDEX_NAME = "convox-ai-gemini"
PINECONE_DIMENSION = 768
PINECONE_METRIC = "cosine"
PINECONE_CLOUD = "aws"
PINECONE_REGION = "us-east-1"

RETRIEVER_SEARCH_TYPE = "similarity"
RETRIEVER_TOP_K = 5


SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

ALLOWED_AUDIO_EXTENSIONS = {".wav", ".mp3", ".m4a", ".flac", ".ogg"}
ALLOWED_AUDIO_MIME_TYPES = {
    "audio/wav", "audio/mpeg", "audio/mp4",
    "audio/x-m4a", "audio/flac", "audio/ogg"
}
MAX_FILE_SIZE = 50 * 1024 * 1024
AUDIO_BUCKET_NAME = "audio-files"

