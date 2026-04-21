import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Public client (respects RLS)
def get_supabase_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# Admin client (bypasses RLS — used only for server-side enforcement)
def get_admin_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
