from pydantic import BaseModel, Field
from datetime import date

class LoteBase(BaseModel):
    producto_id: int
    cantidad: int = Field(..., ge=0, description="La cantidad no puede ser negativa")
    fecha_vencimiento: date

class LoteCreate(LoteBase):
    pass

class LoteResponse(LoteBase):
    id: int

    class Config:
        from_attributes = True