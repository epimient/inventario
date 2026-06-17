from app.database.supabase_client import supabase_client
from fastapi import HTTPException

class InventarioRepository:
    def __init__(self):
        self.client = supabase_client

    # --- CATEGORIAS ---
    def get_categorias(self):
        res = self.client.table("categorias").select("*").order("nombre").execute()
        return res.data

    def get_categoria_by_nombre(self, nombre: str):
        res = self.client.table("categorias").select("*").eq("nombre", nombre).execute()
        return res.data[0] if res.data else None

    def create_categoria(self, data: dict):
        res = self.client.table("categorias").insert(data).execute()
        return res.data[0]

    def delete_categoria(self, id: int):
        # Verificar integridad referencial manual preventiva antes de fallar
        prod_check = self.client.table("productos").select("id").eq("categoria_id", id).execute()
        if prod_check.data:
            raise HTTPException(status_code=400, detail="No se puede eliminar una categoría con productos activos.")
        res = self.client.table("categorias").delete().eq("id", id).execute()
        return res.data

    # --- PRODUCTOS ---
    def get_productos(self):
        res = self.client.table("productos").select("*, categorias(nombre)").execute()
        return res.data

    def get_producto_by_id(self, id: int):
        res = self.client.table("productos").select("*").eq("id", id).execute()
        return res.data[0] if res.data else None

    def create_producto(self, data: dict):
        res = self.client.table("productos").insert(data).execute()
        return res.data[0]

    def delete_producto(self, id: int):
        res = self.client.table("productos").delete().eq("id", id).execute()
        return res.data

    # --- LOTES ---
    def get_lotes_by_producto_fecha(self, producto_id: int, fecha_vencimiento: str):
        res = self.client.table("lotes").select("*").eq("producto_id", producto_id).eq("fecha_vencimiento", fecha_vencimiento).execute()
        return res.data[0] if res.data else None

    def create_lote(self, data: dict):
        res = self.client.table("lotes").insert(data).execute()
        return res.data[0]

    def update_lote_cantidad(self, lote_id: int, nueva_cantidad: int):
        res = self.client.table("lotes").update({"cantidad": nueva_cantidad}).eq("id", lote_id).execute()
        return res.data[0]

    def get_todos_los_lotes(self):
        res = self.client.table("lotes").select("*, productos(nombre, categoria_id, categorias(nombre))").execute()
        return res.data

    def delete_lote(self, id: int):
        res = self.client.table("lotes").delete().eq("id", id).execute()
        return res.data