from flask import request, jsonify
from auth.firebase_auth import verify_token_and_role
from database.cassandra_conn import session
from database.redis_conn import get_redis_connection
from services.log_service import log_audit
from utils.decorators import medir_tiempo_endpoint
import uuid
from datetime import datetime


def register_routes(app):
    r = get_redis_connection()

    @app.route("/mesas", methods=['GET'])
    @medir_tiempo_endpoint("mesas")
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

    @app.route("/votos/jurado", methods=['GET'])
    @medir_tiempo_endpoint("votos_jurado")
    def jurado_crud():
        user_id, error_response, status = verify_token_and_role(
            request, 'juror')
        if error_response:
            return jsonify(error_response), status

        id_mesa_asignada = request.args.get('id_mesa')
        if not id_mesa_asignada:
            return jsonify({"error": "id_mesa requerido"}), 400

        try:
            mesa = session.execute("SELECT id_mesa, departamento FROM Mesa_Electoral WHERE id_mesa = %s", [
                                   uuid.UUID(id_mesa_asignada)]).one()
            if not mesa:
                return jsonify({"error": "Mesa no encontrada"}), 404

            votos = session.execute("SELECT id_mesa, id_partido, votos, fecha_hora FROM Votos WHERE id_mesa = %s", [
                                    uuid.UUID(id_mesa_asignada)])
            data = [{"id_mesa": str(v.id_mesa), "id_partido": str(
                v.id_partido), "total_votos": v.votos, "fecha_hora": v.fecha_hora.isoformat()} for v in votos]
            return jsonify({"data": data})

        except Exception as e:
            return jsonify({"error": f"Error interno: {str(e)}"}), 500

    @app.route("/votos/admin", methods=['PUT', 'DELETE', 'GET'])
    @medir_tiempo_endpoint("votos_admin")
    def admin_crud():
        user_id, error_response, status = verify_token_and_role(
            request, 'admin')
        if error_response:
            return jsonify(error_response), status

        try:
            if request.method == 'PUT':
                data = request.json
                id_mesa = data.get('id_mesa')
                id_partido = data.get('id_partido')
                total_votos = data.get('total_votos')
                if not all([id_mesa, id_partido, total_votos is not None]):
                    return jsonify({"error": "Faltan campos requeridos"}), 400

                voto = session.execute("SELECT id_mesa, id_partido, votos FROM Votos WHERE id_mesa = %s AND id_partido = %s", [
                                       uuid.UUID(id_mesa), uuid.UUID(id_partido)]).one()
                if not voto:
                    return jsonify({"error": "Voto no encontrado"}), 404

                mesa = session.execute("SELECT departamento FROM Mesa_Electoral WHERE id_mesa = %s", [
                                       uuid.UUID(id_mesa)]).one()
                if not mesa:
                    return jsonify({"error": "Mesa no encontrada"}), 404

                session.execute("UPDATE Votos SET votos = %s, fecha_hora = %s, user_id = %s WHERE id_mesa = %s AND id_partido = %s",
                                [total_votos, datetime.now(), user_id, uuid.UUID(id_mesa), uuid.UUID(id_partido)])

                diferencia = total_votos - voto.votos
                r.hincrby(
                    f'votos_totales:departamento:{mesa.departamento}', id_partido, diferencia)
                r.hincrby(
                    f'votos_totales:mesa:{id_mesa}', id_partido, diferencia)

                log_audit(
                    user_id, f"Actualización de {total_votos} votos para partido {id_partido} en mesa {id_mesa}", id_mesa)
                return jsonify({"message": "Voto actualizado exitosamente"}), 200

            elif request.method == 'DELETE':
                id_mesa = request.args.get('id_mesa')
                id_partido = request.args.get('id_partido')
                if not all([id_mesa, id_partido]):
                    return jsonify({"error": "id_mesa e id_partido requeridos"}), 400

                voto = session.execute("SELECT id_mesa, id_partido, votos FROM Votos WHERE id_mesa = %s AND id_partido = %s", [
                                       uuid.UUID(id_mesa), uuid.UUID(id_partido)]).one()
                if not voto:
                    return jsonify({"error": "Voto no encontrado"}), 404

                mesa = session.execute("SELECT departamento FROM Mesa_Electoral WHERE id_mesa = %s", [
                                       uuid.UUID(id_mesa)]).one()
                if not mesa:
                    return jsonify({"error": "Mesa no encontrada"}), 404

                session.execute("DELETE FROM Votos WHERE id_mesa = %s AND id_partido = %s", [
                                uuid.UUID(id_mesa), uuid.UUID(id_partido)])

                r.hincrby(
                    f'votos_totales:departamento:{mesa.departamento}', id_partido, -voto.votos)
                r.hincrby(
                    f'votos_totales:mesa:{id_mesa}', id_partido, -voto.votos)

                log_audit(
                    user_id, f"Eliminación de voto para partido {id_partido} en mesa {id_mesa}", id_mesa)
                return jsonify({"message": "Voto eliminado exitosamente"}), 200

            elif request.method == 'GET':
                id_mesa = request.args.get('id_mesa')
                if id_mesa:
                    votos = session.execute(
                        "SELECT id_mesa, id_partido, votos, fecha_hora FROM Votos WHERE id_mesa = %s", [uuid.UUID(id_mesa)])
                else:
                    votos = session.execute(
                        "SELECT id_mesa, id_partido, votos, fecha_hora FROM Votos")
                data = [{"id_mesa": str(v.id_mesa), "id_partido": str(
                    v.id_partido), "total_votos": v.votos, "fecha_hora": v.fecha_hora.isoformat()} for v in votos]
                return jsonify({"data": data})

        except Exception as e:
            return jsonify({"error": f"Error interno: {str(e)}"}), 500

    @app.route("/partidos", methods=['GET'])
    @medir_tiempo_endpoint("partidos")
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

# Endpoint para obtener recintos por departamento y municipio

    @app.route("/recintos", methods=['GET'])
    @medir_tiempo_endpoint("recintos")
    def get_recintos():
        try:
            departamento = request.args.get('departamento')
            municipio = request.args.get('municipio')
            if not all([departamento, municipio]):
                return jsonify({"error": "departamento y municipio requeridos"}), 400

            mesas = session.execute(
                "SELECT recinto FROM Mesa_Electoral WHERE departamento = %s AND municipio = %s",
                [departamento, municipio]
            )
            recintos = [m.recinto for m in mesas]
            return jsonify({"data": recintos})
        except Exception as e:
            print(f"Error en /recintos: {str(e)}")
            return jsonify({"error": f"Error interno: {str(e)}"}), 500

    @app.route("/votos", methods=['GET'])
    @medir_tiempo_endpoint("votos")
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
            departamentos = ['La_Paz', 'Cochabamba', 'Santa_Cruz',
                             'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Pando', 'Beni']
            if departamento and departamento != 'todos':
                for idp in partidos_info:
                    votos = r.hget(
                        f'votos_totales:departamento:{departamento}', idp) or 0
                    conteo[idp] = int(votos)
            else:
                for dep in departamentos:
                    for idp in partidos_info:
                        votos = r.hget(
                            f'votos_totales:departamento:{dep}', idp) or 0
                        conteo[idp] += int(votos)
            total_votos = sum(conteo.values())
            data = []
            for idp, cantidad in conteo.items():
                if idp in partidos_info:
                    info = partidos_info[idp]
                    porcentaje = (cantidad / total_votos *
                                  100) if total_votos > 0 else 0
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
    @medir_tiempo_endpoint("votos_por_depaetamento")
    def votos_por_departamento():
        try:
            departamentos = ['La_Paz', 'Cochabamba', 'Santa_Cruz',
                             'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Pando', 'Beni']
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
                    votos = r.hget(
                        f'votos_totales:departamento:{dep}', idp) or 0
                    conteo[idp] = int(votos)
                total_votos = sum(conteo.values())
                if total_votos > 0:
                    idp_max = max(conteo, key=conteo.get)
                    porcentaje = (conteo[idp_max] / total_votos *
                                  100) if total_votos > 0 else 0
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
