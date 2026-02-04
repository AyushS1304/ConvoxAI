from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger(__name__)
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
    client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    client.postgrest.auth(access_token)
    return client

async def sign_up_user(email: str, password: str, metadata: Optional[Dict[str, Any]] = None):
    logger.debug(f"Signing up user: {email}")
    client = SupabaseClient.anon()

    data = {"email": email, "password": password}
    if metadata:
        data["options"] = {"data": metadata}

    res = client.auth.sign_up(data)
    if not res.user:
        logger.error(f"Failed to create user: {email}")
        raise Exception("Failed to create user")
    logger.debug(f"User created successfully: {email}")
    return {"user": res.user, "session": res.session}


async def sign_in_user(email: str, password: str):
    logger.debug(f"Signing in user: {email}")
    client = SupabaseClient.anon()

    res = client.auth.sign_in_with_password({
        "email": email,
        "password": password,
    })

    if not res.user:
        logger.warning(f"Invalid credentials for: {email}")
        raise Exception("Invalid credentials")
    
    logger.debug(f"User signed in successfully: {email}")
    return {"user": res.user, "session": res.session}


async def sign_out_user():
    client = SupabaseClient.anon()
    client.auth.sign_out()


async def get_user_from_token(access_token: str):
    logger.debug("Getting user from access token")
    client = SupabaseClient.anon()
    res = client.auth.get_user(access_token)
    if not res.user:
        logger.warning("Invalid or expired access token")
        raise Exception("Invalid token")
    return res.user


async def upload_file_to_storage(
    bucket_name: str,
    file_path: str,
    file_data: bytes,
    content_type: str,
) -> str:
    logger.debug(f"Uploading file to storage: bucket={bucket_name}, path={file_path}")
    client = SupabaseClient.service()

    client.storage.from_(bucket_name).upload(
        path=file_path,
        file=file_data,
        file_options={
            "content-type": content_type,
            "upsert": False,
        },
    )

    public_url = client.storage.from_(bucket_name).get_public_url(file_path)
    logger.info(f"File uploaded successfully to: {file_path}")
    return public_url


async def delete_file_from_storage(bucket_name: str, file_path: str):
    logger.debug(f"Deleting file from storage: bucket={bucket_name}, path={file_path}")
    client = SupabaseClient.service()
    client.storage.from_(bucket_name).remove([file_path])
    logger.info(f"File deleted from storage: {file_path}")


async def get_signed_file_url(bucket_name: str, file_path: str, expires_in: int):
    logger.debug(f"Creating signed URL for: {file_path}, expires_in={expires_in}s")
    client = SupabaseClient.service()
    res = client.storage.from_(bucket_name).create_signed_url(file_path, expires_in)
    return res["signedURL"]


async def insert_record(table: str, data: Dict[str, Any], access_token: str):
    logger.debug(f"Inserting record into table: {table}")
    client = get_authed_rls_client(access_token)
    res = client.table(table).insert(data).execute()
    logger.debug(f"Record inserted into {table}")
    return res.data[0]


async def update_record(table: str, record_id: str, data: Dict[str, Any], access_token: str):
    logger.debug(f"Updating record in table: {table}, id={record_id}")
    client = get_authed_rls_client(access_token)
    res = client.table(table).update(data).eq("id", record_id).execute()
    logger.debug(f"Record updated in {table}")
    return res.data[0]


async def get_records(
    table: str,
    filters: Optional[Dict[str, Any]] = None,
    order_by: Optional[str] = None,
    limit: Optional[int] = None,
) -> List[Dict[str, Any]]:
    logger.debug(f"Getting records from table: {table}, filters={filters}")
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
    logger.debug(f"Retrieved {len(res.data or [])} records from {table}")
    return res.data or []


async def delete_record(table: str, record_id: str, access_token: str):
    logger.debug(f"Deleting record from table: {table}, id={record_id}")
    client = get_authed_rls_client(access_token)
    client.table(table).delete().eq("id", record_id).execute()
    logger.debug(f"Record deleted from {table}")
