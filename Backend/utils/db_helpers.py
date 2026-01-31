"""
Database helper utilities for common query patterns.
"""

from typing import Dict, Any, List
from fastapi import HTTPException, status
from utils.supabase_client import get_records
import logging

logger = logging.getLogger(__name__)


async def get_user_conversation(
    conversation_id: str,
    user_id: str
) -> Dict[str, Any]:
    """
    Get conversation by ID, ensuring it belongs to the user.
    
    Args:
        conversation_id: The conversation ID to retrieve
        user_id: The user ID who should own the conversation
        
    Returns:
        Conversation data dictionary
        
    Raises:
        HTTPException: If conversation not found or doesn't belong to user
    """
    conversations = await get_records(
        table="chat_conversations",
        filters={"id": conversation_id, "user_id": user_id}
    )
    
    if not conversations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    return conversations[0]


async def get_user_file(
    file_id: str,
    user_id: str
) -> Dict[str, Any]:
    """
    Get audio file by ID, ensuring it belongs to the user.
    
    Args:
        file_id: The file ID to retrieve
        user_id: The user ID who should own the file
        
    Returns:
        File metadata dictionary
        
    Raises:
        HTTPException: If file not found or doesn't belong to user
    """
    files = await get_records(
        table="audio_files",
        filters={"id": file_id, "user_id": user_id}
    )
    
    if not files:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    return files[0]
