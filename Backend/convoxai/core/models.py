# All the Pydantic Models are here Whether it is used for the chatbot or the Output parser or the Fastapi Things.
from pydantic import BaseModel, Field, EmailStr
from typing import List, Literal, Annotated, Any, Dict, Optional
from datetime import datetime

class SummaryResponse(BaseModel):
    summary: Annotated[str, Field(..., description="Write the Concise call summary From the Transcript")]
    duration_minutes: Annotated[int, Field(..., description="Calculate the Call duration in minutes")]
    no_of_participants: Annotated[int, Field(..., description="Count the number of participants")]
    key_aspects: Annotated[List[str], Field(..., description="List the key discussion points as bullet points")]
    sentiment: Annotated[Literal["Positive", "Negative", "Neutral"], Field(..., description="Mention the sentiment of the call")]


class APIResponse(BaseModel):
    status: Annotated[str, Field(..., description="What is the Status od the Model")]
    message: Annotated[str, Field(..., description="What is the Message")]
    model_info: Annotated[Dict[str, Any], Field(..., description="What is the Model Info")]

class ErrorResponse(BaseModel):
    error: Annotated[str, Field(..., description="What is the Error")]
    detail: Annotated[str, Field(..., description="What is the Detail")]

class ModelTestRequest(BaseModel):
    user_choice: Annotated[int, Field(..., description="Model choice: 1 for Google Gemini, 2 for Groq", ge=1, le=2)]
    query: Annotated[str, Field(..., description="Query to test the model with")]

class UserSignUp(BaseModel):
    email: EmailStr
    password: Annotated[str, Field(..., min_length=6, description="Password must be at least 6 characters")]
    full_name: Optional[str] = None

class UserSignIn(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    created_at: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None
    user: UserResponse

class AuthResponse(BaseModel):
    user: UserResponse
    session: TokenResponse


# Audio File Models
class AudioFileMetadata(BaseModel):
    id: Optional[str] = None
    user_id: str
    filename: str
    storage_path: str
    file_size: int
    duration: Optional[float] = None
    created_at: Optional[datetime] = None

class AudioFileUploadResponse(BaseModel):
    file_id: str
    filename: str
    storage_url: str
    message: str


# Chat History Models
class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    audio_file_id: Optional[str] = None
    created_at: Optional[datetime] = None

class ChatConversation(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: str
    messages: List[ChatMessage] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class SaveConversationRequest(BaseModel):
    title: str
    messages: List[ChatMessage]

class ConversationListResponse(BaseModel):
    id: str
    title: str
    message_count: int
    created_at: datetime
    updated_at: datetime


