#Nota 
#Realiza cálculos y validaciones de negocio. 
#Por eje verificar si un lote ya está vencido antes de ingresarlo,
# o calcular alertas críticas de stock. 
#El controlador no sabe hacer esto, el servicio sí.

from app.repositories.inventario_repository import InventarioRepository
from fastapi import HTTPException
from datetime import datetime, date

class InventarioService:
    def __init__(self):
        self.repo = InventarioRepository()

    def registrar_categoria(self, nombre: str, descripcion: str):
        if not nombre.strip():
            raise HTTPException(status_code=400, detail="El nombre de la categoría no puede estar vacío.")
        if self.repo.get_categoria_by_nombre(nombre):
            raise HTTPException(status_code=400, detail="La categoría ya existe.")
        return self.repo.create_categoria({"nombre": nombre, "descripcion": descripcion})

    def registrar_producto(self, nombre: str, descripcion: str, categoria_id: int):
        if not nombre.strip():
            raise HTTPException(status_code=400, detail="El nombre del producto no puede estar vacío.")
        return self.repo.create_producto({"nombre": nombre, "descripcion": descripcion, "categoria_id": categoria_id})

    def agregar_stock(self, producto_id: int, cantidad: int, fecha_vencimiento: date):
        if cantidad <= 0:
            raise HTTPException(status_code=400, detail="La cantidad debe ser mayor a cero.")
        
        fecha_str = fecha_vencimiento.isoformat()
        lote_existente = self.repo.get_lotes_by_producto_fecha(producto_id, fecha_str)
        
        if lote_existente:
            nueva_cantidad = lote_existente["cantidad"] + cantidad
            return self.repo.update_lote_cantidad(lote_existente["id"], nueva_cantidad)
        else:
            return self.repo.create_lote({
                "producto_id": producto_id,
                "cantidad": cantidad,
                "fecha_vencimiento": fecha_str
            })

    def obtener_alertas_y_estados(self):
        lotes = self.repo.get_todos_los_lotes()
        hoy = date.today()
        alertas = []

        for lote in lotes:
            fv = datetime.strptime(lote["fecha_vencimiento"], "%Y-%m-%d").date()
            dias_restantes = (fv - hoy).days
            
            # Determinación de Estado Visual y Nivel de Prioridad
            if dias_restantes <= 0:
                estado = "Rojo"
                alerta_msg = "Producto vencido"
                prioridad = 1
            elif dias_restantes <= 1:
                estado = "Rojo"
                alerta_msg = "Vence en 1 día"
                prioridad = 2
            elif dias_restantes <= 5:
                estado = "Amarillo"
                alerta_msg = "Vence en 5 días"
                prioridad = 3
            elif dias_restantes <= 15:
                estado = "Amarillo"
                alerta_msg = "Vence en 15 días"
                prioridad = 4
            elif dias_restantes <= 30:
                estado = "Amarillo"
                alerta_msg = "Vence en 30 días"
                prioridad = 5
            else:
                estado = "Verde"
                alerta_msg = "Estable"
                prioridad = 6

            lote["estado_visual"] = estado
            lote["alerta_mensaje"] = alerta_msg
            lote["dias_restantes"] = dias_restantes
            lote["prioridad"] = prioridad
            
            if prioridad < 6:
                alertas.append(lote)

        # Ordenar por prioridad (Los más urgentes primero)
        alertas.sort(key=lambda x: x["prioridad"])
        return lotes, alertas

    def obtener_dashboard_stats(self):
        lotes, alertas = self.obtener_alertas_y_estados()
        categorias = self.repo.get_categorias()
        productos = self.repo.get_productos()

        total_vencidos = sum(1 for l in lotes if l["dias_restantes"] <= 0)
        total_proximos = sum(1 for l in lotes if 0 < l["dias_restantes"] <= 30)
        inventario_total_unidades = sum(l["cantidad"] for l in lotes)

        return {
            "total_productos": len(productos),
            "total_categorias": len(categorias),
            "total_lotes": len(lotes),
            "productos_proximos_vencer": total_proximos,
            "productos_vencidos": total_vencidos,
            "inventario_total": inventario_total_unidades
        }