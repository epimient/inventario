from app.repositories.base_repository import BaseRepository

class ReportesRepository(BaseRepository):
    def obtener_datos_consolidados_inventario(self):
        """
        Obtiene una vista desnormalizada (JOIN) de lotes, productos y categorías
        optimizada exclusivamente para la generación de reportes y ordenada por fecha de vencimiento.
        """
        res = self.client.table("lotes").select(
            "id, cantidad, fecha_vencimiento, productos(nombre, categorias(nombre))"
        ).order("fecha_vencimiento").execute()
        
        return res.data