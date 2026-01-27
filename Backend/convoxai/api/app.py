from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from convoxai.core.models import APIResponse,ErrorResponse,ModelTestRequest
from convoxai.core.summarizer import generate_summary
from convoxai.core.models import SummaryResponse
from convoxai.config import GEMINI_MODEL_NAME, WHISPER_MODEL_SIZE,GROQ_MODEL_NAME
from convoxai.core.summarizer import create_llm,create_llm_2
from convoxai.api import auth, storage, chat_history
from convoxai.utils.audio import transcribe_audio_simple
import os
import tempfile
import shutil
from pathlib import Path

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


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default dev server
        "http://localhost:3000",  # Alternative dev server
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
    return {
        "message": "Welcome to ConvoxAI API",
        "version": "1.0.0",
        "docs": "/docs",
        "model":"/models"
    }

@app.post("/models", response_model=APIResponse, tags=["Model"])
async def model_check(request: ModelTestRequest):
    llm_google = create_llm()
    llm_groq = create_llm_2()
    
    if request.user_choice == 1 and llm_google:
        try:
            response = llm_google.invoke(request.query)
            return APIResponse(
                status="Success",
                message=f"Google Gemini model is working! Response: {response.content[:100]}...",
                model_info={
                    "llm_model": GEMINI_MODEL_NAME,
                    "whisper_model": WHISPER_MODEL_SIZE,
                    "rag_enabled": True
                }
            )
        except Exception as e:
            return APIResponse(
                status="Failed",
                message=f"Google Gemini model failed: {str(e)}",
                model_info={
                    "llm_model": GEMINI_MODEL_NAME,
                    "whisper_model": WHISPER_MODEL_SIZE,
                    "rag_enabled": True
                }
            )
    elif request.user_choice == 2 and llm_groq:
        try:
            response = llm_groq.invoke(request.query)
            return APIResponse(
                status="Success",
                message=f"Groq model is working! Response: {response.content[:100]}...",
                model_info={
                    "llm_model": GROQ_MODEL_NAME,
                    "whisper_model": WHISPER_MODEL_SIZE,
                    "rag_enabled": True
                }
            )
        except Exception as e:
            return APIResponse(
                status="Failed",
                message=f"Groq model failed: {str(e)}",
                model_info={
                    "llm_model": GROQ_MODEL_NAME,
                    "whisper_model": WHISPER_MODEL_SIZE,
                    "rag_enabled": True
                }
            )
    else:
        return APIResponse(
            status="Failed",
            message="Invalid model choice or model not initialized",
            model_info={
                "llm_model": [GROQ_MODEL_NAME, GEMINI_MODEL_NAME],
                "whisper_model": WHISPER_MODEL_SIZE,
                "rag_enabled": True
            }
        )


@app.post("/summarize", response_model=SummaryResponse, tags=["Summarization"])
async def summarize_audio(
    audio_file: UploadFile = File(..., description="Audio file (.wav, .mp3, .m4a, .flac,.ogg)")):
    if not audio_file:
        raise HTTPException(
            ErrorResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audio file was not found in the uploaded button"
            )
        )
    allowed_extensions = {".wav", ".mp3", ".m4a", ".flac",".ogg"}
    file_extension = Path(audio_file.filename).suffix.lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            ErrorResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file format. Supported formats: {', '.join(allowed_extensions)}"
            )
        )
    tmp_file_path = None
    try:
        tmp_file_path = save_upload_file_tmp(audio_file)
        summary_response = generate_summary(str(tmp_file_path))
        return summary_response
    except ValueError as ve:
        raise HTTPException(
            ErrorResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        ))
    except Exception as e:
        raise HTTPException(
            ErrorResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process audio file: {str(e)}"
        ))
    finally:
        if tmp_file_path and tmp_file_path.exists():
            try:
                os.unlink(tmp_file_path)
            except Exception:
                pass

@app.post("/transcript",tags=['Transcript'])
async def get_transcript(audio_file: UploadFile = File(...)):
    if not audio_file:
        raise HTTPException(
            ErrorResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audio file was not found in the uploaded button"
            )
        )
    allowed_extensions = {".wav", ".mp3", ".m4a", ".flac",".ogg"}
    file_extension = Path(audio_file.filename).suffix.lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            ErrorResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file format. Supported formats: {', '.join(allowed_extensions)}"
            )
        )
    tmp_file_path = None
    try:
        tmp_file_path=save_upload_file_tmp(audio_file)
        transcript_response=transcribe_audio_simple(str(tmp_file_path))
        return transcript_response
    except Exception as e:
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
    return JSONResponse(
        ErrorResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc)
        )
    )

@app.on_event("startup")
async def startup_event():
    print(" 🟢 Starting with the Application")
    pass

@app.on_event("shutdown")
async def shutdown_event():
    print(" 🛑 Shutting down the Application")
    pass