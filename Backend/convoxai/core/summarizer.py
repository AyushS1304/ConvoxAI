import warnings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from convoxai.utils.audio import transcribe_audio_simple
from convoxai.core.prompts.templates import system_prompt
from convoxai.config import GEMINI_API_KEY, GEMINI_MODEL_NAME, GEMINI_TEMPERATURE, GROQ_API_KEY, GROQ_MODEL_NAME, GROQ_TEMPERATURE
from convoxai.core.models import SummaryResponse

warnings.filterwarnings("ignore")

def create_llm():
    return ChatGoogleGenerativeAI(
        model=GEMINI_MODEL_NAME,
        api_key=GEMINI_API_KEY,
        temperature=GEMINI_TEMPERATURE
    )

def create_llm_2():
    return ChatGroq(
        model=GROQ_MODEL_NAME,
        api_key=GROQ_API_KEY,
        temperature=GROQ_TEMPERATURE
    )

def generate_summary(audio_file_path: str | None = None) -> dict:
    if audio_file_path is None:
        raise ValueError("Provide the valid Audio File for processing")
    transcript = transcribe_audio_simple(audio_file_path)
    llm = create_llm()
    st_llm = llm.with_structured_output(SummaryResponse)
    final_prompt = system_prompt.format(transcript=transcript)
    response = st_llm.invoke(final_prompt)
    return response

