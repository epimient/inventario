from pydantic import BaseModel, Field
from typing import Optional

class ProductoBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=150)
    descripcion: Optional[str] = Field(None, max_length=500)
    categoria_id: int

class ProductoCreate(ProductoBase):
    pass

class ProductoResponse(ProductoBase):
    id: int

    class Config:
        from_attributes = True