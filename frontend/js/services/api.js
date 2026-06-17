const BASE_URL = "http://127.0.0.1:8000/api";

export const ApiService = {
    // --- DASHBOARD & ALERTAS ---
    async getDashboard() {
        const res = await fetch(`${BASE_URL}/dashboard`);
        if (!res.ok) throw new Error("No se pudo cargar el dashboard");
        return await res.json();
    },

    async getAlertas() {
        const res = await fetch(`${BASE_URL}/alertas`);
        if (!res.ok) throw new Error("No se pudieron cargar las alertas");
        return await res.json();
    },

    getReportePdfUrl() {
        return `${BASE_URL}/reporte/pdf`; // Ajusta si la ruta de tu PDF en FastAPI es diferente
    },

    // --- CATEGORÍAS ---
    async getCategorias() {
        const res = await fetch(`${BASE_URL}/categorias`);
        if (!res.ok) throw new Error("Error al obtener categorías");
        return await res.json();
    },

    async createCategoria(data) {
        const res = await fetch(`${BASE_URL}/categorias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Error al crear la categoría");
        }
        return await res.json();
    },

    async deleteCategoria(id) {
        const res = await fetch(`${BASE_URL}/categorias/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("No se pudo eliminar la categoría");
        return true;
    },

    // --- PRODUCTOS ---
    async getProductos() {
        const res = await fetch(`${BASE_URL}/productos`);
        if (!res.ok) throw new Error("Error al obtener productos");
        return await res.json();
    },

    async createProducto(data) {
        const res = await fetch(`${BASE_URL}/productos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Error al registrar el producto");
        }
        return await res.json();
    },

    async deleteProducto(id) {
        const res = await fetch(`${BASE_URL}/productos/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("No se pudo eliminar el producto. Verifique que no tenga lotes asociados.");
        return true;
    },

    // --- INVENTARIO / LOTES ---
    async getInventario() {
        const res = await fetch(`${BASE_URL}/lotes`);
        if (!res.ok) throw new Error("Error al obtener lotes de inventario");
        return await res.json();
    },

    async agregarStock(data) {
        const res = await fetch(`${BASE_URL}/lotes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Error al registrar el lote");
        }
        return await res.json();
    },

    async deleteLote(id) {
        const res = await fetch(`${BASE_URL}/lotes/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("No se pudo eliminar el lote");
        return true;
    }
};