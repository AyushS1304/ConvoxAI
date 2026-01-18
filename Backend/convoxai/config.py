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

WHISPER_MODEL_SIZE = "medium"

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 50
TEXT_SEPARATORS = ["\n\n", "\n", ".", " "]

EMBEDDINGS_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDINGS_DIMENSION = 384

PINECONE_INDEX_NAME = "convox-ai"
PINECONE_DIMENSION = EMBEDDINGS_DIMENSION
PINECONE_METRIC = "cosine"
PINECONE_CLOUD = "aws"
PINECONE_REGION = "us-east-1"

RETRIEVER_SEARCH_TYPE = "similarity"
RETRIEVER_TOP_K = 5
