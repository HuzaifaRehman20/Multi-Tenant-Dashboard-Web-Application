from flask import Blueprint, jsonify, g
from middleware import token_required, admin_required
from supabase_client import get_admin_client

users_bp = Blueprint('users', __name__)


@users_bp.route('/me', methods=['GET'])
@token_required
def get_me():
    """Return the currently logged-in user's profile."""
    return jsonify({'user': g.profile}), 200


@users_bp.route('/org-members', methods=['GET'])
@token_required
@admin_required
def get_org_members():
    """Admin-only: list all members of the admin's organization."""
    client = get_admin_client()
    try:
        result = client.table('profiles').select(
            'id, full_name, email, role, created_at'
        ).eq('organization_id', g.org_id).order('full_name').execute()

        return jsonify({'members': result.data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
