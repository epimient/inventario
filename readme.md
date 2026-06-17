# Control Inteligente de Caducidad

Es una aplicación web empresarial de tipo SPA (Single Page Application) diseñada para gestionar inventarios de productos organizados por múltiples lotes y categorías, con un enfoque crítico en el monitoreo preventivo de fechas de vencimiento. 

El sistema cuenta con alertas visuales por colores (Verde, Amarillo, Rojo) basadas en la urgencia de caducidad y permite la exportación automática de reportes analíticos consolidados en formato PDF.

---

## Tecnologías Utilizadas y Dependencias

### Backend (Servidor API REST & Frontend Host)
El backend está construido en **Python** bajo una arquitectura limpia en capas (MVC/Repository). El mismo servidor **FastAPI** se encarga de exponer la API y de servir los archivos estáticos del frontend. Requiere las siguientes librerías principales:

* **FastAPI (v0.111.0):** Framework de alto rendimiento para la construcción de los endpoints y servir recursos estáticos.
* **Uvicorn (v0.30.1):** Servidor web de producción compatible con el estándar ASGI.
* **Pydantic (v2.7.4):** Motor de validación de datos para los esquemas de entrada y salida.
* **Pydantic-settings (v2.3.3):** Gestión segura de variables de entorno mediante archivos `.env`.
* **Supabase (v2.5.1):** SDK oficial para conectar y operar la base de datos PostgreSQL.
* **ReportLab (v4.2.2):** Motor gráfico para el renderizado automatizado de documentos PDF.
* **Python-multipart (v0.0.9):** Soporte interno de procesamiento para la carga de datos de formularios HTTP.

### Frontend (Interfaz de Usuario)
La interfaz es desacoplada y nativa, integrada dentro de la carpeta `frontend/`:
* **HTML5, CSS3 y JavaScript ES6+** (Estructura, estilos y lógica modular SPA).
* **Bootstrap 5 (Vía CDN):** Framework de diseño adaptivo y componentes UI responsivos.
* **Fetch API:** Mecanismo nativo del navegador para el consumo de la API REST.

---

## Estructura Esencial del Proyecto

```text
smart-inventory/
├── backend/                  # Código fuente del servidor Python
│   ├── app/                  # Capas lógicas (Models, Schemas, Repositories, Services, etc.)
│   ├── main.py               # Punto de entrada de FastAPI y host de archivos estáticos
│   ├── requirements.txt      # Archivo centralizador de dependencias
│   └── .env                  # Credenciales secretas (¡No subir a repositorios públicos!)
├── frontend/                 # Interfaz visual del cliente web
│   ├── index.html            # Archivo único de la SPA
│   ├── css/                  # Estilos visuales complementarios
│   └── js/                   # Controladores JavaScript y capa de servicios API
└── render.yaml               # Blueprint Configuration para despliegue en Render
```

---

## Guía de Instalación y Despliegue Local Paso a Paso

### 1. Preparación de la Base de Datos (Supabase)
1. Inicia sesión en tu consola de Supabase y crea un nuevo proyecto. (*El nombre del proyecto es "SistemaInv" la contraseña es e3!M%u@cyubuB4Z*).
2. Dirígete a la sección SQL Editor y ejecuta el script DDL provisto en el diseño de la base de datos (este script creará de forma automática las tablas `categorias`, `productos`, `lotes` y sus respectivos índices).

### 2. Configuración del Servidor y Despliegue
El proyecto sirve tanto el Frontend como el Backend de forma unificada bajo un solo servidor.

Abre tu terminal y navega hasta el directorio raíz del proyecto:

```bash
cd backend
```

Crea y activa un entorno virtual para aislar las librerías:

* **Windows:**
  ```bash
  python -m venv .venv
  .venv\Scripts\activate
  ```
* **Linux/macOS:**
  ```bash
  python -m venv .venv
  source .venv/bin/activate
  ```

Instala todas las dependencias requeridas:
```bash
pip install -r requirements.txt
```

Configura tus credenciales. Crea un archivo llamado `.env` dentro de la carpeta `backend/` con la siguiente estructura:

```env
SUPABASE_URL=https://tu-id-de-proyecto.supabase.co
SUPABASE_KEY=tu-clave-anon-publica-de-supabase
HOST=127.0.0.1
PORT=8000
```

Enciende el servidor de desarrollo:
```bash
uvicorn main:app --reload --port 8000
```
La aplicación cliente cargará completamente en tu navegador ingresando a `http://127.0.0.1:8000/`.

---

## Despliegue en Render

El proyecto está diseñado para desplegarse fácilmente en **Render.com**. 
1. Realiza un push de este repositorio a tu cuenta de GitHub.
2. Inicia sesión en Render e importa este repositorio usando un Web Service con un Blueprint.
3. Render detectará automáticamente el archivo `render.yaml`.
4. Solo necesitas agregar manualmente las variables de entorno relativas a los secretos en Render Dashboard (`SUPABASE_URL`, `SUPABASE_KEY`).

---

## Guía Práctica de Uso del Sistema

* **Dashboard de Control:** Al ingresar, verás tarjetas de métricas que resumen el estado actual del inventario (Total de productos, artículos vencidos y próximos a vencer) junto a una tabla con las alertas críticas ordenadas por urgencia.
* **Registro de Categorías:** Ve a la sección Categorías en el menú lateral para dar de alta áreas de inventario (ej. "Lácteos", "Embutidos"). El sistema evitará nombres duplicados o vacíos.
* **Catálogo de Productos:** En la sección Productos, registra los artículos vinculándolos a las categorías creadas previamente.
* **Ingreso de Stock e Inteligencia de Lotes:** Desde la pestaña Inventario Global, haz clic en "Ingresar Stock / Nuevo Lote". Selecciona el producto, define la cantidad y asigna la fecha de vencimiento:
  * *Si la fecha coincide con un lote existente:* El sistema sumará de manera automática las unidades al lote correspondiente.
  * *Si la fecha es nueva:* Creará un lote independiente para garantizar el flujo de salida FIFO.
* **Buscador Instantáneo:** Utiliza la barra de búsqueda en el Inventario Global para filtrar en tiempo real por el nombre del producto o de la categoría.
* **Exportación PDF:** Presiona el botón rojo "Exportar Inventario PDF" en el Dashboard para descargar un informe de diseño editorial con el estado en caliente del inventario actual.

---

## 🚨 Resolución de Problemas y Errores Comunes

### 1. Error: No carga la interfaz
* **Por qué ocurre:** Estás intentando abrir el archivo `index.html` haciendo doble click directamente.
* **Solución:** Debes levantar el servidor FastAPI desde uvicorn ingresando a `http://127.0.0.1:8000`. 

### 2. Error: TypeError: Failed to fetch al intentar guardar datos
* **Por qué ocurre:** El servidor backend de FastAPI está apagado o se interrumpió su ejecución.
* **Solución:** Ve a tu terminal y comprueba que `uvicorn` esté corriendo de forma activa.

### 3. Error: HTTPException 400: No se puede eliminar una categoría con productos activos
* **Por qué ocurre:** El sistema cuenta con mecanismos de integridad referencial preventivos.
* **Solución:** Primero debes dirigirte a la sección de Productos, eliminar los artículos correspondientes a esa categoría y, posteriormente, proceder a borrar la categoría deseada.

### 4. Error: Invalid API Key o fallos de autenticación con la base de datos
* **Por qué ocurre:** Las variables de entorno dentro del archivo `.env` del backend están mal escritas.
* **Solución:** Compara tus claves del dashboard de Supabase (Settings -> API) con tu archivo `.env`. Reinicia el servidor `uvicorn` tras realizar cualquier cambio.

### 5. Error: ModuleNotFoundError: No module named 'reportlab'
* **Por qué ocurre:** Estás ejecutando el comando de arranque fuera del entorno virtual de Python.
* **Solución:** Asegúrate de activar el entorno virtual (`.venv`) en tu terminal antes de ejecutar el comando `uvicorn`. Su indicador `(.venv)` debe ser visible al inicio de tu comando.