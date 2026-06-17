
#database inicializa la conexión física con el servidor externo 
from supabase import create_client, Client
from app.config.settings import settings

try:
    supabase_client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
except Exception as e:
    raise RuntimeError(f"Error crítico conectando a Supabase: {str(e)}")