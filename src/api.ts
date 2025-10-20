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

// ===================== INVENTARIO JERÁRQUICO =====================
export type UnidadInventario = {
  producto_id: number;
  imei_1: string;
  imei_2?: string;
  costo: number;
  fecha_ingreso: string;
  proveedor?: string;
  estado: string;
};

export type ModeloInventario = {
  modelo_id: number;
  modelo: string;
  stock: number;
  unidades: UnidadInventario[];
};

export type MarcaInventario = {
  marca_id: number;
  marca: string;
  stock_total: number;
  modelos: ModeloInventario[];
};

export async function listarInventarioJerarquico(q?: string): Promise<MarcaInventario[]> {
  let url = `${BASE}/api/inventario`;
  if (q) url += `?q=${encodeURIComponent(q)}`;
  return jget<MarcaInventario[]>(url);
}

// ===================== CUENTAS POR COBRAR =====================
export type CuentaPorCobrarAPI = {
  id: number;
  venta_id: number;
  cliente_id: number;
  cliente_name?: string;
  cliente_email?: string;
  cliente_phone?: string;
  monto: number;
  fecha_registro: string;
  fecha_vencimiento?: string;
  fecha_cobro?: string;
  cobrado: boolean;
  descripcion?: string;
  fecha_venta?: string;
  created_at: string;
};

export type VentaDetalladaAPI = {
  id: number;
  cliente_id: number;
  cliente_name?: string;
  cliente_dni?: string;
  date_order: string;
  amount_total: number;
  total_real: number;
  state: string;
  productos_count: number;
  pagado: boolean;
  fecha_pago?: string | null;
  anulado: boolean;              // 👈 AGREGAR
  created_at: string;
};

export type VentaDetalleItemAPI = {
  id: number;
  venta_id: number;
  producto_detallado_id: number;
  precio_venta: number;
  costo: number;
  margen: number;
  marca: string;
  modelo: string;
  imei_1: string;
  imei_2?: string;
  proveedor?: string;
};

export async function listarVentasDetalladas(filtros?: { 
  desde?: string; 
  hasta?: string;
  cliente_id?: number;
  incluir_anuladas?: boolean;
}): Promise<VentaDetalladaAPI[]> {
  let url = `${BASE}/api/ventas`;
  const params = new URLSearchParams();
  
  if (filtros?.desde) params.append('desde', filtros.desde);
  if (filtros?.hasta) params.append('hasta', filtros.hasta);
  if (filtros?.cliente_id) params.append('cliente_id', filtros.cliente_id.toString());
  if (filtros?.incluir_anuladas) params.append('incluir_anuladas', 'true');
  
  if (params.toString()) url += `?${params.toString()}`;
  
  return jget<VentaDetalladaAPI[]>(url);
}


export async function obtenerDetalleVenta(ventaId: number): Promise<VentaDetalleItemAPI[]> {
  return jget<VentaDetalleItemAPI[]>(`${BASE}/api/ventas/${ventaId}/detalle`);
}

export async function crearVentaDetallada(data: {
  cliente_id: number;
  date_order: string;
  productos: Array<{
    producto_detallado_id: number;
    precio_venta: number;
  }>;
  fecha_vencimiento?: string;
}): Promise<{ id: number; message: string; total: number }> {
  return jpost(`${BASE}/api/ventas`, data);
}

export async function anularVenta(ventaId: number): Promise<{ message: string }> {
  const r = await fetch(`${BASE}/api/ventas/${ventaId}`, {
    method: "DELETE",
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
  return r.json();
}

// ===================== REVERSIONES PARA VENTAS =====================

export async function desmarcarVentaPagada(ventaId: number): Promise<{ message: string }> {
  return jput(`${BASE}/api/ventas/${ventaId}/desmarcar-pago`, {});
}

export async function recuperarVentaAnulada(ventaId: number): Promise<{ message: string }> {
  return jput(`${BASE}/api/ventas/${ventaId}/recuperar`, {});
}

// ===================== REVERSIONES PARA EGRESOS =====================

export async function desmarcarEgresoPagado(egresoId: number): Promise<{ message: string }> {
  return jput(`${BASE}/api/egresos/${egresoId}/desmarcar-pago`, {});
}

export async function recuperarEgresoEliminado(egresoId: number): Promise<{ message: string }> {
  return jput(`${BASE}/api/egresos/${egresoId}/recuperar`, {});
}

// 👇 NUEVA FUNCIÓN: Marcar venta como pagada
export async function marcarVentaComoPagada(ventaId: number): Promise<{ message: string; fecha_pago: string }> {
  return jput(`${BASE}/api/ventas/${ventaId}/pagar`, {});
}


export async function listarCuentasPorCobrar(pendientes?: boolean): Promise<CuentaPorCobrarAPI[]> {
  let url = `${BASE}/api/cuentas-por-cobrar`;
  if (pendientes) url += '?pendientes=true';
  return jget<CuentaPorCobrarAPI[]>(url);
}

export async function marcarComoCobrado(cuentaId: number): Promise<{ message: string; fecha_cobro: string }> {
  return jput(`${BASE}/api/cuentas-por-cobrar/${cuentaId}/cobrar`, {});
}

// ===================== AGREGAR AL FINAL DE api.ts =====================

// ===================== COMPARATIVO FINANCIERO =====================
export type PeriodoComparativo = {
  periodo: string;
  ingresos: number;
  cantidad_ventas: number;
  egresos: number;
  cantidad_egresos: number;
  utilidad: number;
};

export type ComparativoFinanciero = {
  agrupacion: 'dia' | 'mes' | 'año';
  desde: string;
  hasta: string;
  periodos: PeriodoComparativo[];
  totales: {
    ingresos_totales: number;
    egresos_totales: number;
    utilidad_total: number;
    total_ventas: number;
    total_egresos: number;
  };
  mejorPeriodo: PeriodoComparativo | null;
  peorPeriodo: PeriodoComparativo | null;
};

export async function obtenerComparativoFinanciero(
  desde: string,
  hasta: string,
  agrupacion: 'dia' | 'mes' | 'año' = 'mes'
): Promise<ComparativoFinanciero> {
  const url = `${BASE}/api/comparativo-financiero?desde=${desde}&hasta=${hasta}&agrupacion=${agrupacion}`;
  return jget<ComparativoFinanciero>(url);
}

// ===================== AGREGAR AL FINAL DE TU api.ts =====================

// ===================== COMPARATIVO DE VENTAS =====================
export type ResultadoVentasPeriodo = {
  total_ventas: number;
  cantidad_ventas: number;
  ticket_promedio: number;
};

export type ComparativoVentas = {
  periodo1: {
    label: string;
    datos: ResultadoVentasPeriodo;
  };
  periodo2: {
    label: string;
    datos: ResultadoVentasPeriodo;
  };
  diferencia: {
    total_ventas: number;
    cantidad_ventas: number;
    ticket_promedio: number;
  };
};

export async function compararVentas(
  fecha1_desde: string,
  fecha1_hasta: string,
  fecha2_desde: string,
  fecha2_hasta: string
): Promise<ComparativoVentas> {
  const url = `${BASE}/api/comparar-ventas?fecha1_desde=${fecha1_desde}&fecha1_hasta=${fecha1_hasta}&fecha2_desde=${fecha2_desde}&fecha2_hasta=${fecha2_hasta}`;
  return jget<ComparativoVentas>(url);
}



/* ========== PING ========== */
export async function ping(): Promise<{ ok: boolean }> {
  return jget(`${BASE}/api/ping`);
}