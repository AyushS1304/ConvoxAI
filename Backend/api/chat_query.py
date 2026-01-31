from fastapi import APIRouter, HTTPException, status, Depends
from core.models import ChatQueryRequest, ChatQueryResponse, SourceDocument
from core.chatbot import process_query, process_query_with_context
from api.auth import get_authenticated_user, AuthContext
from utils.supabase_client import get_records
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Chatbot"])


def build_user_context(audio_files: list) -> str:
    """Build context string from user's audio files"""
    if not audio_files:
        return ""
    
    context_parts = ["Here is information about the user's recent calls:\n"]
    
    for file in audio_files:
        context_parts.append(f"\n--- Call: {file.get('filename', 'Unknown')} ---")
        
        if file.get('summary'):
            context_parts.append(f"Summary: {file['summary']}")
        
        if file.get('duration_minutes'):
            context_parts.append(f"Duration: {file['duration_minutes']} minutes")
        
        if file.get('no_of_participants'):
            context_parts.append(f"Participants: {file['no_of_participants']}")
        
        if file.get('sentiment'):
            context_parts.append(f"Sentiment: {file['sentiment']}")
        
        if file.get('key_aspects'):
            aspects = file['key_aspects']
            if isinstance(aspects, list):
                context_parts.append(f"Key Points: {', '.join(aspects)}")
            elif isinstance(aspects, str):
                context_parts.append(f"Key Points: {aspects}")
        
        if file.get('transcript'):
            # Include first 3000 chars of transcript for more context
            transcript = file['transcript'][:3000]
            context_parts.append(f"Transcript excerpt: {transcript}")
    
    return "\n".join(context_parts)


@router.post("/query", response_model=ChatQueryResponse)
async def query_chatbot(
    request: ChatQueryRequest,
    auth: AuthContext = Depends(get_authenticated_user)
):
    logger.info(f"Chat query received from user_id: {auth.id}, question: {request.question[:50]}...")
    try:
        # Fetch user's audio files to provide context
        audio_files = await get_records(
            table="audio_files",
            filters={"user_id": auth.id}
        )
        
        logger.debug(f"Fetched {len(audio_files)} audio files for user {auth.id}")
        
        # Build context from user's calls
        user_context = build_user_context(audio_files)
        
        chat_history = None
        if request.chat_history:
            chat_history = [
                {"role": msg.role, "content": msg.content}
                for msg in request.chat_history
            ]
        
        # Use direct context-based query if user has audio files
        if user_context:
            logger.info(f"Using direct context query with {len(audio_files)} files")
            result = process_query_with_context(
                question=request.question,
                user_context=user_context,
                chat_history=chat_history,
                model_choice=request.model_choice or "gemini"
            )
        else:
            # Fallback to vector store query if no user files
            logger.info("No user files found, using vector store query")
            result = process_query(
                question=request.question,
                chat_history=chat_history,
                model_choice=request.model_choice or "gemini"
            )
        
        sources = [
            SourceDocument(
                content=src["content"],
                metadata=src.get("metadata", {})
            )
            for src in result.get("sources", [])
        ]
        logger.info(f"Chat query processed successfully, model: {result['model_used']}, files_context: {len(audio_files)}")
        return ChatQueryResponse(
            answer=result["answer"],
            sources=sources,
            model_used=result["model_used"]
        )
    except Exception as e:  
        logger.error(f"Chatbot query error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process chatbot query: {str(e)}"
        )

