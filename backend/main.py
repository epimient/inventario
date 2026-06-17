from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.api import router as api_router

app = FastAPI(title="Smart Inventory API")

# 1. Configurar el guardián de CORS para permitir tu Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite que cualquier origen local se conecte
    allow_credentials=True,
    allow_methods=["*"],  # Permite GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Permite todos los encabezados
)

# 2. Incluir las rutas de la API
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "El backend de Smart Inventory está funcionando correctamente"}