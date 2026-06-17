#define cómo se ven las tablas o entidades.

from typing import Optional
from datetime import datetime, date

class CategoríaDomain:
    def __init__(self, id: Optional[int], nombre: str, descripcion: Optional[str], fecha_creacion: Optional[datetime] = None):
        self.id = id
        self.nombre = nombre
        self.descripcion = descripcion
        self.fecha_creacion = fecha_creacion

class ProductoDomain:
    def __init__(self, id: Optional[int], nombre: str, descripcion: Optional[str], categoria_id: int, fecha_creacion: Optional[datetime] = None):
        self.id = id
        self.nombre = nombre
        self.descripcion = descripcion
        self.categoria_id = categoria_id
        self.fecha_creacion = fecha_creacion

class LoteDomain:
    def __init__(self, id: Optional[int], producto_id: int, cantidad: int, fecha_vencimiento: date, fecha_registro: Optional[datetime] = None):
        self.id = id
        self.producto_id = producto_id
        self.cantidad = cantidad
        self.fecha_vencimiento = fecha_vencimiento
        self.fecha_registro = fecha_registro