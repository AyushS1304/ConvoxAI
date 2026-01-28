"""
Supabase Client Utility Module
Centralized Supabase client and helper functions for
authentication, storage, and database operations with RLS support.
"""

from supabase import create_client, Client
from convoxai.config import SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger(__name__)


# ------------------------------------------------------------------
# CLIENT SINGLETONS
# ------------------------------------------------------------------

class SupabaseClient:
    _anon: Optional[Client] = None
    _service: Optional[Client] = None

    @classmethod
    def anon(cls) -> Client:
        if cls._anon is None:
            cls._anon = create_client(SUPABASE_URL, SUPABASE_KEY)
        return cls._anon

    @classmethod
    def service(cls) -> Client:
        if cls._service is None:
            cls._service = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        return cls._service


def get_authed_rls_client(access_token: str) -> Client:
    """
    Create a client that respects RLS by forwarding the user's JWT.
    IMPORTANT: This client is ONLY for database (.table) usage.
    NOT for storage.
    """
    client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    client.postgrest.auth(access_token)
    return client


# ------------------------------------------------------------------
# AUTHENTICATION
# ------------------------------------------------------------------

async def sign_up_user(email: str, password: str, metadata: Optional[Dict[str, Any]] = None):
    client = SupabaseClient.anon()

    data = {"email": email, "password": password}
    if metadata:
        data["options"] = {"data": metadata}

    res = client.auth.sign_up(data)
    if not res.user:
        raise Exception("Failed to create user")
    return {"user": res.user, "session": res.session}


async def sign_in_user(email: str, password: str):
    client = SupabaseClient.anon()

    res = client.auth.sign_in_with_password({
        "email": email,
        "password": password,
    })

    if not res.user:
        raise Exception("Invalid credentials")

    return {"user": res.user, "session": res.session}


async def sign_out_user():
    client = SupabaseClient.anon()
    client.auth.sign_out()


async def get_user_from_token(access_token: str):
    client = SupabaseClient.anon()
    res = client.auth.get_user(access_token)
    if not res.user:
        raise Exception("Invalid token")
    return res.user


# ------------------------------------------------------------------
# STORAGE (SERVICE ROLE ONLY)
# ------------------------------------------------------------------

async def upload_file_to_storage(
    bucket_name: str,
    file_path: str,
    file_data: bytes,
    content_type: str,
) -> str:
    client = SupabaseClient.service()

    client.storage.from_(bucket_name).upload(
        path=file_path,
        file=file_data,
        file_options={
            "content-type": content_type,
            "upsert": False,
        },
    )

    # Return public URL
    return client.storage.from_(bucket_name).get_public_url(file_path)


async def delete_file_from_storage(bucket_name: str, file_path: str):
    client = SupabaseClient.service()
    client.storage.from_(bucket_name).remove([file_path])


async def get_signed_file_url(bucket_name: str, file_path: str, expires_in: int):
    client = SupabaseClient.service()
    res = client.storage.from_(bucket_name).create_signed_url(file_path, expires_in)
    return res["signedURL"]


# ------------------------------------------------------------------
# DATABASE (RLS SAFE)
# ------------------------------------------------------------------

async def insert_record(table: str, data: Dict[str, Any], access_token: str):
    client = get_authed_rls_client(access_token)
    res = client.table(table).insert(data).execute()
    return res.data[0]


async def update_record(table: str, record_id: str, data: Dict[str, Any], access_token: str):
    client = get_authed_rls_client(access_token)
    res = client.table(table).update(data).eq("id", record_id).execute()
    return res.data[0]


async def get_records(
    table: str,
    filters: Optional[Dict[str, Any]] = None,
    order_by: Optional[str] = None,
    limit: Optional[int] = None,
) -> List[Dict[str, Any]]:
    client = SupabaseClient.service()
    q = client.table(table).select("*")

    if filters:
        for k, v in filters.items():
            q = q.eq(k, v)

    if order_by:
        if order_by.endswith(".desc"):
            q = q.order(order_by.replace(".desc", ""), desc=True)
        else:
            q = q.order(order_by)

    if limit:
        q = q.limit(limit)

    res = q.execute()
    return res.data or []


async def delete_record(table: str, record_id: str, access_token: str):
    client = get_authed_rls_client(access_token)
    client.table(table).delete().eq("id", record_id).execute()
