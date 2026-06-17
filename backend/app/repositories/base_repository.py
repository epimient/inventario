#Contiene las funciones específicas de consulta
#como buscarPorCodigo() o guardarNuevoProducto()

from app.database.supabase_client import supabase_client

class BaseRepository:
    """
    Repositorio base del cual heredarán todos los repositorios específicos.
    Centraliza la instancia del cliente de Supabase.
    """
    def __init__(self):
        self.client = supabase_client