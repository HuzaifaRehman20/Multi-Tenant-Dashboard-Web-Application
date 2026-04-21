import os
import jwt
import requests
from functools import wraps, lru_cache
from flask import request, jsonify, g
from jwt.algorithms import ECAlgorithm
from supabase_client import get_admin_client

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")


@lru_cache(maxsize=1)
def _get_public_keys():
    """
    Fetch Supabase's JWKS (JSON Web Key Set) and return a dict of kid -> public_key.
    Cached after first call so we don't hit the network on every request.
    Supabase exposes its public keys at: <project_url>/auth/v1/.well-known/jwks.json
    """
    jwks_url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    print(f"[AUTH] Fetching JWKS from: {jwks_url}")
    resp = requests.get(jwks_url, timeout=10)
    resp.raise_for_status()
    jwks = resp.json()

    keys = {}
    for key_data in jwks.get("keys", []):
        kid = key_data.get("kid")
        # ECAlgorithm.from_jwk converts the JWK dict to a usable public key object
        public_key = ECAlgorithm.from_jwk(key_data)
        keys[kid] = public_key
        print(f"[AUTH] Loaded public key kid={kid}")
    return keys


def _verify_token(token):
    """
    Verify a Supabase JWT (ES256) using the project's public JWKS.
    Returns the decoded payload dict, or raises jwt.InvalidTokenError.
    """
    # Peek at the header to get the key ID (kid)
    header = jwt.get_unverified_header(token)
    alg = header.get("alg", "unknown")
    kid = header.get("kid")
    print(f"[AUTH] Token alg={alg}, kid={kid}")

    if alg == "ES256":
        public_keys = _get_public_keys()
        if kid not in public_keys:
            # Key not in cache — refresh once and retry
            _get_public_keys.cache_clear()
            public_keys = _get_public_keys()

        if kid not in public_keys:
            raise jwt.InvalidTokenError(f"No public key found for kid={kid}")

        return jwt.decode(
            token,
            public_keys[kid],
            algorithms=["ES256"],
            options={"verify_aud": False}
        )

    elif alg == "HS256":
        # Older Supabase projects still use HS256
        raw_secret = os.getenv("SUPABASE_JWT_SECRET", "")
        return jwt.decode(
            token,
            raw_secret,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )

    else:
        raise jwt.InvalidTokenError(f"Unsupported algorithm: {alg}")


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        token = None
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ', 1)[1].strip()

        if not token:
            print("[AUTH] ❌ No token in Authorization header")
            return jsonify({'error': 'Authorization token is missing'}), 401

        print(f"[AUTH] Token preview: {token[:40]}...")

        try:
            decoded = _verify_token(token)
        except jwt.ExpiredSignatureError:
            print("[AUTH] ❌ Token expired")
            return jsonify({'error': 'Token has expired — please log in again'}), 401
        except jwt.InvalidTokenError as e:
            print(f"[AUTH] ❌ Token invalid: {e}")
            return jsonify({'error': f'Invalid token: {str(e)}'}), 401
        except Exception as e:
            print(f"[AUTH] ❌ Unexpected error verifying token: {e}")
            return jsonify({'error': f'Token verification error: {str(e)}'}), 401

        user_id = decoded.get('sub')
        if not user_id:
            print("[AUTH] ❌ Token has no sub claim")
            return jsonify({'error': 'Token missing user ID'}), 401

        print(f"[AUTH] ✅ Token valid — user_id={user_id}")

        # Fetch profile from DB — this is where org + role are enforced server-side
        try:
            admin_client = get_admin_client()
            result = admin_client.table('profiles').select(
                'id, role, organization_id, full_name, organizations(id, name)'
            ).eq('id', user_id).single().execute()

            if not result.data:
                print(f"[AUTH] ❌ No profile row found for user_id={user_id}")
                return jsonify({'error': 'User profile not found — run the seed or check your profiles table'}), 404

            profile = result.data
            g.user_id = user_id
            g.org_id = profile['organization_id']
            g.role = profile['role']
            g.profile = profile
            print(f"[AUTH] ✅ Profile loaded — role={profile['role']} org={profile['organization_id']}")

        except Exception as e:
            print(f"[AUTH] ❌ DB error: {e}")
            return jsonify({'error': f'Failed to fetch user profile: {str(e)}'}), 500

        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if g.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated