import time
from functools import wraps


def medir_tiempo_endpoint(nombre=""):
    def decorador(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            inicio = time.time()
            respuesta = f(*args, **kwargs)
            fin = time.time()
            duracion = round((fin - inicio) * 1000, 2)
            print(f"⏱️ Tiempo de respuesta ({nombre}): {duracion} ms")
            return respuesta
        return wrapper
    return decorador
