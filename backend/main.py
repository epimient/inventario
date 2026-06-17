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

import os
from fastapi.staticfiles import StaticFiles

# 2. Incluir las rutas de la API
app.include_router(api_router, prefix="/api")

# Montar el frontend para servir archivos estáticos (index.html, css/, js/)
frontend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")