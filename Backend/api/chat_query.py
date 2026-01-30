from fastapi import APIRouter, HTTPException, status, Depends
from core.models import ChatQueryRequest, ChatQueryResponse, SourceDocument
from core.chatbot import process_query
from api.auth import get_authenticated_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Chatbot"])


@router.post("/query", response_model=ChatQueryResponse)
async def query_chatbot(
    request: ChatQueryRequest,
    user: dict = Depends(get_authenticated_user)
):
    logger.info(f"Chat query received from user_id: {user.id}, question: {request.question[:50]}...")
    try:
        chat_history = None
        if request.chat_history:
            chat_history = [
                {"role": msg.role, "content": msg.content}
                for msg in request.chat_history
            ]
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
        logger.info(f"Chat query processed successfully, sources: {len(sources)}, model: {result['model_used']}")
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
