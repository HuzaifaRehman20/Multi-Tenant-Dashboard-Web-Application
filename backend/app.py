from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os, jwt, base64

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key')

    # Allow requests from React dev server
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000"]}}, supports_credentials=True)

    from routes.auth import auth_bp
    from routes.dashboard import dashboard_bp
    from routes.users import users_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(users_bp, url_prefix='/api/users')

    @app.route('/api/debug-token', methods=['GET'])
    def debug_token():
        raw_secret = os.getenv("SUPABASE_JWT_SECRET", "")
        auth_header = request.headers.get('Authorization', '')
        token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else None

        result = {
            'jwt_secret_set': bool(raw_secret),
            'jwt_secret_length': len(raw_secret),
            'token_received': bool(token),
            'token_preview': token[:40] + '...' if token else None,
            'attempts': []
        }

        if token and raw_secret:
            # Attempt 1: raw string
            try:
                decoded = jwt.decode(token, raw_secret, algorithms=["HS256"], options={"verify_aud": False})
                result['attempts'].append({'secret_format': 'raw_string', 'success': True, 'sub': decoded.get('sub')})
            except Exception as e:
                result['attempts'].append({'secret_format': 'raw_string', 'success': False, 'error': str(e)})

            # Attempt 2: base64-decoded bytes
            try:
                padded = raw_secret + '=' * (4 - len(raw_secret) % 4)
                secret_bytes = base64.b64decode(padded)
                decoded = jwt.decode(token, secret_bytes, algorithms=["HS256"], options={"verify_aud": False})
                result['attempts'].append({'secret_format': 'base64_decoded_bytes', 'success': True, 'sub': decoded.get('sub')})
            except Exception as e:
                result['attempts'].append({'secret_format': 'base64_decoded_bytes', 'success': False, 'error': str(e)})

            # Attempt 3: base64url-decoded bytes
            try:
                secret_bytes = base64.urlsafe_b64decode(raw_secret + '==')
                decoded = jwt.decode(token, secret_bytes, algorithms=["HS256"], options={"verify_aud": False})
                result['attempts'].append({'secret_format': 'base64url_decoded_bytes', 'success': True, 'sub': decoded.get('sub')})
            except Exception as e:
                result['attempts'].append({'secret_format': 'base64url_decoded_bytes', 'success': False, 'error': str(e)})

        return jsonify(result), 200

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)