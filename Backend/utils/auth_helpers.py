from core.models import UserResponse


def create_user_response(user) -> UserResponse:
    
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.user_metadata.get("full_name") if user.user_metadata else None,
        created_at=user.created_at
    )
