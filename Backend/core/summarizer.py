import warnings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from utils.audio import transcribe_audio_simple
from core.prompts.templates import system_prompt
from config import (
    GEMINI_API_KEY,
    GEMINI_MODEL_NAME,
    GEMINI_TEMPERATURE,
    GROQ_API_KEY,
    GROQ_MODEL_NAME,
    GROQ_TEMPERATURE
)
from core.models import SummaryResponse
import logging

logger = logging.getLogger(__name__)
warnings.filterwarnings("ignore")

def create_gemini_llm():
    """Create and return a Google Gemini LLM instance."""
    return ChatGoogleGenerativeAI(
        model=GEMINI_MODEL_NAME,
        api_key=GEMINI_API_KEY,
        temperature=GEMINI_TEMPERATURE
    )

def create_groq_llm():
    """Create and return a Groq LLM instance."""
    return ChatGroq(
        model=GROQ_MODEL_NAME,
        api_key=GROQ_API_KEY,
        temperature=GROQ_TEMPERATURE
    )

def generate_summary(audio_file_path: str | None = None) -> dict:
    logger.info(f"Generating summary for audio file: {audio_file_path}")
    if audio_file_path is None:
        logger.error("No audio file path provided")
        raise ValueError("Provide the valid Audio File for processing")
    
    logger.debug("Starting transcription...")
    transcript = transcribe_audio_simple(audio_file_path)
    logger.debug(f"Transcription complete, length: {len(transcript)} characters")
    
    logger.debug("Generating summary with Gemini...")
    llm = create_gemini_llm()
    st_llm = llm.with_structured_output(SummaryResponse)
    final_prompt = system_prompt.format(transcript=transcript)
    response = st_llm.invoke(final_prompt)
    logger.info("Summary generation complete")
    
    # Return both the structured response and the transcript
    return {
        "summary": response.summary,
        "duration_minutes": response.duration_minutes,
        "no_of_participants": response.no_of_participants,
        "key_aspects": response.key_aspects,
        "sentiment": response.sentiment,
        "transcript": transcript
    }


