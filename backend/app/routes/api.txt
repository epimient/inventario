#---Recibe la petición del frontend y la deriva de inmediato

from fastapi import APIRouter, status, Depends, Query
from app.schemas.categoria import CategoriaCreate
from app.schemas.producto import ProductoCreate
from app.schemas.lote import LoteCreate
from app.controllers.inventario_controller import InventarioController
from app.repositories.inventario_repository import InventarioRepository
from app.services.report_service import ReportService
from datetime import date

router = APIRouter()
controller = InventarioController()
repo = InventarioRepository()
report_service = ReportService()

# --- DASHBOARD Y ALERTAS ---
@router.get("/dashboard")
def read_dashboard():
    return controller.get_dashboard()

@router.get("/alertas")
def read_alertas():
    return controller.get_alertas()

@router.get("/inventario")
def read_inventario():
    return controller.inventario_completo()

# --- CATEGORIAS ---
@router.get("/categorias")
def listar_categorias():
    return repo.get_categorias()

@router.post("/categorias", status_code=status.HTTP_201_CREATED)
def crear_categoria(payload: CategoriaCreate):
    return controller.service.registrar_categoria(payload.nombre, payload.descripcion)

@router.delete("/categorias/{id}")
def eliminar_categoria(id: int):
    return repo.delete_categoria(id)

# --- PRODUCTOS ---
@router.get("/productos")
def listar_productos():
    return repo.get_productos()

@router.post("/productos", status_code=status.HTTP_201_CREATED)
def crear_producto(payload: ProductoCreate):
    return controller.service.registrar_producto(payload.nombre, payload.descripcion, payload.categoria_id)

@router.delete("/productos/{id}")
def eliminar_producto(id: int):
    return repo.delete_producto(id)

# --- LOTES ---
@router.post("/lotes", status_code=status.HTTP_201_CREATED)
def crear_o_actualizar_lote(payload: LoteCreate):
    return controller.service.agregar_stock(payload.producto_id, payload.cantidad, payload.fecha_vencimiento)

@router.delete("/lotes/{id}")
def eliminar_lote(id: int):
    return repo.delete_lote(id)

# --- REPORTES ---
@router.get("/reportes/pdf")
def descargar_pdf():
    return report_service.generar_reporte_unico_inventario()