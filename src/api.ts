// src/api.ts
const BASE = import.meta.env.VITE_API_URL as string;

// Helper functions para las llamadas API
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

async function jput<T = any>(url: string, body: any): Promise<T> {
  const r = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
  return r.json();
}

/* ========== EMPLEADOS ========== */
export type EmpleadoAPI = {
  id: number;
  name: string;
  work_email?: string;
  work_phone?: string;
  job_name?: string;
  job_id?: number;
  fecha_ingreso?: string;
  salario?: number;
  identification_id?: string;
};

export async function listarEmpleados(q?: string): Promise<EmpleadoAPI[]> {
  const url = q ? `${BASE}/api/empleados?q=${encodeURIComponent(q)}` : `${BASE}/api/empleados`;
  return jget<EmpleadoAPI[]>(url);
}

export async function crearEmpleado(data: {
  name: string;
  work_email?: string;
  work_phone?: string;
  job_id?: string;
  identification_id?: string;
  fecha_ingreso?: string;
  salario?: string;
}): Promise<{ id: number; message: string }> {
  return jpost(`${BASE}/api/empleados`, data);
}

export async function actualizarEmpleado(id: number, data: any): Promise<{ message: string }> {
  return jput(`${BASE}/api/empleados/${id}`, data);
}

/* ========== PUESTOS ========== */
export type PuestoAPI = {
  id: number;
  name: string;
};

export async function listarPuestos(): Promise<PuestoAPI[]> {
  return jget<PuestoAPI[]>(`${BASE}/api/puestos`);
}

export async function crearPuesto(data: { name: string }): Promise<{ id: number }> {
  return jpost(`${BASE}/api/puestos`, data);
}

/* ========== CLIENTES ========== */
export type ClienteAPI = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  vat?: string;
  street?: string;
  city?: string;
};

export async function listarClientes(): Promise<ClienteAPI[]> {
  return jget<ClienteAPI[]>(`${BASE}/api/clientes`);
}

export async function crearCliente(data: {
  name: string;
  email?: string;
  phone?: string;
  vat?: string;
  street?: string;
  city?: string;
}): Promise<{ id: number }> {
  return jpost(`${BASE}/api/clientes`, data);
}

/* ========== PROVEEDORES ========== */
export type ProveedorAPI = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  vat?: string;
};

export async function listarProveedores(q?: string): Promise<ProveedorAPI[]> {
  const url = q ? `${BASE}/api/proveedores?q=${encodeURIComponent(q)}` : `${BASE}/api/proveedores`;
  return jget<ProveedorAPI[]>(url);
}

export async function crearProveedor(data: {
  name: string;
  email?: string;
  phone?: string;
  vat?: string;
}): Promise<{ id: number }> {
  return jpost(`${BASE}/api/proveedores`, data);
}

/* ========== PRODUCTOS ========== */
export type ProductoAPI = {
  id: number;
  name: string;
  sku?: string;
  price: number;
  cost: number;
  barcode?: string;
  type: string;
};

export async function listarProductos(q?: string): Promise<ProductoAPI[]> {
  const url = q ? `${BASE}/api/productos?q=${encodeURIComponent(q)}` : `${BASE}/api/productos`;
  return jget<ProductoAPI[]>(url);
}

export async function crearProducto(data: {
  name: string;
  sku?: string;
  price?: number;
  cost?: number;
  barcode?: string;
}): Promise<{ id: number }> {
  return jpost(`${BASE}/api/productos`, data);
}

/* ========== VENTAS ========== */
export type ResumenVentas = {
  total: number;
  cantidad: number;
  desde: string;
  hasta: string;
};

export async function resumenVentas(desde: string, hasta: string): Promise<ResumenVentas> {
  return jget(`${BASE}/api/ventas/resumen?desde=${desde}&hasta=${hasta}`);
}

export type PeriodoVenta = {
  mes: string;
  total: number;
  cantidad: number;
};

export async function ventasPorMes(desdeYM: string, hastaYM: string): Promise<{ periodos: PeriodoVenta[] }> {
  return jget(`${BASE}/api/ventas/meses?desde=${desdeYM}&hasta=${hastaYM}`);
}

/* ========== INVENTARIO ========== */
export type InventarioItem = {
  product_id: number;
  product_name?: string;
  location_name: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
};

export type InventarioResponse = {
  quants: InventarioItem[];
  totales: {
    [key: string]: {
      product_id: number;
      product_name?: string;
      quantity: number;
      reserved: number;
      available: number;
      by_location: Array<{
        location: string;
        quantity: number;
        reserved: number;
      }>;
    };
  };
};

export async function inventarioPorProducto(product_id?: number): Promise<InventarioResponse> {
  const url = product_id 
    ? `${BASE}/api/inventario?product_id=${product_id}`
    : `${BASE}/api/inventario`;
  return jget<InventarioResponse>(url);
}

// En api.ts - AGREGAR ESTA FUNCIÓN
export async function eliminarEmpleado(id: number): Promise<{ message: string }> {
  const r = await fetch(`${BASE}/api/empleados/${id}`, {
    method: "DELETE",
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
  return r.json();
}

// ===================== MARCAS =====================
export type MarcaAPI = {
  id: number;
  name: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
};

export async function listarMarcas(q?: string): Promise<MarcaAPI[]> {
  const url = q ? `${BASE}/api/marcas?q=${encodeURIComponent(q)}` : `${BASE}/api/marcas`;
  return jget<MarcaAPI[]>(url);
}

export async function crearMarca(data: {
  name: string;
  descripcion?: string;
}): Promise<{ id: number; message: string; marca: MarcaAPI }> {
  return jpost(`${BASE}/api/marcas`, data);
}

// ===================== MODELOS =====================
export type ModeloAPI = {
  id: number;
  name: string;
  marca_id: number;
  marca_name?: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
};

export async function listarModelos(q?: string, marca_id?: number): Promise<ModeloAPI[]> {
  let url = `${BASE}/api/modelos`;
  const params = new URLSearchParams();
  if (q) params.append('q', q);
  if (marca_id) params.append('marca_id', marca_id.toString());
  
  if (params.toString()) url += `?${params.toString()}`;
  
  return jget<ModeloAPI[]>(url);
}

export async function crearModelo(data: {
  name: string;
  marca_id: number;
  descripcion?: string;
}): Promise<{ id: number; message: string; modelo: ModeloAPI }> {
  return jpost(`${BASE}/api/modelos`, data);
}

// ===================== PEDIDOS PROVEEDOR =====================
export type PedidoProveedorAPI = {
  id: number;
  proveedor_id: number;
  numero_pedido: string;
  fecha_pedido: string;
  fecha_entrega?: string;
  estado: string;
  total: number;
  observaciones?: string;
  created_at: string;
  proveedor_name?: string;
  productos_count?: number; // 👈 AGREGAR ESTA LÍNEA
};

export async function listarPedidosProveedor(proveedor_id?: number): Promise<PedidoProveedorAPI[]> {
  let url = `${BASE}/api/pedidos-proveedor`;
  if (proveedor_id) {
    url += `?proveedor_id=${proveedor_id}`;
  }
  return jget<PedidoProveedorAPI[]>(url);
}

export async function crearPedidoProveedor(data: {
  proveedor_id: number;
  numero_pedido: string;
  fecha_pedido: string;
  fecha_entrega?: string;
  observaciones?: string;
}): Promise<{ id: number; message: string }> {
  return jpost(`${BASE}/api/pedidos-proveedor`, data);
}

// ===================== PRODUCTOS DETALLADOS =====================
export type ProductoDetalladoAPI = {
  id: number;
  pedido_id: number;
  modelo_id: number;
  imei_1: string;
  imei_2?: string;
  costo: number;
  fecha_ingreso: string;
  estado: string;
  created_at: string;
  modelo_name?: string;
  marca_name?: string;
};

export async function listarProductosDetallados(pedido_id: number): Promise<ProductoDetalladoAPI[]> {
  return jget<ProductoDetalladoAPI[]>(`${BASE}/api/productos-detallados?pedido_id=${pedido_id}`);
}

export async function crearProductoDetallado(data: {
  pedido_id: number;
  modelo_id: number;
  imei_1: string;
  imei_2?: string;
  costo: number;
  fecha_ingreso: string;
}): Promise<{ id: number; message: string }> {
  return jpost(`${BASE}/api/productos-detallados`, data);
}

// ===================== INVENTARIO AUTOMÁTICO ===================== (CORREGIDO: URL y filtros)
export type InventarioAutoAPI = {
  marca: string;
  modelo: string;
  stock: number;
  ultima_entrada: string;
  proveedores: string[];
};

export async function listarInventarioAuto(q?: string, marca?: string): Promise<InventarioAutoAPI[]> {
  let url = `${BASE}/api/inventario`;
  const params = new URLSearchParams();
  if (q) params.append('q', q);
  if (marca) params.append('marca', marca);
  if (params.toString()) url += `?${params.toString()}`;
  return jget<InventarioAutoAPI[]>(url);  // Ahora jget valida array
}



// ===================== ACTUALIZAR PEDIDO =====================
export async function actualizarPedidoProveedor(id: number, data: {
  total?: number;
  estado?: string;
  fecha_entrega?: string;
}): Promise<{ message: string }> {
  return jput(`${BASE}/api/pedidos-proveedor/${id}`, data);
}

/* ========== PING ========== */
export async function ping(): Promise<{ ok: boolean }> {
  return jget(`${BASE}/api/ping`);
}