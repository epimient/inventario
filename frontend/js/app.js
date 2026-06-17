import { ApiService } from './services/api.js';

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializa el comportamiento de los clics del menú
    initRouter(); 
    
    // 2. Control de la vista inicial:
    // Si la URL no tiene una sección específica asignada (ej: index.html sin #),
    // forzamos de manera segura que la primera pantalla cargada sea el dashboard
    if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#productos') {
        loadDashboardView(); 
    }
});

function initRouter() {
    // Escucha los clics de navegación en el Sidebar base
    document.getElementById("menu-dashboard").addEventListener("click", loadDashboardView);
    document.getElementById("menu-categorias").addEventListener("click", loadCategoriasView);
    document.getElementById("menu-productos").addEventListener("click", loadProductosView);
    document.getElementById("menu-inventario").addEventListener("click", loadInventarioView);
}

function setViewActive(menuId, title) {
    document.querySelectorAll("#sidebar-wrapper .list-group-item").forEach(el => el.classList.remove("active"));
    const activeMenu = document.getElementById(menuId);
    if (activeMenu) activeMenu.classList.add("active");
    
    const titleEl = document.getElementById("section-title");
    if (titleEl) titleEl.innerText = title;
}

// --- VISTA DASHBOARD & ALERTAS ---
async function loadDashboardView() {
    setViewActive("menu-dashboard", "Dashboard de Control");
    const target = document.getElementById("main-content-target");
    
    try {
        const stats = await ApiService.getDashboard();
        const alertas = await ApiService.getAlertas();

        target.innerHTML = `
            <div class="row my-4 gap-3 justify-content-center">
                <div class="col-md-3 bg-white p-3 shadow-sm card-counter status-green rounded">
                    <h5>Total Productos</h5>
                    <h3>${stats.total_productos}</h3>
                </div>
                <div class="col-md-3 bg-white p-3 shadow-sm card-counter status-yellow rounded">
                    <h5>Próximos a Vencer</h5>
                    <h3>${stats.productos_proximos_vencer}</h3>
                </div>
                <div class="col-md-3 bg-white p-3 shadow-sm card-counter status-red rounded">
                    <h5>Productos Vencidos</h5>
                    <h3>${stats.productos_vencidos}</h3>
                </div>
            </div>
            
            <div class="d-flex justify-content-between align-items-center my-4">
                <h4>Alertas Críticas de Caducidad</h4>
                <a href="${ApiService.getReportePdfUrl()}" target="_blank" class="btn btn-danger">Exportar Inventario PDF</a>
            </div>

            <div class="table-responsive">
                <table class="table bg-white rounded shadow-sm align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Cantidad</th>
                            <th>Vencimiento</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${alertas.length === 0 ? '<tr><td colspan="5" class="text-center text-muted py-3">No hay alertas críticas en este momento.</td></tr>' : ''}
                        ${alertas.map(a => `
                            <tr>
                                <td><strong>${a.productos?.nombre || 'N/A'}</strong></td>
                                <td>${a.productos?.categorias?.nombre || 'N/A'}</td>
                                <td>${a.cantidad}</td>
                                <td><span class="badge bg-dark">${a.fecha_vencimiento}</span></td>
                                <td><span class="badge ${a.estado_visual === 'Rojo' ? 'bg-danger' : 'bg-warning text-dark'}">${a.alerta_mensaje}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        target.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
}

// --- VISTA INVENTARIO GLOBAL (CON FILTROS E INYECCIÓN DE STOCK) ---
async function loadInventarioView() {
    setViewActive("menu-inventario", "Inventario General de Lotes");
    const target = document.getElementById("main-content-target");

    try {
        const inventario = await ApiService.getInventario();
        const productos = await ApiService.getProductos();

        target.innerHTML = `
            <div class="row my-3 align-items-center">
                <div class="col-md-4">
                    <input type="text" id="search-bar" class="form-control" placeholder="Buscar por Nombre o Categoría...">
                </div>
                <div class="col-md-8 text-end">
                    <button class="btn btn-primary" id="btn-open-stock-modal">Ingresar Stock / Nuevo Lote</button>
                </div>
            </div>
            <div id="table-container" class="table-responsive"></div>
        `;

        const renderTable = (items) => {
            const container = document.getElementById("table-container");
            container.innerHTML = `
                <table class="table bg-white table-hover rounded shadow-sm align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th>ID Lote</th>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Stock Disponible</th>
                            <th>Fecha Vencimiento</th>
                            <th>Estado Alerta</th>
                            <th class="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.length === 0 ? '<tr><td colspan="7" class="text-center text-muted py-3">No se encontraron lotes registrados.</td></tr>' : ''}
                        ${items.map(i => `
                            <tr>
                                <td>#${i.id}</td>
                                <td><strong>${i.productos?.nombre || 'N/A'}</strong></td>
                                <td>${i.productos?.categorias?.nombre || 'N/A'}</td>
                                <td>${i.cantidad}</td>
                                <td><span class="badge bg-light text-dark border">${i.fecha_vencimiento}</span></td>
                                <td>
                                    <span class="badge ${i.estado_visual === 'Rojo' ? 'bg-danger' : i.estado_visual === 'Amarillo' ? 'bg-warning text-dark' : 'bg-success'}">
                                        ${i.alerta_mensaje || 'Estable'}
                                    </span>
                                </td>
                                <td class="text-center">
                                    <button class="btn btn-sm btn-outline-danger btn-delete-lote" data-id="${i.id}">Eliminar Lote</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            // Vincular eventos de eliminación
            document.querySelectorAll(".btn-delete-lote").forEach(btn => {
                btn.addEventListener("click", async () => {
                    if (confirm("¿Seguro de remover este lote específico de la base de datos?")) {
                        try {
                            await ApiService.deleteLote(btn.dataset.id);
                            loadInventarioView();
                        } catch (e) {
                            alert(e.message);
                        }
                    }
                });
            });
        };

        renderTable(inventario);

        // Motor de Búsqueda Instantánea
        document.getElementById("search-bar").addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = inventario.filter(i => 
                (i.productos?.nombre || '').toLowerCase().includes(query) || 
                (i.productos?.categorias?.nombre || '').toLowerCase().includes(query)
            );
            renderTable(filtered);
        });

        // Configuración del Modal de Agregar Stock
        document.getElementById("btn-open-stock-modal").onclick = () => {
            const modalEl = document.getElementById("actionModal");
            const targetContent = document.getElementById("modal-content-target");
            
            targetContent.innerHTML = `
                <div class="modal-header">
                    <h5 class="modal-title">Agregar Stock a Lote</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="stock-form">
                        <div class="mb-3">
                            <label class="form-label">Seleccione Producto</label>
                            <select class="form-select" id="stock-producto-id" required>
                                <option value="" disabled selected>Seleccione...</option>
                                ${productos.length === 0 
                                    ? '<option value="" disabled>⚠️ Ve a "Productos" y registra uno primero</option>' 
                                    : productos.map(p => `<option value="${p.id}">${p.nombre} (${p.categorias?.nombre || 'Sin Categoria'})</option>`).join('')}
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Cantidad Unidades</label>
                            <input type="number" class="form-control" id="stock-cantidad" min="1" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Fecha de Vencimiento</label>
                            <input type="date" class="form-control" id="stock-date" required>
                        </div>
                        <button type="submit" class="btn btn-success w-100">Guardar Lote / Actualizar Stock</button>
                    </form>
                </div>
            `;
            
            const bModal = new bootstrap.Modal(modalEl);
            bModal.show();

            document.getElementById("stock-form").onsubmit = async (e) => {
                e.preventDefault();
                try {
                    const data = {
                        producto_id: parseInt(document.getElementById("stock-producto-id").value),
                        cantidad: parseInt(document.getElementById("stock-cantidad").value),
                        fecha_vencimiento: document.getElementById("stock-date").value
                    };
                    await ApiService.agregarStock(data);
                    bModal.hide();
                    loadInventarioView();
                } catch (error) {
                    alert(error.message);
                }
            };
        };

    } catch (err) {
        target.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
}

// --- VISTAS AUXILIARES CRUD (CATEGORIAS) ---
async function loadCategoriasView() {
    setViewActive("menu-categorias", "Gestión de Categorías");
    const target = document.getElementById("main-content-target");
    try {
        const cats = await ApiService.getCategorias();
        target.innerHTML = `
            <div class="row my-3 g-4">
                <div class="col-md-4">
                    <div class="card p-3 shadow-sm bg-white border-0">
                        <h5 class="card-title mb-3">Nueva Categoría</h5>
                        <form id="cat-form">
                            <div class="mb-2">
                                <label class="form-label small fw-bold">Nombre</label>
                                <input type="text" id="cat-name" class="form-control" placeholder="Ej: Lácteos" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Descripción</label>
                                <textarea id="cat-desc" class="form-control" rows="3" placeholder="Opcional..."></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Crear Categoría</button>
                        </form>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="table-responsive">
                        <table class="table bg-white rounded shadow-sm align-middle">
                            <thead class="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th class="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${cats.length === 0 ? '<tr><td colspan="4" class="text-center text-muted py-3">No hay categorías registradas.</td></tr>' : ''}
                                ${cats.map(c => `
                                    <tr>
                                        <td>#${c.id}</td>
                                        <td><strong>${c.nombre}</strong></td>
                                        <td class="text-muted">${c.descripcion || 'Sin descripción'}</td>
                                        <td class="text-center">
                                            <button class="btn btn-danger btn-sm btn-del-cat" data-id="${c.id}">Eliminar</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById("cat-form").onsubmit = async (e) => {
            e.preventDefault();
            try {
                await ApiService.createCategoria({ 
                    nombre: document.getElementById("cat-name").value, 
                    descripcion: document.getElementById("cat-desc").value 
                });
                loadCategoriasView();
            } catch (err) {
                alert(err.message);
            }
        };

        document.querySelectorAll(".btn-del-cat").forEach(b => {
            b.addEventListener("click", async () => {
                try {
                    if (confirm("¿Desea eliminar la categoría?")) {
                        await ApiService.deleteCategoria(b.dataset.id);
                        loadCategoriasView();
                    }
                } catch (e) { 
                    alert(e.message); 
                }
            });
        });
    } catch (e) { target.innerHTML = `<div class="alert alert-danger">${e.message}</div>`; }
}

// --- VISTAS AUXILIARES CRUD (PRODUCTOS ACTUALIZADO) ---
async function loadProductosView() {
    setViewActive("menu-productos", "Catálogo de Productos");
    const target = document.getElementById("main-content-target");
    try {
        const prods = await ApiService.getProductos();
        const cats = await ApiService.getCategorias();
        
        target.innerHTML = `
            <div class="row my-3 g-4">
                <div class="col-lg-4">
                    <div class="card p-3 shadow-sm bg-white border-0">
                        <h5 class="card-title mb-3">Registrar Producto</h5>
                        <form id="prod-form">
                            <div class="mb-2">
                                <label class="form-label small fw-bold">Código del Producto</label>
                                <input type="text" id="prod-codigo" class="form-control" placeholder="Ej: LEC001" required>
                            </div>
                            <div class="mb-2">
                                <label class="form-label small fw-bold">Nombre del Producto</label>
                                <input type="text" id="prod-name" class="form-control" placeholder="Ej: Leche Entera" required>
                            </div>
                            <div class="mb-2">
                                <label class="form-label small fw-bold">Categoría</label>
                                <select id="prod-cat" class="form-select" required>
                                    <option value="" disabled selected>Seleccione...</option>
                                    ${cats.length === 0 
                                        ? '<option value="" disabled>⚠️ Ve a "Categorías" y crea una primero</option>' 
                                        : cats.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}
                                </select>
                            </div>
                            <div class="mb-2">
                                <label class="form-label small fw-bold">Unidad de Medida</label>
                                <select id="prod-unidad" class="form-select" required>
                                    <option value="" disabled selected>Seleccione...</option>
                                    <option value="Unidad">Unidad</option>
                                    <option value="Kg">Kg</option>
                                    <option value="Gramo">Gramo</option>
                                    <option value="Litro">Litro</option>
                                    <option value="Mililitro">Mililitro</option>
                                    <option value="Caja">Caja</option>
                                    <option value="Paquete">Paquete</option>
                                    <option value="Botella">Botella</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Descripción Corta</label>
                                <textarea id="prod-desc" class="form-control" rows="2" placeholder="Opcional..."></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Guardar Catálogo</button>
                        </form>
                    </div>
                </div>
                <div class="col-lg-8">
                    <div class="table-responsive">
                        <table class="table bg-white rounded shadow-sm align-middle">
                            <thead class="table-dark">
                                <tr>
                                    <th>Código</th>
                                    <th>Nombre</th>
                                    <th>Categoría</th>
                                    <th>Unidad</th>
                                    <th class="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${prods.length === 0 ? '<tr><td colspan="5" class="text-center text-muted py-3">No hay productos en el catálogo.</td></tr>' : ''}
                                ${prods.map(p => `
                                    <tr>
                                        <td><code>${p.codigo || 'N/A'}</code></td>
                                        <td><strong>${p.nombre}</strong></td>
                                        <td><span class="badge bg-secondary">${p.categorias?.nombre || 'Sin categoría'}</span></td>
                                        <td><small class="text-muted">${p.unidad || 'Unidad'}</small></td>
                                        <td class="text-center">
                                            <button class="btn btn-danger btn-sm btn-del-prod" data-id="${p.id}">Eliminar</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById("prod-form").onsubmit = async (e) => {
            e.preventDefault();
            try {
                await ApiService.createProducto({
                    codigo: document.getElementById("prod-codigo").value,
                    nombre: document.getElementById("prod-name").value,
                    descripcion: document.getElementById("prod-desc").value,
                    categoria_id: parseInt(document.getElementById("prod-cat").value),
                    unidad: document.getElementById("prod-unidad").value
                });
                loadProductosView();
            } catch (err) {
                alert(err.message);
            }
        };

        document.querySelectorAll(".btn-del-prod").forEach(b => {
            b.addEventListener("click", async () => {
                try {
                    if (confirm("¿Eliminar este producto? Los lotes asociados desaparecerán.")) {
                        await ApiService.deleteProducto(b.dataset.id);
                        loadProductosView();
                    }
                } catch (err) {
                    alert(err.message);
                }
            });
        });
    } catch (e) { target.innerHTML = `<div class="alert alert-danger">${e.message}</div>`; }
}