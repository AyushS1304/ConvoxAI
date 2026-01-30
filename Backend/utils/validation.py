"""
File validation utilities for audio uploads.
"""

from pathlib import Path
from fastapi import UploadFile, HTTPException, status
import logging

logger = logging.getLogger(__name__)

# Constants
ALLOWED_AUDIO_EXTENSIONS = {".wav", ".mp3", ".m4a", ".flac", ".ogg"}
ALLOWED_AUDIO_MIME_TYPES = {
    "audio/wav", "audio/mpeg", "audio/mp4",
    "audio/x-m4a", "audio/flac", "audio/ogg"
}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


async def validate_audio_file(
    audio_file: UploadFile,
    check_size: bool = True,
    max_size: int = MAX_FILE_SIZE
) -> bytes:
    """
    Validate audio file extension and optionally size.
    
    Args:
        audio_file: The uploaded file to validate
        check_size: Whether to validate file size
        max_size: Maximum allowed file size in bytes
        
    Returns:
        File contents as bytes
        
    Raises:
        HTTPException: If validation fails
    """
    logger.debug(f"Validating audio file: {audio_file.filename}")
    if not audio_file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Audio file was not found in the upload"
        )
    
    # Check extension
    file_extension = Path(audio_file.filename).suffix.lower()
    if file_extension not in ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file format. Supported formats: {', '.join(ALLOWED_AUDIO_EXTENSIONS)}"
        )
    
    # Check size if requested
    contents = await audio_file.read()
    if check_size and len(contents) > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size: {max_size / 1024 / 1024:.0f}MB"
        )
    
    # Reset file pointer for subsequent reads
    await audio_file.seek(0)
    logger.debug(f"Audio file validation passed: {audio_file.filename}, size={len(contents)} bytes")
    return contents
