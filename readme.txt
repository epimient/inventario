#   Control Inteligente de Caducidad

es una aplicación web empresarial de tipo SPA (Single Page Application) diseñada para gestionar inventarios de productos organizados por múltiples lotes y categorías, con un enfoque crítico en el monitoreo preventivo de fechas de vencimiento. 

El sistema cuenta con alertas visuales por colores (Verde, Amarillo, Rojo) basadas en la urgencia de caducidad y permite la exportación automática de reportes analíticos consolidados en formato PDF.

---

##  Tecnologías Utilizadas y Dependencias

### Backend (Servidor API REST)
El backend está construido en **Python** bajo una arquitectura limpia en capas (MVC/Repository). Requiere las siguientes librerías principales:

* **FastAPI (v0.111.0):** Framework de alto rendimiento para la construcción de los endpoints.
* **Uvicorn (v0.30.1):** Servidor web de producción compatible con el estándar ASGI.
* **Pydantic (v2.7.4):** Motor de validación de datos para los esquemas de entrada y salida.
* **Pydantic-settings (v2.3.3):** Gestión segura de variables de entorno mediante archivos `.env`.
* **Supabase (v2.5.1):** SDK oficial para conectar y operar la base de datos PostgreSQL.
* **ReportLab (v4.2.2):** Motor gráfico para el renderizado automatizado de documentos PDF.
* **Python-multipart (v0.0.9):** Soporte interno de procesamiento para la carga de datos de formularios HTTP.

### Frontend (Interfaz de Usuario)
La interfaz es desacoplada y nativa, por lo que **no requiere la instalación de gestores de paquetes como npm o Node.js**:
* **HTML5, CSS3 y JavaScript ES6+** (Estructura, estilos y lógica modular SPA).
* **Bootstrap 5 (Vía CDN):** Framework de diseño adaptivo y componentes UI responsivos.
* **Fetch API:** Mecanismo nativo del navegador para el consumo síncrono/asíncrono de la API REST.

---

##  Estructura Esencial del Proyecto

```text
smart-inventory/
├── backend/                  # Código fuente del servidor Python
│   ├── app/                  # Capas lógicas (Models, Schemas, Repositories, Services, Controllers, Routes)
│   ├── main.py               # Punto de entrada de la aplicación FastAPI
│   ├── requirements.txt      # Archivo centralizador de dependencias
│   └── .env                  # Credenciales secretas (¡No subir a repositorios públicos!)
└── frontend/                 # Interfaz visual del cliente web
    ├── index.html            # Archivo único de la SPA
    ├── css/                  # Estilos visuales complementarios
    └── js/                   # Controladores JavaScript y capa de servicios API




    Guía de Instalación y Despliegue Paso a Paso



1. Preparación de la Base de Datos (Supabase)
Inicia sesión en tu consola de Supabase y crea un nuevo proyecto.
("el nombre del proyecto es "SistemaInv" la contraseña es e3!M%u@cyubuB4Z ")
Dirígete a la sección SQL Editor y ejecuta el script DDL provisto en el diseño de la base de datos (este script creará de forma automática las tablas categorias, productos, lotes y sus respectivos índices).

2. Configuración del Servidor Backend
Abre tu terminal y navega hasta el directorio del backend:

Bash
cd backend
Crea un entorno virtual para aislar las librerías (recomendado):

Bash
python -m venv .venv
Activa el entorno virtual:

Windows: venv\Scripts\activate

Linux/macOS: source venv/bin/activate

Instala todas las dependencias requeridas en bloque:

Bash
pip install -r requirements.txt

Configura tus credenciales. Crea un archivo llamado .env dentro de la carpeta backend/ con la siguiente estructura:

Fragmento de código
SUPABASE_URL=[https://tu-id-de-proyecto.supabase.co](https://tu-id-de-proyecto.supabase.co)
SUPABASE_KEY=tu-clave-anon-publica-de-supabase
HOST=127.0.0.1
PORT=8000

Enciende el servidor de desarrollo:
pip install -r requirements.txt
Bash
python -m uvicorn main:app --reload --port 8000
3. Configuración del Cliente Frontend
Debido a que el frontend está modularizado mediante JavaScript moderno (type="module"), los navegadores bloquean las solicitudes si abres el archivo index.html haciendo doble clic directamente desde el explorador de archivos (debido a políticas estrictas de seguridad CORS). Debe ser servido mediante un servidor HTTP local.

Abre una nueva terminal en la raíz de la carpeta frontend/.

Levanta un servidor instantáneo utilizando Python:

Bash
python -m http.server 5500
Abre tu navegador web favorito e ingresa a la siguiente dirección URL:
http://127.0.0.1:5500




  Guía Práctica de Uso del Sistema

Dashboard de Control: Al ingresar, verás tarjetas de métricas que resumen el estado actual del inventario (Total de productos, artículos vencidos y próximos a vencer) junto a una tabla con las alertas críticas ordenadas por urgencia.

Registro de Categorías: Ve a la sección Categorías en el menú lateral para dar de alta áreas de inventario (ej. "Lácteos", "Embutidos"). El sistema evitará nombres duplicados o vacíos.

Catálogo de Productos: En la sección Productos, registra los artículos vinculándolos a las categorías creadas previamente.

Ingreso de Stock e Inteligencia de Lotes: Desde la pestaña Inventario Global, haz clic en "Ingresar Stock / Nuevo Lote". Selecciona el producto, define la cantidad y asigna la fecha de vencimiento:

Si la fecha coincide con un lote existente: El sistema sumará de manera automática las unidades al lote correspondiente.

Si la fecha es nueva: Creará un lote independiente para garantizar el flujo de salida FIFO.

Buscador Instantáneo: Utiliza la barra de búsqueda en el Inventario Global para filtrar en tiempo real por el nombre del producto o de la categoría.

Exportación PDF: Presiona el botón rojo "Exportar Inventario PDF" en el Dashboard para descargar un informe de diseño editorial con el estado en caliente del inventario actual.



🚨 Resolución de Problemas y Errores Comunes


1. Error: Muted by CORS Policy o la interfaz no carga datos
Por qué ocurre: Ocurre si abriste el archivo index.html directamente haciendo doble clic desde tus carpetas, o si el backend está corriendo en un puerto diferente al configurado.

Solución: Asegúrate de correr el frontend con python -m http.server 5500 e ingresar desde http://127.0.0.1:5500. Verifica que en backend/main.py la configuración de CORSMiddleware tenga permitido recibir tráfico.

2. Error: TypeError: Failed to fetch al intentar guardar datos
Por qué ocurre: El servidor backend de FastAPI está apagado o se interrumpió su ejecución.

Solución: Ve a tu terminal de backend y comprueba que uvicorn esté corriendo de forma activa en el puerto 8000.

3. Error: HTTPException 400: No se puede eliminar una categoría con productos activos
Por qué ocurre: El sistema cuenta con mecanismos de integridad referencial preventivos. No permite borrar una categoría base si todavía existen productos anidados a ella.

Solución: Primero debes dirigirte a la sección de Productos, eliminar los artículos correspondientes a esa categoría y, posteriormente, proceder a borrar la categoría deseada.

4. Error: Invalid API Key o fallos de autenticación con la base de datos
Por qué ocurre: Las variables de entorno dentro del archivo .env del backend están mal escritas, tienen espacios adicionales o no corresponden a tu proyecto activo de Supabase.

Solución: Compara tus claves del dashboard de Supabase (Settings -> API) con tu archivo .env. Reinicia el servidor uvicorn tras realizar cualquier cambio en dicho archivo para que tome los nuevos valores.

5. Error: ModuleNotFoundError: No module named 'reportlab' (o cualquier otra librería)
Por qué ocurre: Estás ejecutando el comando de arranque fuera del entorno virtual de Python donde se instalaron las dependencias.

Solución: Asegúrate de activar el entorno virtual (venv) en tu terminal antes de ejecutar el comando uvicorn main:app --reload. Su indicador (venv) debe ser visible al inicio de la línea de comandos.