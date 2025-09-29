// src/api.ts
const BASE = import.meta.env.VITE_API_URL as string;

async function jget<T = any>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
  return r.json();
}
async function jpost<T = any>(url: string, body: any): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
  return r.json();
}

/* ========== CLIENTES ========== */
export async function listarClientes() {
  return jget(`${BASE}/api/clientes`);
}
export async function crearCliente(data: { name: string; email?: string; phone?: string }) {
  return jpost(`${BASE}/api/clientes`, data); // { id }
}

/* ========== VENTAS ========== */
export async function resumenVentas(desde: string, hasta: string) {
  return jget(`${BASE}/api/ventas/resumen?desde=${desde}&hasta=${hasta}`); // { total, cantidad, ... }
}
export async function ventasPorMes(desdeYM: string, hastaYM: string) {
  return jget(`${BASE}/api/ventas/meses?desde=${desdeYM}&hasta=${hastaYM}`) as Promise<{
    periodos: { mes: string; total: number; cantidad: number }[];
  }>;
}

/* ========== PROVEEDORES ========== */
export async function listarProveedores(q?: string) {
  const url = q ? `${BASE}/api/proveedores?q=${encodeURIComponent(q)}` : `${BASE}/api/proveedores`;
  return jget(url);
}
export async function crearProveedor(data: { name: string; email?: string; phone?: string; vat?: string }) {
  return jpost(`${BASE}/api/proveedores`, data); // { id }
}

/* ========== PRODUCTOS ========== */
export async function listarProductos(q?: string) {
  const url = q ? `${BASE}/api/productos?q=${encodeURIComponent(q)}` : `${BASE}/api/productos`;
  return jget(url);
}
export async function crearProducto(data: {
  name: string;
  sku?: string;
  price?: number;
  barcode?: string;
  tracking?: "none" | "lot" | "serial";
}) {
  return jpost(`${BASE}/api/productos`, data); // { template_id, variant_id }
}
export async function crearSeries(variantId: number, serials: string[]) {
  return jpost(`${BASE}/api/productos/${variantId}/seriales`, { serials }); // { created: number[] }
}
export async function inventarioPorVariante(variantId: number) {
  return jget(`${BASE}/api/inventario?variant_id=${variantId}`); // { quants, totales: [...] }
}
