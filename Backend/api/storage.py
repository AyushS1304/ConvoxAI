"""
Storage API Endpoints
Upload, list, fetch and delete audio files using Supabase Storage + RLS
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials
from core.models import AudioFileMetadata, AudioFileUploadResponse
from utils.supabase_client import (
    upload_file_to_storage,
    delete_file_from_storage,
    get_signed_file_url,
    insert_record,
    get_records,
    delete_record,
)
from api.auth import get_authenticated_user, security
from pathlib import Path
from typing import List
import logging
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/storage", tags=["Storage"])

AUDIO_BUCKET = "audio-files"
ALLOWED_EXTENSIONS = {".wav", ".mp3", ".m4a", ".flac", ".ogg"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


# ---------------- UPLOAD ---------------- #

@router.post("/upload", response_model=AudioFileUploadResponse)
async def upload_audio_file(
    audio_file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    user=Depends(get_authenticated_user),
):
    logger.info(f"File upload initiated: {audio_file.filename} by user={user.id}")
    try:
        ext = Path(audio_file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(400, f"Invalid format: {ext}")

        if not audio_file.content_type.startswith("audio/"):
            raise HTTPException(400, "Invalid audio content type")

        file_data = await audio_file.read()
        file_size = len(file_data)
        logger.debug(f"File read: size={file_size} bytes, type={audio_file.content_type}")

        # if file_size > MAX_FILE_SIZE:
        #     raise HTTPException(413, "File too large (max 50MB)")

        file_id = str(uuid.uuid4())
        filename = f"{file_id}{ext}"

        # MUST match storage RLS: folder = auth.uid()
        storage_path = f"{user.id}/{filename}"

        storage_url = await upload_file_to_storage(
            bucket_name=AUDIO_BUCKET,
            file_path=storage_path,
            file_data=file_data,
            content_type=audio_file.content_type,
        )
        logger.debug(f"File uploaded to storage: {storage_path}")

        metadata = {
            "id": file_id,
            "user_id": user.id,
            "filename": audio_file.filename,
            "storage_path": storage_path,
            "file_size": file_size,
            "created_at": datetime.utcnow().isoformat(),
        }

        await insert_record(
            table="audio_files",
            data=metadata,
            access_token=credentials.credentials,
        )
        
        logger.info(f"File upload successful: {audio_file.filename}, file_id={file_id}")
        return AudioFileUploadResponse(
            file_id=file_id,
            filename=audio_file.filename,
            storage_url=storage_url,
            message="File uploaded successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Upload failed")
        raise HTTPException(500, str(e))


# ---------------- LIST ---------------- #

@router.get("/files", response_model=List[AudioFileMetadata])
async def list_user_files(user=Depends(get_authenticated_user)):
    logger.debug(f"Listing files for user_id: {user.id}")
    try:
        files = await get_records(
            table="audio_files",
            filters={"user_id": user.id},
            order_by="created_at.desc",
            limit=100,
        )
        logger.info(f"Retrieved {len(files)} files for user_id: {user.id}")
        return [AudioFileMetadata(**f) for f in files]

    except Exception:
        logger.exception("List files failed")
        raise HTTPException(500, "Failed to retrieve files")


# ---------------- GET FILE ---------------- #

@router.get("/file/{file_id}")
async def get_file(file_id: str, user=Depends(get_authenticated_user)):
    logger.debug(f"Retrieving file: file_id={file_id}, user_id={user.id}")
    try:
        files = await get_records(
            table="audio_files",
            filters={"id": file_id, "user_id": user.id},
        )

        if not files:
            raise HTTPException(404, "File not found")

        meta = files[0]

        signed_url = await get_signed_file_url(
            bucket_name=AUDIO_BUCKET,
            file_path=meta["storage_path"],
            expires_in=300,
        )
        
        logger.info(f"File retrieved: file_id={file_id}, filename={meta['filename']}")
        return {
            "file_id": meta["id"],
            "filename": meta["filename"],
            "url": signed_url,
            "file_size": meta["file_size"],
            "created_at": meta["created_at"],
        }

    except HTTPException:
        raise
    except Exception:
        logger.exception("Get file failed")
        raise HTTPException(500, "Failed to retrieve file")


# ---------------- DELETE ---------------- #

@router.delete("/file/{file_id}")
async def delete_file(
    file_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    user=Depends(get_authenticated_user),
):
    logger.info(f"File deletion requested: file_id={file_id}, user_id={user.id}")
    try:
        files = await get_records(
            table="audio_files",
            filters={"id": file_id, "user_id": user.id},
        )

        if not files:
            raise HTTPException(404, "File not found")

        meta = files[0]

        await delete_file_from_storage(AUDIO_BUCKET, meta["storage_path"])

        await delete_record(
            table="audio_files",
            record_id=file_id,
            access_token=credentials.credentials,
        )
        
        logger.info(f"File deleted successfully: file_id={file_id}")
        return {"message": "File deleted successfully"}

    except HTTPException:
        raise
    except Exception:
        logger.exception("Delete failed")
        raise HTTPException(500, "Failed to delete file")