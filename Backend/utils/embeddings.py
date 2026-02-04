from langchain_google_genai import GoogleGenerativeAIEmbeddings
from config import GEMINI_API_KEY, EMBEDDINGS_MODEL_NAME

def load_embeddings():
    embeddings = GoogleGenerativeAIEmbeddings(
        model=EMBEDDINGS_MODEL_NAME,
        google_api_key=GEMINI_API_KEY
    )
    return embeddings
