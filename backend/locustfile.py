from locust import HttpUser, task, between
import random


class UsuarioSimulado(HttpUser):
    wait_time = between(1, 2)

    @task(3)
    def consultar_votos(self):
        departamentos = ['La_Paz', 'Cochabamba', 'Santa_Cruz',
                         'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Pando', 'Beni']
        dep = random.choice(departamentos)
        self.client.get(f"/votos?departamento={dep}")

    @task(2)
    def consultar_mesas(self):
        self.client.get("/mesas")

    @task(1)
    def consultar_partidos(self):
        self.client.get("/partidos")


'''

from locust import HttpUser, task, between
import random
import uuid


class UsuarioSimulado(HttpUser):
    wait_time = between(1, 2)

    @task(2)
    def consultar_votos(self):
        departamentos = ['La_Paz', 'Cochabamba', 'Santa_Cruz',
                         'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Pando', 'Beni']
        dep = random.choice(departamentos)
        self.client.get(f"/votos?departamento={dep}")

    @task(1)
    def registrar_voto(self):
        id_mesa = "67d35871-8c2b-4ef0-9d5b-0bcbfa92f5e0"
        id_partido = "0c6e2b50-60cc-4f71-89b2-51dfbc6cebee"
        token = "tokennn"

        headers = {
            "Authorization": token,
            "Content-Type": "application/json"
        }

        self.client.post(f"/votos/jurado?id_mesa={id_mesa}", json={
            "id_partido": id_partido,
            "total_votos": random.randint(1, 10)
        }, headers=headers)

'''
