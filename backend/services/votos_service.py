import uuid
from datetime import datetime
from cassandra.cluster import Cluster
from database.redis_conn import get_redis_connection

r = get_redis_connection()
cluster = Cluster(['localhost'])
session = cluster.connect('elecciones')


def registrar_voto(id_mesa, id_partido, total_votos, user_id, departamento):
    timestamp = datetime.now()
    session.execute(
        "INSERT INTO Votos (id_mesa, id_partido, fecha_hora, votos, user_id) "
        "VALUES (%s, %s, %s, %s, %s)",
        [uuid.UUID(id_mesa), uuid.UUID(id_partido),
         timestamp, total_votos, user_id]
    )
    r.hincrby(
        f'votos_totales:departamento:{departamento}', id_partido, total_votos)
    r.hincrby(f'votos_totales:mesa:{id_mesa}', id_partido, total_votos)


def actualizar_voto(id_mesa, id_partido, nuevo_total, user_id, departamento, anterior_total):
    diferencia = nuevo_total - anterior_total
    session.execute(
        "UPDATE Votos SET votos = %s, fecha_hora = %s, user_id = %s "
        "WHERE id_mesa = %s AND id_partido = %s",
        [nuevo_total, datetime.now(), user_id, uuid.UUID(id_mesa),
         uuid.UUID(id_partido)]
    )
    r.hincrby(
        f'votos_totales:departamento:{departamento}', id_partido, diferencia)
    r.hincrby(f'votos_totales:mesa:{id_mesa}', id_partido, diferencia)


def eliminar_voto(id_mesa, id_partido, total_votos, departamento):
    session.execute(
        "DELETE FROM Votos WHERE id_mesa = %s AND id_partido = %s",
        [uuid.UUID(id_mesa), uuid.UUID(id_partido)]
    )
    r.hincrby(
        f'votos_totales:departamento:{departamento}', id_partido, -total_votos)
    r.hincrby(f'votos_totales:mesa:{id_mesa}', id_partido, -total_votos)
