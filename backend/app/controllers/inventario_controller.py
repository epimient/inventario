#Nota
#El que dirige 
#Extrae los datos limpios, se los pasa a la lógica
# de negocio y captura si hubo algún error para responderle
# un código 200 OK o un 500 Error al usuario.

from app.services.inventario_service import InventarioService
from fastapi import Response, status

class InventarioController:
    def __init__(self):
        self.service = InventarioService()

    def get_dashboard(self):
        return self.service.obtener_dashboard_stats()

    def get_alertas(self):
        _, alertas = self.service.obtener_alertas_y_estados()
        return alertas

    def inventario_completo(self):
        lotes, _ = self.service.obtener_alertas_y_estados()
        return lotes