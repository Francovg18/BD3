from datetime import datetime
import uuid
from database.redis_conn import get_redis_connection

r = get_redis_connection()


def log_audit(user_id, accion, id_mesa):
    log_id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()
    r.xadd('log_auditoria', {
        'id_log': log_id,
        'user_id': user_id,
        'accion': accion,
        'id_mesa': id_mesa,
        'fecha_hora': timestamp
    })
