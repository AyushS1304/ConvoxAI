"""
Chat History API Endpoints

This module provides endpoints for saving, retrieving, and managing chat conversations.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from convoxai.core.models import (
    ChatConversation, SaveConversationRequest, ConversationListResponse, ChatMessage
)
from convoxai.utils.supabase_client import insert_record, get_records, delete_record, update_record
from convoxai.api.auth import get_authenticated_user
from typing import List
import logging
import uuid
from datetime import datetime
import json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Chat History"])


@router.post("/save", response_model=ChatConversation)
async def save_conversation(
    conversation_data: SaveConversationRequest,
    user: dict = Depends(get_authenticated_user)
):
    """
    Save a chat conversation
    
    Args:
        conversation_data: Conversation data (title and messages)
        user: Authenticated user (from dependency)
        
    Returns:
        Saved conversation with ID
    """
    try:
        conversation_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        # Save conversation
        conversation = {
            "id": conversation_id,
            "user_id": user.id,
            "title": conversation_data.title,
            "created_at": now,
            "updated_at": now
        }
        
        await insert_record("chat_conversations", conversation)
        
        # Save messages
        for message in conversation_data.messages:
            message_data = {
                "id": str(uuid.uuid4()),
                "conversation_id": conversation_id,
                "role": message.role,
                "content": message.content,
                "audio_file_id": message.audio_file_id,
                "created_at": message.created_at.isoformat() if message.created_at else now
            }
            await insert_record("chat_messages", message_data)
        
        return ChatConversation(
            id=conversation_id,
            user_id=user.id,
            title=conversation_data.title,
            messages=conversation_data.messages,
            created_at=now,
            updated_at=now
        )
        
    except Exception as e:
        logger.error(f"Save conversation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save conversation: {str(e)}"
        )


@router.get("/history", response_model=List[ConversationListResponse])
async def get_conversation_history(
    limit: int = 50,
    user: dict = Depends(get_authenticated_user)
):
    """
    Get user's conversation history
    
    Args:
        limit: Maximum number of conversations to return
        user: Authenticated user (from dependency)
        
    Returns:
        List of conversations with metadata
    """
    try:
        conversations = await get_records(
            table_name="chat_conversations",
            filters={"user_id": user.id},
            order_by="updated_at",
            limit=limit
        )
        
        result = []
        for conv in conversations:
            # Get message count
            messages = await get_records(
                table_name="chat_messages",
                filters={"conversation_id": conv["id"]}
            )
            
            result.append(ConversationListResponse(
                id=conv["id"],
                title=conv["title"],
                message_count=len(messages),
                created_at=conv["created_at"],
                updated_at=conv["updated_at"]
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Get history error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve conversation history"
        )

@router.get("/{conversation_id}", response_model=ChatConversation)
async def get_conversation(
    conversation_id: str,
    user: dict = Depends(get_authenticated_user)
):
    """
    Get a specific conversation with all messages
    
    Args:
        conversation_id: Conversation ID
        user: Authenticated user (from dependency)
        
    Returns:
        Complete conversation with messages
    """
    try:
        # Get conversation
        conversations = await get_records(
            table_name="chat_conversations",
            filters={"id": conversation_id, "user_id": user.id}
        )
        
        if not conversations:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        conversation = conversations[0]
        
        # Get messages
        messages_data = await get_records(
            table_name="chat_messages",
            filters={"conversation_id": conversation_id},
            order_by="created_at"
        )
        
        messages = [
            ChatMessage(
                role=msg["role"],
                content=msg["content"],
                audio_file_id=msg.get("audio_file_id"),
                created_at=msg["created_at"]
            )
            for msg in messages_data
        ]
        
        return ChatConversation(
            id=conversation["id"],
            user_id=conversation["user_id"],
            title=conversation["title"],
            messages=messages,
            created_at=conversation["created_at"],
            updated_at=conversation["updated_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get conversation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve conversation"
        )


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    user: dict = Depends(get_authenticated_user)
):
    """
    Delete a conversation and all its messages
    
    Args:
        conversation_id: Conversation ID
        user: Authenticated user (from dependency)
        
    Returns:
        Success message
    """
    try:
        # Verify conversation belongs to user
        conversations = await get_records(
            table_name="chat_conversations",
            filters={"id": conversation_id, "user_id": user.id}
        )
        
        if not conversations:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        # Delete messages first (due to foreign key constraint)
        messages = await get_records(
            table_name="chat_messages",
            filters={"conversation_id": conversation_id}
        )
        
        for message in messages:
            await delete_record("chat_messages", message["id"])
        
        # Delete conversation
        await delete_record("chat_conversations", conversation_id)
        
        return {"message": "Conversation deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete conversation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete conversation"
        )
