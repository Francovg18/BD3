import os
from firebase_admin import credentials, initialize_app, auth

cred = credentials.Certificate(os.path.join(
    os.path.dirname(__file__), '../firebase-adminsdk.json'))  # ajusta si estás fuera
initialize_app(cred)


def verify_token_and_role(request, required_role):
    token = request.headers.get('Authorization')
    if not token:
        return None, {"error": "Token requerido"}, 401
    try:
        if token.startswith('Bearer '):
            token = token[7:]
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token['uid']
        email = decoded_token['email']
        role = 'admin' if email.endswith('@admin.com') else 'juror'
        if role != required_role:
            return None, {"error": "Rol no autorizado"}, 403
        return user_id, None, 200
    except Exception as e:
        return None, {"error": f"Error de autenticación: {str(e)}"}, 401
