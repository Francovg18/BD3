import pandas as pd
import uuid
import random
import numpy as np
from datetime import datetime, timedelta
from cassandra.cluster import Cluster
from redis import Redis
import os

# Configuración
NUM_MESAS = 1000  # Cambiar a 35000 para pruebas finales
NUM_AUDITORIAS = 50  # Reducido proporcionalmente
VARIANCE_FACTOR = 0.5  # Controla la variación de pesos por departamento (50%)

# Conectar a Cassandra
cluster = Cluster(['localhost'])
session = cluster.connect('elecciones')

# Conectar a Redis
r = Redis(host='localhost', port=6379, decode_responses=True)

# Crear directorio para CSVs
os.makedirs('data', exist_ok=True)

# Generar datos para Mesa_Electoral
departamentos = ['La_Paz', 'Cochabamba', 'Santa_Cruz', 'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Pando', 'Beni']
mesas_data = []
for i in range(NUM_MESAS):
    id_mesa = str(uuid.uuid4())
    departamento = random.choice(departamentos)
    municipio = f"Municipio_{random.randint(1, 20)}"
    recinto = f"Recinto_{random.randint(1, 10)}"
    mesas_data.append({
        'id_mesa': id_mesa,
        'departamento': departamento,
        'municipio': municipio,
        'recinto': recinto
    })
mesas_df = pd.DataFrame(mesas_data)
mesas_df.to_csv('data/mesas.csv', index=False)

# Insertar en Cassandra
for _, row in mesas_df.iterrows():
    session.execute(
        """
        INSERT INTO Mesa_Electoral (id_mesa, departamento, municipio, recinto)
        VALUES (%s, %s, %s, %s)
        """,
        (uuid.UUID(row['id_mesa']), row['departamento'], row['municipio'], row['recinto'])
    )

# Generar datos para Partido_Politico
partidos_data = [
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Alianza Unidad', 'sigla': 'UN', 'estado': 'activo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Alianza Libre', 'sigla': 'LIBRE', 'estado': 'activo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Bolivia Súmate', 'sigla': 'SUMATE', 'estado': 'activo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Movimiento al Socialismo', 'sigla': 'MAS', 'estado': 'activo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Nueva Generación Política', 'sigla': 'NGP', 'estado': 'activo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Partido Demócrata Cristiano', 'sigla': 'PDC', 'estado': 'activo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Alianza Libertad y Progreso', 'sigla': 'ADN', 'estado': 'activo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Morena', 'sigla': 'MORENA', 'estado': 'activo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Alianza Fuerza del Pueblo', 'sigla': 'UCS', 'estado': 'activo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Votos en Blanco', 'sigla': 'NA', 'estado': 'activo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Alianza Popular', 'sigla': 'MTS', 'estado': 'inactivo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Frente para la Victoria', 'sigla': 'FPV', 'estado': 'inactivo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Movimiento Nacionalista Revolucionario', 'sigla': 'MNR', 'estado': 'inactivo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Acción Democrática Nacionalista', 'sigla': 'ADN', 'estado': 'inactivo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Pan-Bol', 'sigla': 'PAN-BOL', 'estado': 'inactivo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Comunidad Ciudadana', 'sigla': 'CC', 'estado': 'inactivo'}
]
partidos_df = pd.DataFrame(partidos_data)
partidos_df.to_csv('data/partidos.csv', index=False)

# Insertar en Cassandra
for _, row in partidos_df.iterrows():
    session.execute(
        """
        INSERT INTO Partido_Politico (id_partido, nombre, sigla, estado)
        VALUES (%s, %s, %s, %s)
        """,
        (uuid.UUID(row['id_partido']), row['nombre'], row['sigla'], row['estado'])
    )

# Generar pesos específicos por departamento
# pesos_globales = {
#     'Alianza Libre': 25,
#     'Nueva Generación Política': 22,
#     'Alianza Unidad': 16,
#     'Bolivia Súmate': 13,
#     'Movimiento al Socialismo': 10,
#     'Partido Demócrata Cristiano': 6,
#     'Votos en Blanco': 4,
#     'Alianza Libertad y Progreso': 3,
#     'Morena': 1,
#     'Alianza Fuerza del Pueblo': 1
# }

pesos_globales = {
    # 1
    'Alianza Libre': 22,
    'Nueva Generación Política': 18,
    'Alianza Unidad': 14,
    'Bolivia Súmate': 14,
    'Movimiento al Socialismo': 11,
    'Partido Demócrata Cristiano': 6,
    'Votos en Blanco': 4,
    'Alianza Libertad y Progreso': 3,
    'Morena': 3,
    'Alianza Fuerza del Pueblo': 3
}

# Rangos de votos por mesa por departamento (reflecta diferencias de participación)
votos_por_mesa_rangos = {
    'La_Paz': (80, 250),        # Alta participación
    'Cochabamba': (70, 220),
    'Santa_Cruz': (90, 300),    # Muy alta participación
    'Oruro': (50, 180),
    'Potosí': (50, 170),
    'Chuquisaca': (60, 190),
    'Tarija': (60, 200),
    'Pando': (40, 150),         # Baja participación
    'Beni': (50, 180)
}

# Generar pesos por departamento con variación
pesos_por_departamento = {}
for dep in departamentos:
    pesos_dep = {}
    for partido, peso in pesos_globales.items():
        # Aplicar variación aleatoria (normal, centrada en el peso global)
        variacion = np.random.normal(0, peso * VARIANCE_FACTOR)
        peso_ajustado = max(1, peso + variacion)  # Evitar pesos negativos o cercanos a 0
        pesos_dep[partido] = peso_ajustado
    # Normalizar para que sumen 100 (mantener proporcionalidad relativa)
    total = sum(pesos_dep.values())
    pesos_dep = {k: (v / total) * 100 for k, v in pesos_dep.items()}
    pesos_por_departamento[dep] = pesos_dep

# Generar datos para Votos con distribución ponderada por departamento
partidos_ids = {row['sigla']: row['id_partido'] for _, row in partidos_df.iterrows() if row['estado'] == 'activo'}
votos_data = []
base_time = datetime.now() - timedelta(days=1)
for id_mesa in mesas_df['id_mesa']:
    departamento = mesas_df[mesas_df['id_mesa'] == id_mesa]['departamento'].iloc[0]
    # Obtener rango de votos para el departamento
    min_votos, max_votos = votos_por_mesa_rangos[departamento]
    total_votos_mesa = random.randint(min_votos, max_votos)
    # Usar pesos específicos del departamento
    pesos_dep = pesos_por_departamento[departamento]
    votos_por_partido = random.choices(
        list(pesos_dep.keys()),
        weights=list(pesos_dep.values()),
        k=total_votos_mesa
    )
    conteo = {nombre: votos_por_partido.count(nombre) for nombre in pesos_dep.keys()}
    for nombre, votos in conteo.items():
        id_partido = partidos_ids[partidos_df[partidos_df['nombre'] == nombre]['sigla'].iloc[0]]
        fecha_hora = (base_time + timedelta(minutes=random.randint(0, 1440))).strftime('%Y-%m-%d %H:%M:%S')
        votos_data.append({
            'id_mesa': id_mesa,
            'id_partido': id_partido,
            'votos': votos,
            'fecha_hora': fecha_hora
        })
votos_df = pd.DataFrame(votos_data)
votos_df.to_csv('data/votos.csv', index=False)

# Insertar en Cassandra
for _, row in votos_df.iterrows():
    session.execute(
        """
        INSERT INTO Votos (id_mesa, id_partido, votos, fecha_hora)
        VALUES (%s, %s, %s, %s)
        """,
        (uuid.UUID(row['id_mesa']), uuid.UUID(row['id_partido']), row['votos'], row['fecha_hora'])
    )

# Actualizar Redis
votos_por_departamento = {}
for id_mesa in votos_df['id_mesa'].unique():
    mesa = mesas_df[mesas_df['id_mesa'] == id_mesa].iloc[0]
    departamento = mesa['departamento']
    votos_mesa = votos_df[votos_df['id_mesa'] == id_mesa]
    for _, row in votos_mesa.iterrows():
        id_partido = row['id_partido']
        votos = row['votos']
        # Totales por departamento
        if departamento not in votos_por_departamento:
            votos_por_departamento[departamento] = {}
        votos_por_departamento[departamento][id_partido] = votos_por_departamento[departamento].get(id_partido, 0) + votos
        # Votos por mesa
        r.hincrby(f'votos_actuales:mesa:{id_mesa}', id_partido, votos)
        # Histórico
        r.zadd(f'votos_hist:mesa:{id_mesa}:{id_partido}', {str(votos): int(datetime.strptime(row['fecha_hora'], '%Y-%m-%d %H:%M:%S').timestamp() * 1000)})

# Guardar totales por departamento en Redis
for departamento, partidos in votos_por_departamento.items():
    for id_partido, total in partidos.items():
        r.hset(f'votos_totales:departamento:{departamento}', id_partido, total)

# Generar datos para Log_Auditoria
auditoria_data = []
for _ in range(NUM_AUDITORIAS):
    id_mesa = random.choice(mesas_df['id_mesa'].tolist())
    user_id = f"Usuario_{random.randint(1, 20)}"
    accion = random.choice(['inserción', 'edición', 'eliminación'])
    partido_afectado = random.choice([row['id_partido'] for _, row in partidos_df.iterrows() if row['estado'] == 'activo'])
    fecha_hora = (base_time + timedelta(minutes=random.randint(0, 1440))).strftime('%Y-%m-%d %H:%M:%S')
    auditoria_data.append({
        'id_mesa': id_mesa,
        'user_id': user_id,
        'accion': accion,
        'partido_afectado': partido_afectado,
        'fecha_hora': fecha_hora
    })
auditoria_df = pd.DataFrame(auditoria_data)
auditoria_df.to_csv('data/auditoria.csv', index=False)

# Insertar en Cassandra
for _, row in auditoria_df.iterrows():
    session.execute(
        """
        INSERT INTO Log_Auditoria (id_mesa, user_id, accion, partido_afectado, fecha_hora)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (uuid.UUID(row['id_mesa']), row['user_id'], row['accion'], uuid.UUID(row['partido_afectado']), row['fecha_hora'])
    )

# Actualizar Redis (auditoría)
for _, row in auditoria_df.iterrows():
    r.xadd('log_auditoria', {
        'user_id': row['user_id'],
        'accion': row['accion'],
        'partido_afectado': row['partido_afectado'],
        'id_mesa': row['id_mesa'],
        'fecha_hora': row['fecha_hora']
    })

print("Datos generados e importados a Cassandra y Redis. Archivos CSV guardados.")