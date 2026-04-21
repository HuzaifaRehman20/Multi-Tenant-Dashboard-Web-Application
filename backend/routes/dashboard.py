from flask import Blueprint, jsonify, g
from middleware import token_required
from supabase_client import get_admin_client

dashboard_bp = Blueprint('dashboard', __name__)


def get_client():
    return get_admin_client()


@dashboard_bp.route('/stats', methods=['GET'])
@token_required
def get_stats():
    """
    Returns stat card data (totals).
    - Admin: sees org-wide aggregates
    - User: sees only their own stats
    All filtering is done server-side using org_id and user_id from the verified JWT.
    """
    client = get_client()
    org_id = g.org_id
    user_id = g.user_id
    role = g.role

    try:
        if role == 'admin':
            # Org-wide totals
            sales_result = client.table('sales').select('amount').eq('organization_id', org_id).execute()
            activities_result = client.table('activities').select('id').eq('organization_id', org_id).execute()
            members_result = client.table('profiles').select('id').eq('organization_id', org_id).execute()

            total_sales = sum(row['amount'] for row in sales_result.data)
            total_activities = len(activities_result.data)
            total_members = len(members_result.data)

            return jsonify({
                'role': 'admin',
                'stats': {
                    'total_revenue': round(total_sales, 2),
                    'total_activities': total_activities,
                    'total_members': total_members,
                    'label_revenue': 'Organization Revenue',
                    'label_activities': 'Total Activities',
                    'label_members': 'Team Members'
                }
            })
        else:
            # User's own totals only
            sales_result = client.table('sales').select('amount').eq('organization_id', org_id).eq('user_id', user_id).execute()
            activities_result = client.table('activities').select('id').eq('organization_id', org_id).eq('user_id', user_id).execute()

            my_sales = sum(row['amount'] for row in sales_result.data)
            my_activities = len(activities_result.data)

            return jsonify({
                'role': 'user',
                'stats': {
                    'total_revenue': round(my_sales, 2),
                    'total_activities': my_activities,
                    'total_members': None,
                    'label_revenue': 'My Revenue',
                    'label_activities': 'My Activities',
                    'label_members': None
                }
            })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@dashboard_bp.route('/sales-trend', methods=['GET'])
@token_required
def get_sales_trend():
    """
    Line chart data: daily sales totals over the past 30 days.
    Admin: all org users aggregated. User: personal only.
    """
    client = get_client()
    org_id = g.org_id
    user_id = g.user_id
    role = g.role

    try:
        query = client.table('sales').select('sale_date, amount').eq('organization_id', org_id)

        if role != 'admin':
            query = query.eq('user_id', user_id)

        result = query.order('sale_date').execute()

        # Aggregate by date
        from collections import defaultdict
        daily_totals = defaultdict(float)
        for row in result.data:
            date = row['sale_date'][:10]  # Extract YYYY-MM-DD
            daily_totals[date] += row['amount']

        chart_data = [
            {'date': date, 'amount': round(amount, 2)}
            for date, amount in sorted(daily_totals.items())
        ]

        return jsonify({'chart_data': chart_data, 'role': role})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@dashboard_bp.route('/activity-breakdown', methods=['GET'])
@token_required
def get_activity_breakdown():
    """
    Bar chart data: activity counts by category.
    Admin: entire org. User: personal.
    """
    client = get_client()
    org_id = g.org_id
    user_id = g.user_id
    role = g.role

    try:
        query = client.table('activities').select('category, id').eq('organization_id', org_id)

        if role != 'admin':
            query = query.eq('user_id', user_id)

        result = query.execute()

        from collections import defaultdict
        category_counts = defaultdict(int)
        for row in result.data:
            category_counts[row['category']] += 1

        chart_data = [
            {'category': cat, 'count': count}
            for cat, count in sorted(category_counts.items())
        ]

        return jsonify({'chart_data': chart_data, 'role': role})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@dashboard_bp.route('/recent-sales', methods=['GET'])
@token_required
def get_recent_sales():
    """
    Table of recent sales records.
    Admin sees all org sales with user names. User sees only their own.
    """
    client = get_client()
    org_id = g.org_id
    user_id = g.user_id
    role = g.role

    try:
        if role == 'admin':
            result = client.table('sales').select(
                'id, amount, sale_date, description, profiles(full_name)'
            ).eq('organization_id', org_id).order('sale_date', desc=True).limit(10).execute()

            rows = [
                {
                    'id': r['id'],
                    'amount': r['amount'],
                    'date': r['sale_date'][:10],
                    'description': r['description'],
                    'user': r['profiles']['full_name'] if r.get('profiles') else 'Unknown'
                }
                for r in result.data
            ]
        else:
            result = client.table('sales').select(
                'id, amount, sale_date, description'
            ).eq('organization_id', org_id).eq('user_id', user_id).order('sale_date', desc=True).limit(10).execute()

            rows = [
                {
                    'id': r['id'],
                    'amount': r['amount'],
                    'date': r['sale_date'][:10],
                    'description': r['description'],
                    'user': g.profile['full_name']
                }
                for r in result.data
            ]

        return jsonify({'recent_sales': rows, 'role': role})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
