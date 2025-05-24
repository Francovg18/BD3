from flask import Flask, request, jsonify
from flask_cors import CORS
from cassandra.cluster import Cluster
from redis import Redis
from firebase_admin import initialize_app, credentials, auth
import uuid
from datetime import datetime
import os

# Inicializar la aplicación Flask
app = Flask(__name__)

# Configurar CORS con soporte para credenciales
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Inicializar Firebase Admin SDK
cred = credentials.Certificate(os.path.join(os.path.dirname(__file__), 'firebase-adminsdk.json'))
initialize_app(cred)

# Conectar a Cassandra
cluster = Cluster(['localhost'])
session = cluster.connect('elecciones')

# Conectar a Redis
r = Redis(host='localhost', port=6379, decode_responses=True)

# Middleware para verificar autenticación y rol
def verify_token_and_role(required_role):
    token = request.headers.get('Authorization')
    if not token:
        return None, jsonify({"error": "Token requerido"}), 401
    try:
        # Eliminar "Bearer " si está presente
        if token.startswith('Bearer '):
            token = token[7:]
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token['uid']
        # Verificar rol basado en email (simplificado)
        email = decoded_token['email']
        role = 'admin' if email.startswith('admin@') else 'juror'
        if role != required_role:
            return None, jsonify({"error": "Rol no autorizado"}), 403
        return user_id, None
    except Exception as e:
        return None, jsonify({"error": f"Error de autenticación: {str(e)}"}), 401

# Helper para registrar auditoría
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

# Endpoint para jurados (solo su mesa)
@app.route("/votos/jurado", methods=['POST', 'PUT', 'GET'])
def jurado_crud():
    user_id, error_response = verify_token_and_role('juror')
    if error_response:
        return error_response

    id_mesa_asignada = request.args.get('id_mesa')
    if not id_mesa_asignada:
        return jsonify({"error": "id_mesa requerido"}), 400

    try:
        # Validar que la mesa existe
        mesa = session.execute(
            "SELECT id_mesa, departamento FROM Mesa_Electoral WHERE id_mesa = %s",
            [uuid.UUID(id_mesa_asignada)]
        ).one()
        if not mesa:
            return jsonify({"error": "Mesa no encontrada"}), 404

        if request.method == 'POST':
            data = request.json
            id_partido = data.get('id_partido')
            total_votos = data.get('total_votos')
            if not all([id_partido, total_votos is not None]):
                return jsonify({"error": "Faltan campos requeridos"}), 400

            # Insertar o actualizar voto en Cassandra
            timestamp = datetime.now()
            session.execute(
                "INSERT INTO Votos (id_mesa, id_partido, fecha_hora, votos, user_id) "
                "VALUES (%s, %s, %s, %s, %s)",
                [uuid.UUID(id_mesa_asignada), uuid.UUID(id_partido), timestamp, total_votos, user_id]
            )

            # Actualizar Redis
            r.hincrby(f'votos_totales:departamento:{mesa.departamento}', id_partido, total_votos)
            r.hincrby(f'votos_totales:mesa:{id_mesa_asignada}', id_partido, total_votos)

            # Registrar auditoría
            log_audit(user_id, f"Registro de {total_votos} votos para partido {id_partido} en mesa {id_mesa_asignada}", id_mesa_asignada)
            return jsonify({"message": "Voto registrado exitosamente"}), 201

        elif request.method == 'PUT':
            data = request.json
            id_partido = data.get('id_partido')
            total_votos = data.get('total_votos')
            if not all([id_partido, total_votos is not None]):
                return jsonify({"error": "Faltan campos requeridos"}), 400

            # Verificar que el voto existe
            voto = session.execute(
                "SELECT id_mesa, id_partido, votos FROM Votos WHERE id_mesa = %s AND id_partido = %s",
                [uuid.UUID(id_mesa_asignada), uuid.UUID(id_partido)]
            ).one()
            if not voto:
                return jsonify({"error": "Voto no encontrado"}), 404

            # Actualizar voto en Cassandra
            session.execute(
                "UPDATE Votos SET votos = %s, fecha_hora = %s, user_id = %s "
                "WHERE id_mesa = %s AND id_partido = %s",
                [total_votos, datetime.now(), user_id, uuid.UUID(id_mesa_asignada), uuid.UUID(id_partido)]
            )

            # Ajustar Redis
            diferencia = total_votos - voto.votos
            r.hincrby(f'votos_totales:departamento:{mesa.departamento}', id_partido, diferencia)
            r.hincrby(f'votos_totales:mesa:{id_mesa_asignada}', id_partido, diferencia)

            # Registrar auditoría
            log_audit(user_id, f"Actualización de {total_votos} votos para partido {id_partido} en mesa {id_mesa_asignada}", id_mesa_asignada)
            return jsonify({"message": "Voto actualizado exitosamente"}), 200

        elif request.method == 'GET':
            votos = session.execute(
                "SELECT id_mesa, id_partido, votos, fecha_hora FROM Votos WHERE id_mesa = %s",
                [uuid.UUID(id_mesa_asignada)]
            )
            data = [
                {
                    "id_mesa": str(v.id_mesa),
                    "id_partido": str(v.id_partido),
                    "total_votos": v.votos,
                    "fecha_hora": v.fecha_hora.isoformat()
                }
                for v in votos
            ]
            return jsonify({"data": data})

    except Exception as e:
        print(f"Error en /votos/jurado: {str(e)}")
        return jsonify({"error": f"Error interno: {str(e)}"}), 500

# Endpoint para administradores (acceso completo)
@app.route("/votos/admin", methods=['POST', 'PUT', 'DELETE', 'GET'])
def admin_crud():
    user_id, error_response = verify_token_and_role('admin')
    if error_response:
        return error_response

    try:
        if request.method == 'POST':
            data = request.json
            id_mesa = data.get('id_mesa')
            id_partido = data.get('id_partido')
            total_votos = data.get('total_votos')
            if not all([id_mesa, id_partido, total_votos is not None]):
                return jsonify({"error": "Faltan campos requeridos"}), 400

            # Validar que la mesa existe
            mesa = session.execute(
                "SELECT id_mesa, departamento FROM Mesa_Electoral WHERE id_mesa = %s",
                [uuid.UUID(id_mesa)]
            ).one()
            if not mesa:
                return jsonify({"error": "Mesa no encontrada"}), 404

            # Insertar o actualizar voto en Cassandra
            timestamp = datetime.now()
            session.execute(
                "INSERT INTO Votos (id_mesa, id_partido, fecha_hora, votos, user_id) "
                "VALUES (%s, %s, %s, %s, %s)",
                [uuid.UUID(id_mesa), uuid.UUID(id_partido), timestamp, total_votos, user_id]
            )

            # Actualizar Redis
            r.hincrby(f'votos_totales:departamento:{mesa.departamento}', id_partido, total_votos)
            r.hincrby(f'votos_totales:mesa:{id_mesa}', id_partido, total_votos)

            # Registrar auditoría
            log_audit(user_id, f"Registro de {total_votos} votos para partido {id_partido} en mesa {id_mesa}", id_mesa)
            return jsonify({"message": "Voto registrado exitosamente"}), 201

        elif request.method == 'PUT':
            data = request.json
            id_mesa = data.get('id_mesa')
            id_partido = data.get('id_partido')
            total_votos = data.get('total_votos')
            if not all([id_mesa, id_partido, total_votos is not None]):
                return jsonify({"error": "Faltan campos requeridos"}), 400

            # Verificar que el voto existe usando la clave primaria completa
            voto = session.execute(
                "SELECT id_mesa, id_partido, votos FROM Votos WHERE id_mesa = %s AND id_partido = %s",
                [uuid.UUID(id_mesa), uuid.UUID(id_partido)]
            ).one()
            if not voto:
                return jsonify({"error": "Voto no encontrado"}), 404

            # Obtener el departamento de la mesa
            mesa = session.execute(
                "SELECT departamento FROM Mesa_Electoral WHERE id_mesa = %s",
                [uuid.UUID(id_mesa)]
            ).one()
            if not mesa:
                return jsonify({"error": "Mesa no encontrada"}), 404

            # Actualizar voto en Cassandra
            session.execute(
                "UPDATE Votos SET votos = %s, fecha_hora = %s, user_id = %s "
                "WHERE id_mesa = %s AND id_partido = %s",
                [total_votos, datetime.now(), user_id, uuid.UUID(id_mesa), uuid.UUID(id_partido)]
            )

            # Ajustar Redis
            diferencia = total_votos - voto.votos
            r.hincrby(f'votos_totales:departamento:{mesa.departamento}', id_partido, diferencia)
            r.hincrby(f'votos_totales:mesa:{id_mesa}', id_partido, diferencia)

            # Registrar auditoría
            log_audit(user_id, f"Actualización de {total_votos} votos para partido {id_partido} en mesa {id_mesa}", id_mesa)
            return jsonify({"message": "Voto actualizado exitosamente"}), 200

        elif request.method == 'DELETE':
            id_mesa = request.args.get('id_mesa')
            id_partido = request.args.get('id_partido')
            if not all([id_mesa, id_partido]):
                return jsonify({"error": "id_mesa e id_partido requeridos"}), 400

            # Verificar que el voto existe
            voto = session.execute(
                "SELECT id_mesa, id_partido, votos FROM Votos WHERE id_mesa = %s AND id_partido = %s",
                [uuid.UUID(id_mesa), uuid.UUID(id_partido)]
            ).one()
            if not voto:
                return jsonify({"error": "Voto no encontrado"}), 404

            # Obtener el departamento de la mesa
            mesa = session.execute(
                "SELECT departamento FROM Mesa_Electoral WHERE id_mesa = %s",
                [uuid.UUID(id_mesa)]
            ).one()
            if not mesa:
                return jsonify({"error": "Mesa no encontrada"}), 404

            # Eliminar voto en Cassandra
            session.execute(
                "DELETE FROM Votos WHERE id_mesa = %s AND id_partido = %s",
                [uuid.UUID(id_mesa), uuid.UUID(id_partido)]
            )

            # Ajustar Redis
            r.hincrby(f'votos_totales:departamento:{mesa.departamento}', id_partido, -voto.votos)
            r.hincrby(f'votos_totales:mesa:{id_mesa}', id_partido, -voto.votos)

            # Registrar auditoría
            log_audit(user_id, f"Eliminación de voto para partido {id_partido} en mesa {id_mesa}", id_mesa)
            return jsonify({"message": "Voto eliminado exitosamente"}), 200

        elif request.method == 'GET':
            id_mesa = request.args.get('id_mesa')
            if id_mesa:
                votos = session.execute(
                    "SELECT id_mesa, id_partido, votos, fecha_hora FROM Votos WHERE id_mesa = %s",
                    [uuid.UUID(id_mesa)]
                )
            else:
                votos = session.execute(
                    "SELECT id_mesa, id_partido, votos, fecha_hora FROM Votos"
                )
            data = [
                {
                    "id_mesa": str(v.id_mesa),
                    "id_partido": str(v.id_partido),
                    "total_votos": v.votos,
                    "fecha_hora": v.fecha_hora.isoformat()
                }
                for v in votos
            ]
            return jsonify({"data": data})

    except Exception as e:
        print(f"Error en /votos/admin: {str(e)}")
        return jsonify({"error": f"Error interno: {str(e)}"}), 500

# Endpoint para obtener mesas
@app.route("/mesas", methods=['GET'])
def get_mesas():
    try:
        id_mesa = request.args.get('id_mesa')
        if id_mesa:
            mesa = session.execute(
                "SELECT id_mesa, departamento, municipio, recinto FROM Mesa_Electoral WHERE id_mesa = %s",
                [uuid.UUID(id_mesa)]
            ).one()
            if not mesa:
                return jsonify({"error": "Mesa no encontrada"}), 404
            data = [{
                "id_mesa": str(mesa.id_mesa),
                "departamento": mesa.departamento,
                "municipio": mesa.municipio,
                "recinto": mesa.recinto
            }]
        else:
            mesas = session.execute(
                "SELECT id_mesa, departamento, municipio, recinto FROM Mesa_Electoral"
            )
            data = [
                {
                    "id_mesa": str(m.id_mesa),
                    "departamento": m.departamento,
                    "municipio": m.municipio,
                    "recinto": m.recinto
                }
                for m in mesas
            ]
        return jsonify({"data": data})
    except Exception as e:
        print(f"Error en /mesas: {str(e)}")
        return jsonify({"error": f"Error interno: {str(e)}"}), 500

# Endpoint para obtener partidos
@app.route("/partidos", methods=['GET'])
def get_partidos():
    try:
        partidos = session.execute(
            "SELECT id_partido, nombre, sigla FROM Partido_Politico WHERE estado = 'activo' ALLOW FILTERING"
        )
        data = [
            {
                "id_partido": str(p.id_partido),
                "nombre": p.nombre,
                "sigla": p.sigla
            }
            for p in partidos
        ]
        return jsonify({"data": data})
    except Exception as e:
        print(f"Error en /partidos: {str(e)}")
        return jsonify({"error": f"Error interno: {str(e)}"}), 500

# Resto de los endpoints (/votos, /votos_por_departamento, /auditoria) permanecen igual
@app.route("/votos", methods=['GET'])
def votos_por_partido():
    departamento = request.args.get('departamento')
    try:
        partidos = session.execute(
            "SELECT id_partido, nombre, sigla FROM Partido_Politico WHERE estado = 'activo' ALLOW FILTERING"
        )
        partidos_info = {
            str(p.id_partido): {"nombre": p.nombre, "sigla": p.sigla}
            for p in partidos
        }
        conteo = {idp: 0 for idp in partidos_info}
        departamentos = ['La_Paz', 'Cochabamba', 'Santa_Cruz', 'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Pando', 'Beni']
        if departamento and departamento != 'todos':
            for idp in partidos_info:
                votos = r.hget(f'votos_totales:departamento:{departamento}', idp) or 0
                conteo[idp] = int(votos)
        else:
            for dep in departamentos:
                for idp in partidos_info:
                    votos = r.hget(f'votos_totales:departamento:{dep}', idp) or 0
                    conteo[idp] += int(votos)
        total_votos = sum(conteo.values())
        data = []
        for idp, cantidad in conteo.items():
            if idp in partidos_info:
                info = partidos_info[idp]
                porcentaje = (cantidad / total_votos * 100) if total_votos > 0 else 0
                data.append({
                    "nombre": info["nombre"],
                    "sigla": info["sigla"],
                    "votos": cantidad,
                    "porcentaje": round(porcentaje, 2)
                })
        data.sort(key=lambda x: x["votos"], reverse=True)
        return jsonify({"data": data})
    except Exception as e:
        print(f"Error en /votos: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/votos_por_departamento", methods=['GET'])
def votos_por_departamento():
    try:
        departamentos = ['La_Paz', 'Cochabamba', 'Santa_Cruz', 'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Pando', 'Beni']
        partidos = session.execute(
            "SELECT id_partido, nombre, sigla FROM Partido_Politico WHERE estado = 'activo' ALLOW FILTERING"
        )
        partidos_info = {
            str(p.id_partido): {"nombre": p.nombre, "sigla": p.sigla}
            for p in partidos
        }
        data = []
        for dep in departamentos:
            conteo = {idp: 0 for idp in partidos_info}
            for idp in partidos_info:
                votos = r.hget(f'votos_totales:departamento:{dep}', idp) or 0
                conteo[idp] = int(votos)
            total_votos = sum(conteo.values())
            if total_votos > 0:
                idp_max = max(conteo, key=conteo.get)
                porcentaje = (conteo[idp_max] / total_votos * 100) if total_votos > 0 else 0
                data.append({
                    "departamento": dep,
                    "partido_ganador": partidos_info[idp_max]["nombre"],
                    "sigla": partidos_info[idp_max]["sigla"],
                    "porcentaje": round(porcentaje, 2)
                })
        return jsonify({"data": data})
    except Exception as e:
        print(f"Error en /votos_por_departamento: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/auditoria", methods=['GET'])
def auditoria():
    try:
        logs = r.xrange('log_auditoria', '-', '+', count=5)
        data = [
            {
                "user_id": log[1]['user_id'],
                "accion": log[1]['accion'],
                "id_mesa": log[1]['id_mesa'],
                "fecha_hora": log[1]['fecha_hora']
            }
            for log in logs
        ]
        return jsonify({"data": data})
    except Exception as e:
        print(f"Error en /auditoria: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)