from flask import Blueprint, request, jsonify
from supabase_client import get_supabase_client, get_admin_client

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    Register a new user.
    Body: { email, password, full_name, organization_id }
    organization_id must reference an existing org in the organizations table.
    """
    data = request.get_json()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()
    organization_id = data.get('organization_id')

    if not all([email, password, full_name, organization_id]):
        return jsonify({'error': 'All fields are required: email, password, full_name, organization_id'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    try:
        client = get_supabase_client()
        # Create auth user in Supabase Auth
        auth_result = client.auth.sign_up({"email": email, "password": password})

        if not auth_result.user:
            return jsonify({'error': 'Signup failed — no user returned'}), 400

        user_id = auth_result.user.id

        # Insert profile into our profiles table using admin client
        # (auth trigger may also do this, but we do it explicitly here for reliability)
        admin_client = get_admin_client()
        profile_data = {
            'id': user_id,
            'full_name': full_name,
            'email': email,
            'organization_id': organization_id,
            'role': 'user'  # Default role; admin must be set manually or via separate flow
        }
        admin_client.table('profiles').upsert(profile_data).execute()

        return jsonify({
            'message': 'Signup successful. Please check your email to confirm your account.',
            'user_id': user_id
        }), 201

    except Exception as e:
        error_msg = str(e)
        if 'already registered' in error_msg.lower() or 'already exists' in error_msg.lower():
            return jsonify({'error': 'Email already registered'}), 409
        return jsonify({'error': f'Signup error: {error_msg}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Log in an existing user.
    Body: { email, password }
    Returns Supabase session tokens + user profile.
    """
    data = request.get_json()
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    try:
        client = get_supabase_client()
        auth_result = client.auth.sign_in_with_password({"email": email, "password": password})

        if not auth_result.user or not auth_result.session:
            return jsonify({'error': 'Invalid credentials'}), 401

        user_id = auth_result.user.id
        access_token = auth_result.session.access_token
        refresh_token = auth_result.session.refresh_token

        # Fetch profile (org + role) — backend fetches this, not trusting frontend
        admin_client = get_admin_client()
        profile_result = admin_client.table('profiles').select(
            'id, full_name, email, role, organization_id, organizations(id, name)'
        ).eq('id', user_id).single().execute()

        if not profile_result.data:
            return jsonify({'error': 'User profile not found. Contact administrator.'}), 404

        profile = profile_result.data

        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'id': user_id,
                'email': email,
                'full_name': profile['full_name'],
                'role': profile['role'],
                'organization_id': profile['organization_id'],
                'organization_name': profile['organizations']['name'] if profile.get('organizations') else None
            }
        }), 200

    except Exception as e:
        error_msg = str(e)
        if 'invalid' in error_msg.lower() or 'credentials' in error_msg.lower():
            return jsonify({'error': 'Invalid email or password'}), 401
        return jsonify({'error': f'Login error: {error_msg}'}), 500


@auth_bp.route('/organizations', methods=['GET'])
def get_organizations():
    """Public endpoint to list all organizations for signup dropdown."""
    try:
        admin_client = get_admin_client()
        result = admin_client.table('organizations').select('id, name').order('name').execute()
        return jsonify({'organizations': result.data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
