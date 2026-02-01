from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from core.models import APIResponse, ErrorResponse, ModelTestRequest
from core.summarizer import generate_summary, create_gemini_llm, create_groq_llm
from core.models import SummaryResponse
from config import GEMINI_MODEL_NAME, WHISPER_MODEL_SIZE, GROQ_MODEL_NAME
from utils.validation import validate_audio_file
from api import auth, storage, chat_history, chat_query
from utils.audio import transcribe_audio_simple
import os
import tempfile
import shutil
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="ConvoxAI - AI-Powered Call Summarization API",
    description="An end-to-end AI-based Call Summarization system using RAG pipeline with Supabase authentication",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Include routers
app.include_router(auth.router)
app.include_router(storage.router)
app.include_router(chat_history.router)
app.include_router(chat_query.router)


# Handle OPTIONS requests for CORS preflight
@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Handle CORS preflight OPTIONS requests"""
    return JSONResponse(
        content={"message": "OK"},
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "true",
        }
    )


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  
        "http://localhost:3000",  
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Utility function to save uploaded file temporarily
def save_upload_file_tmp(upload_file: UploadFile) -> Path:
    try:
        suffix = Path(upload_file.filename).suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            shutil.copyfileobj(upload_file.file, tmp_file)
            tmp_path = Path(tmp_file.name)
        return tmp_path
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save uploaded file: {str(e)}"
        )
    finally:
        upload_file.file.close()


@app.get("/", tags=["Root"])
async def root():
    logger.debug("Root endpoint accessed")
    return {
        "message": "Welcome to ConvoxAI API",
        "version": "1.0.0",
        "docs": "/docs",
        "model":"/models"
    }

@app.post("/models", response_model=APIResponse, tags=["Model"])
async def model_check(request: ModelTestRequest):
    """Test LLM model connectivity and functionality."""
    logger.info(f"Model test requested: choice={request.user_choice}")
    models = {
        1: ("Google Gemini", create_gemini_llm(), GEMINI_MODEL_NAME),
        2: ("Groq", create_groq_llm(), GROQ_MODEL_NAME)
    }
    
    if request.user_choice not in models:
        logger.warning(f"Invalid model choice: {request.user_choice}")
        return APIResponse(
            status="Failed",
            message="Invalid model choice. Must be 1 (Gemini) or 2 (Groq)",
            model_info={
                "available_models": [GEMINI_MODEL_NAME, GROQ_MODEL_NAME],
                "whisper_model": WHISPER_MODEL_SIZE,
                "rag_enabled": True
            }
        )
    
    model_name, llm, model_id = models[request.user_choice]
    logger.debug(f"Testing {model_name} with query: {request.query[:400]}...")
    
    try:
        response = llm.invoke(request.query)
        logger.info(f"{model_name} test successful")
        return APIResponse(
            status="Success",
            message=f"{model_name} is working! Response: {response.content[:400]}...",
            model_info={
                "llm_model": model_id,
                "whisper_model": WHISPER_MODEL_SIZE,
                "rag_enabled": True
            }
        )
    except Exception as e:
        logger.error(f"{model_name} test failed: {str(e)}")
        return APIResponse(
            status="Failed",
            message=f"{model_name} failed: {str(e)}",
            model_info={
                "llm_model": model_id,
                "whisper_model": WHISPER_MODEL_SIZE,
                "rag_enabled": True
            }
        )


@app.post("/summarize", response_model=SummaryResponse, tags=["Summarization"])
async def summarize_audio(
    audio_file: UploadFile = File(..., description="Audio file (.wav, .mp3, .m4a, .flac,.ogg)")):
    
    logger.info(f"Summarization request received: file={audio_file.filename}")
    # Validate file
    await validate_audio_file(audio_file)
    
    tmp_file_path = None
    try:
        tmp_file_path = save_upload_file_tmp(audio_file)
        logger.debug(f"Processing audio file at: {tmp_file_path}")
        summary_response = generate_summary(str(tmp_file_path))
        logger.info(f"Summary generated successfully for: {audio_file.filename}")
        return summary_response
    except ValueError as ve:
        logger.warning(f"Validation error for {audio_file.filename}: {str(ve)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Summarization failed for {audio_file.filename}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process audio file: {str(e)}"
        )
    finally:
        if tmp_file_path and tmp_file_path.exists():
            try:
                os.unlink(tmp_file_path)
            except Exception:
                pass

@app.post("/transcript", tags=['Transcript'])
async def get_transcript(audio_file: UploadFile = File(...)):
    
    logger.info(f"Transcript request received: file={audio_file.filename}")
    # Validate file
    await validate_audio_file(audio_file)
    
    tmp_file_path = None
    try:
        tmp_file_path=save_upload_file_tmp(audio_file)
        logger.debug(f"Transcribing audio file at: {tmp_file_path}")
        transcript_response=transcribe_audio_simple(str(tmp_file_path))
        logger.info(f"Transcript generated successfully for: {audio_file.filename}")
        return transcript_response
    except Exception as e:
        logger.error(f"Transcription failed for {audio_file.filename}: {str(e)}", exc_info=True)
        raise HTTPException(
            ErrorResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process audio file: {str(e)}"
        ))

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": "An unexpected error occurred"
        }
    )

@app.on_event("startup")
async def startup_event():
    logger.info("🟢 FastAPI application startup complete")
    logger.info("All routers registered and middleware configured")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 FastAPI application shutting down")
    logger.info("Cleaning up resources...")