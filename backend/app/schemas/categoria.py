#Nota Revisa que si vas a crear un producto,
 #este traiga el código, el nombre y que el ID e la categoría
 #sea un número válido. Si algo falta, frena la petición ahí mismo 
#y le devuelve un error al frontend.

from pydantic import BaseModel, Field
from typing import Optional

class CategoriaBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100, description="Nombre único de la categoría")
    descripcion: Optional[str] = Field(None, max_length=500)

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaResponse(CategoriaBase):
    id: int

    class Config:
        from_attributes = True