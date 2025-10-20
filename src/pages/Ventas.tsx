// src/pages/Ventas.tsx
import { generarDocumentoPDF } from "../generadorPDF";
import { useEffect, useState } from "react";
import {
  listarClientes,
  listarInventarioJerarquico,
  listarVentasDetalladas,
  obtenerDetalleVenta,
  crearVentaDetallada,
  anularVenta,
  marcarVentaComoPagada,
  desmarcarVentaPagada,        // 👈 AGREGAR
  recuperarVentaAnulada         // 👈 AGREGAR
} from "../api";


import type {
  ClienteAPI,
  MarcaInventario,
  VentaDetalladaAPI,
  VentaDetalleItemAPI
} from "../api";

// ==================== HELPER ====================
const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `S/ ${(num || 0).toFixed(2)}`;
};

// ==================== HELPER DE FECHAS ====================
const obtenerPrimerDiaDelMes = (fecha: Date) => {
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1).toISOString().split('T')[0];
};

const obtenerUltimoDiaDelMes = (fecha: Date) => {
  return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).toISOString().split('T')[0];
};

const formatearMesAnio = (fecha: Date) => {
  return fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
};

const formatearFecha = (fecha: string | null | undefined) => {
  if (!fecha) return 'Sin fecha';
  
  try {
    // Si la fecha viene con hora (timestamp), la limpiamos
    const fechaLimpia = fecha.split('T')[0];
    const [year, month, day] = fechaLimpia.split('-');
    
    // Validar que tenemos los 3 componentes
    if (!year || !month || !day) return 'Fecha inválida';
    
    const meses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    
    const mesTexto = meses[parseInt(month) - 1];
    
    return `${parseInt(day)} ${mesTexto} ${year}`;
  } catch (e) {
    console.error('Error formateando fecha:', fecha, e);
    return 'Fecha inválida';
  }
};

// ==================== MODAL DETALLE VENTA ====================
const ModalDetalleVenta = ({ venta, onClose }: { venta: VentaDetalladaAPI; onClose: () => void }) => {
  const [detalle, setDetalle] = useState<VentaDetalleItemAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [observacion, setObservacion] = useState('Seminuevo - Libre de Fabrica');
  const [accesorios, setAccesorios] = useState('Cubo 20w, Cable Tipo C-C, mica y case');
  const [clienteRUC, setClienteRUC] = useState('');  // 👈 AGREGAR ESTA LÍNEA


  useEffect(() => {
    async function cargar() {
      try {
        const data = await obtenerDetalleVenta(venta.id);
        setDetalle(data);
      } catch (e) {
        console.error("Error cargando detalle:", e);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, [venta.id]);

  const totalMargen = detalle.reduce((sum, item) => sum + item.margen, 0);
  const generarDocumento = (tipo: 'boleta' | 'factura' | 'recibo') => {
    if (detalle.length === 0) {
      alert('No hay productos para generar el documento');
      return;
    }

    const totalConIGV = venta.total_real;
    const totalSinIGV = totalConIGV / 1.18;

    const productos = detalle.map(item => ({
      marca: item.marca,
      modelo: item.modelo,
      imei_1: item.imei_1,
      imei_2: item.imei_2
    }));

    generarDocumentoPDF(tipo, {
      numeroDocumento: venta.id,
      fecha: venta.date_order,
      clienteNombre: venta.cliente_name || 'Sin nombre',
      clienteDNI: venta.cliente_dni || '',
      clienteRUC: clienteRUC,  // 👈 AGREGAR ESTA LÍNEA
      productos: productos,
      totalSinIGV: totalSinIGV,
      totalConIGV: totalConIGV,
      observacion: observacion,
      accesorios: accesorios
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '20px',
        padding: '30px',
        width: '95%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <div>
            <h2 style={{ color: 'white', fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>
              Detalle de Venta #{venta.id}
            </h2>
            <p style={{ color: '#94a3b8', margin: '8px 0 0 0' }}>
              {venta.cliente_name} • {formatearFecha(venta.date_order)}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '10px',
              color: '#ef4444',
              width: '40px',
              height: '40px',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            Cargando detalle...
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '20px' }}>
              {detalle.map((item) => (
                <div key={item.id} style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: '600', marginBottom: '4px' }}>
                        {item.marca} {item.modelo}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        IMEI: {item.imei_1}
                      </div>
                      {item.proveedor && (
                        <div style={{ color: '#fbbf24', fontSize: '0.8rem', marginTop: '4px' }}>
                          📦 {item.proveedor}
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>Costo</div>
                      <div style={{ color: 'white', fontWeight: '600' }}>{formatCurrency(item.costo)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>Precio Venta</div>
                      <div style={{ color: 'white', fontWeight: '600' }}>{formatCurrency(item.precio_venta)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>Margen</div>
                      <div style={{
                        color: item.margen >= 0 ? '#86efac' : '#ef4444',
                        fontWeight: '700',
                        fontSize: '1.1rem'
                      }}>
                        {formatCurrency(item.margen)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '20px'
            }}>
              {/* 👇 NUEVA SECCIÓN: Campos editables para el PDF */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              marginBottom: '20px'
            }}>
              <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: '600', marginBottom: '15px' }}>
                📄 Generar Documento
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>
                    Observación
                  </label>
                  <input
                    type="text"
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    placeholder="Ej: Seminuevo - Libre de Fabrica"
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>
                    Accesorios
                  </label>
                  <input
                    type="text"
                    value={accesorios}
                    onChange={(e) => setAccesorios(e.target.value)}
                    placeholder="Ej: Cubo 20w, Cable Tipo C-C, mica y case"
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
                 {/* 👇 NUEVO CAMPO PARA RUC */}
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>
                    RUC del Cliente (solo para Factura)
                  </label>
                  <input
                    type="text"
                    value={clienteRUC}
                    onChange={(e) => setClienteRUC(e.target.value)}
                    placeholder="Ej: 20612077381"
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '10px' 
              }}>
                <button
                  onClick={() => generarDocumento('boleta')}
                  style={{
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  📄 Boleta
                </button>

                <button
                  onClick={() => generarDocumento('factura')}
                  style={{
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  🧾 Factura
                </button>

                <button
                  onClick={() => generarDocumento('recibo')}
                  style={{
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  🧾 Recibo
                </button>
              </div>
            </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Total Venta</div>
                <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>
                  {formatCurrency(venta.total_real)}
                </div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Margen Total</div>
                <div style={{
                  color: totalMargen >= 0 ? '#86efac' : '#ef4444',
                  fontSize: '1.5rem',
                  fontWeight: '700'
                }}>
                  {formatCurrency(totalMargen)}
                </div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Productos</div>
                <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>
                  {detalle.length}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ==================== MODAL NUEVA VENTA ====================
// ==================== MODAL NUEVA VENTA ====================
const ModalNuevaVenta = ({ onClose, onVentaCreada }: { onClose: () => void; onVentaCreada: () => void }) => {
  const [clientes, setClientes] = useState<ClienteAPI[]>([]);
  const [inventario, setInventario] = useState<MarcaInventario[]>([]);
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [fechaVenta, setFechaVenta] = useState(new Date().toISOString().split('T')[0]);
  
  // 👇 MODIFICADO: Ahora guardamos precio_sin_igv
  const [productosSeleccionados, setProductosSeleccionados] = useState<Array<{
    producto_detallado_id: number;
    marca: string;
    modelo: string;
    imei_1: string;
    precio_sin_igv: string;  // 👈 CAMBIO AQUÍ
    costo: number;
  }>>([]);
  
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [marcaExpandida, setMarcaExpandida] = useState<number | null>(null);
  const [modeloExpandido, setModeloExpandido] = useState<number | null>(null);

  useEffect(() => {
    async function cargar() {
      try {
        const [clientesData, inventarioData] = await Promise.all([
          listarClientes(),
          listarInventarioJerarquico()
        ]);
        setClientes(clientesData);
        setInventario(inventarioData);
      } catch (e) {
        console.error("Error cargando datos:", e);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  const agregarProducto = (unidad: any, marca: string, modelo: string) => {
    const yaExiste = productosSeleccionados.some(p => p.producto_detallado_id === unidad.producto_id);
    if (yaExiste) {
      alert("Este producto ya está en la venta");
      return;
    }

    setProductosSeleccionados([
      ...productosSeleccionados,
      {
        producto_detallado_id: unidad.producto_id,
        marca,
        modelo,
        imei_1: unidad.imei_1,
        precio_sin_igv: "",  // 👈 CAMBIO AQUÍ
        costo: unidad.costo
      }
    ]);
  };

  const quitarProducto = (producto_id: number) => {
    setProductosSeleccionados(productosSeleccionados.filter(p => p.producto_detallado_id !== producto_id));
  };

  // 👇 MODIFICADO: Ahora actualiza precio_sin_igv
  const actualizarPrecio = (producto_id: number, precio: string) => {
    setProductosSeleccionados(
      productosSeleccionados.map(p =>
        p.producto_detallado_id === producto_id ? { ...p, precio_sin_igv: precio } : p
      )
    );
  };

// 👇 NUEVOS CÁLCULOS: Ahora calculamos con IGV
  const calcularPrecioConIGV = (precioSinIGV: number) => {
    return precioSinIGV * 1.18;
  };

  const totalSinIGV = productosSeleccionados.reduce((sum, p) => sum + (parseFloat(p.precio_sin_igv) || 0), 0);
  const totalConIGV = calcularPrecioConIGV(totalSinIGV);
  const totalCosto = productosSeleccionados.reduce((sum, p) => sum + p.costo, 0);
  const margenTotal = totalConIGV - totalCosto;

  const handleCrearVenta = async () => {
    if (!clienteId) {
      alert("Debes seleccionar un cliente");
      return;
    }

    if (productosSeleccionados.length === 0) {
      alert("Debes agregar al menos un producto");
      return;
    }

    const productosSinPrecio = productosSeleccionados.filter(p => !p.precio_sin_igv || parseFloat(p.precio_sin_igv) <= 0);
    if (productosSinPrecio.length > 0) {
      alert("Todos los productos deben tener un precio sin IGV válido");
      return;
    }

    try {
      setLoading(true);
      
      // 👇 MODIFICADO: Enviamos precio_venta ya con IGV calculado
      await crearVentaDetallada({
        cliente_id: clienteId,
        date_order: fechaVenta,
        productos: productosSeleccionados.map(p => ({
          producto_detallado_id: p.producto_detallado_id,
          precio_venta: calcularPrecioConIGV(parseFloat(p.precio_sin_igv))  // 👈 CALCULA CON IGV
        }))
      });

      alert("✅ Venta creada correctamente");
      onVentaCreada();
      onClose();
    } catch (e: any) {
      alert(`❌ Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inventarioFiltrado = inventario.map(marca => ({
    ...marca,
    modelos: marca.modelos.map(modelo => ({
      ...modelo,
      unidades: modelo.unidades.filter(unidad =>
        !busqueda ||
        marca.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
        modelo.modelo.toLowerCase().includes(busqueda.toLowerCase()) ||
        unidad.imei_1.includes(busqueda) ||
        unidad.proveedor?.toLowerCase().includes(busqueda.toLowerCase())
      )
    })).filter(modelo => modelo.unidades.length > 0)
  })).filter(marca => marca.modelos.length > 0);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '20px',
        padding: '25px',
        width: '90%',
        maxWidth: '900px',
        maxHeight: '85vh',
        overflowY: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <h2 style={{ color: 'white', fontSize: '1.6rem', fontWeight: '700', margin: 0 }}>
            Nueva Venta
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              color: '#ef4444',
              width: '32px',
              height: '32px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div>
            <label style={{ color: 'white', display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
              Cliente *
            </label>
            <select
              value={clienteId || ''}
              onChange={e => setClienteId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px 10px',
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            >
              <option value="" style={{ background: '#1e293b', color: 'white' }}>
                Seleccionar cliente
              </option>
              {clientes.map(c => (
                <option key={c.id} value={c.id} style={{ background: '#1e293b', color: 'white' }}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ color: 'white', display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
              Fecha de Venta
            </label>
            <input
              type="date"
              value={fechaVenta}
              onChange={e => setFechaVenta(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: 'white',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
          </div>
        </div>

        <input
          type="text"
          placeholder="🔍 Buscar por marca, modelo, IMEI..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.07)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            color: 'white',
            marginBottom: '15px',
            outline: 'none',
            fontSize: '0.9rem'
          }}
        />

       {productosSeleccionados.length > 0 && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '15px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <h4 style={{ color: 'white', marginBottom: '10px', fontSize: '0.95rem', fontWeight: '600' }}>
              Productos Seleccionados ({productosSeleccionados.length})
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {productosSeleccionados.map((producto) => {
                const precioSinIGV = parseFloat(producto.precio_sin_igv) || 0;
                const precioConIGV = calcularPrecioConIGV(precioSinIGV);
                
                return (
                  <div key={producto.producto_detallado_id} style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px',
                    padding: '10px',
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr auto',
                    gap: '10px',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ color: 'white', fontSize: '0.85rem', fontWeight: '600' }}>
                        {producto.marca} {producto.modelo}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                        {producto.imei_1}
                      </div>
                    </div>
                    
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Precio sin IGV"
                        value={producto.precio_sin_igv}
                        onChange={e => actualizarPrecio(producto.producto_detallado_id, e.target.value)}
                        style={{
                          padding: '6px 8px',
                          background: 'rgba(255, 255, 255, 0.07)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '6px',
                          color: 'white',
                          fontSize: '0.85rem',
                          outline: 'none',
                          width: '100%'
                        }}
                      />
                      <div style={{ color: '#94a3b8', fontSize: '0.65rem', marginTop: '2px' }}>
                        Sin IGV
                      </div>
                    </div>

                    <div>
                      <div style={{ 
                        color: '#86efac', 
                        fontSize: '0.85rem', 
                        fontWeight: '600',
                        padding: '6px 8px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '6px',
                        textAlign: 'center'
                      }}>
                        {formatCurrency(precioConIGV)}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.65rem', marginTop: '2px', textAlign: 'center' }}>
                        Con IGV
                      </div>
                    </div>

                    <button
                      onClick={() => quitarProducto(producto.producto_detallado_id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        color: '#ef4444',
                        width: '24px',
                        height: '24px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '10px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: '10px',
              fontSize: '0.85rem'
            }}>
              <div>
                <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Costo</div>
                <div style={{ color: 'white', fontWeight: '600' }}>{formatCurrency(totalCosto)}</div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Sin IGV</div>
                <div style={{ color: 'white', fontWeight: '600' }}>{formatCurrency(totalSinIGV)}</div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Con IGV</div>
                <div style={{ color: '#86efac', fontWeight: '600' }}>{formatCurrency(totalConIGV)}</div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Margen</div>
                <div style={{
                  color: margenTotal >= 0 ? '#86efac' : '#ef4444',
                  fontWeight: '700'
                }}>
                  {formatCurrency(margenTotal)}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{
          maxHeight: '300px',
          overflowY: 'auto',
          marginBottom: '15px'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
              Cargando productos...
            </div>
          ) : inventarioFiltrado.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
              No hay productos disponibles
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {inventarioFiltrado.map((marca) => (
                <div key={marca.marca_id} style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden'
                }}>
                  <div
                    onClick={() => setMarcaExpandida(marcaExpandida === marca.marca_id ? null : marca.marca_id)}
                    style={{
                      padding: '10px 12px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '0.85rem',
                        transform: marcaExpandida === marca.marca_id ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}>▶</span>
                      <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: '600' }}>{marca.marca}</span>
                    </div>
                    <span style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      color: '#60a5fa',
                      padding: '3px 8px',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {marca.stock_total}
                    </span>
                  </div>

                  {marcaExpandida === marca.marca_id && (
                    <div style={{ padding: '6px 12px 6px 30px' }}>
                      {marca.modelos.map((modelo) => (
                        <div key={modelo.modelo_id} style={{
                          marginBottom: '6px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '6px',
                          overflow: 'hidden'
                        }}>
                          <div
                            onClick={() => setModeloExpandido(modeloExpandido === modelo.modelo_id ? null : modelo.modelo_id)}
                            style={{
                              padding: '8px 10px',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                fontSize: '0.75rem',
                                transform: modeloExpandido === modelo.modelo_id ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s ease'
                              }}>▶</span>
                              <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: '500' }}>
                                {modelo.modelo}
                              </span>
                            </div>
                            <span style={{
                              background: 'rgba(16, 185, 129, 0.2)',
                              color: '#86efac',
                              padding: '2px 6px',
                              borderRadius: '8px',
                              fontSize: '0.7rem',
                              fontWeight: '600'
                            }}>
                              {modelo.stock}
                            </span>
                          </div>

                          {modeloExpandido === modelo.modelo_id && (
                            <div style={{ padding: '0 10px 6px 28px' }}>
                              {modelo.unidades.map((unidad) => {
                                const yaSeleccionado = productosSeleccionados.some(
                                  p => p.producto_detallado_id === unidad.producto_id
                                );

                                return (
                                  <div key={unidad.producto_id} style={{
                                    background: yaSeleccionado ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: '4px',
                                    padding: '8px',
                                    marginBottom: '4px',
                                    border: yaSeleccionado ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}>
                                    <div style={{ flex: 1 }}>
                                      <div style={{
                                        color: '#94a3b8',
                                        fontSize: '0.65rem',
                                        marginBottom: '2px'
                                      }}>
                                        IMEI
                                      </div>
                                      <div style={{
                                        color: 'white',
                                        fontFamily: 'monospace',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                      }}>
                                        {unidad.imei_1}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => agregarProducto(unidad, marca.marca, modelo.modelo)}
                                      disabled={yaSeleccionado}
                                      style={{
                                        padding: '4px 10px',
                                        background: yaSeleccionado
                                          ? 'rgba(34, 197, 94, 0.2)'
                                          : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        fontWeight: '600',
                                        cursor: yaSeleccionado ? 'not-allowed' : 'pointer',
                                        opacity: yaSeleccionado ? 0.6 : 1
                                      }}
                                    >
                                      {yaSeleccionado ? '✓' : '+'}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

       <button
          onClick={handleCrearVenta}
          disabled={loading || !clienteId || productosSeleccionados.length === 0}
          style={{
            padding: '12px 20px',
            background: loading || !clienteId || productosSeleccionados.length === 0
              ? 'rgba(16, 185, 129, 0.3)'
              : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: loading || !clienteId || productosSeleccionados.length === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            width: '100%'
          }}
        >
          {loading ? 'Procesando...' : `💰 Crear Venta (${formatCurrency(totalConIGV)})`}
        </button>
      </div>
    </div>
  );
};

// ==================== COMPONENTE PRINCIPAL ====================
export default function Ventas() {
  const [ventas, setVentas] = useState<VentaDetalladaAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaDetalladaAPI | null>(null);
  const [mostrarNuevaVenta, setMostrarNuevaVenta] = useState(false);
  const [mesActual, setMesActual] = useState(new Date());
  const [filtroActivo, setFiltroActivo] = useState(true);
  const [mostrarAnuladas, setMostrarAnuladas] = useState(false);

    async function cargarVentas() {
    try {
      setLoading(true);
      setError(null);
      
      const filtros = filtroActivo ? {
        desde: obtenerPrimerDiaDelMes(mesActual),
        hasta: obtenerUltimoDiaDelMes(mesActual),
        incluir_anuladas: mostrarAnuladas
      } : {
        incluir_anuladas: mostrarAnuladas
      };
      
      const data = await listarVentasDetalladas(filtros);
      setVentas(data);
    } catch (e: any) {
      console.error("Error cargando ventas:", e);
      setError(e.message || "Error al cargar ventas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarVentas();
  }, [mesActual, filtroActivo, mostrarAnuladas]);

  const handleAnularVenta = async (ventaId: number) => {
    if (!confirm("¿Estás seguro de anular esta venta? Los productos volverán al inventario.")) {
      return;
    }

    try {
      await anularVenta(ventaId);
      alert("✅ Venta anulada correctamente");
      cargarVentas();
    } catch (e: any) {
      alert(`❌ Error: ${e.message}`);
    }
  };

  // 👇 NUEVA FUNCIÓN: Marcar venta como pagada
  const handleMarcarComoPagada = async (ventaId: number) => {
    if (!confirm("¿Marcar esta venta como pagada?")) {
      return;
    }

    try {
      await marcarVentaComoPagada(ventaId);
      alert("✅ Venta marcada como pagada");
      cargarVentas();
    } catch (e: any) {
      alert(`❌ Error: ${e.message}`);
    }
  };

     const handleDesmarcarPagada = async (ventaId: number) => {
    if (!confirm("¿Desmarcar esta venta como pagada? Volverá a estar pendiente.")) {
      return;
    }
    try {
      await desmarcarVentaPagada(ventaId);
      alert("✅ Venta desmarcada como pagada");
      cargarVentas();
    } catch (e: any) {
      alert(`❌ Error: ${e.message}`);
    }
  };

   // Recuperar venta anulada
    const handleRecuperarVenta = async (ventaId: number) => {
    if (!confirm("¿Recuperar esta venta? Los productos volverán a estar vendidos.")) {
      return;
    }
    try {
      await recuperarVentaAnulada(ventaId);
      alert("✅ Venta recuperada correctamente");
      cargarVentas();
    } catch (e: any) {
      alert(`❌ Error: ${e.message}`);
    }
  };

  const ventasActivas = ventas.filter(v => !v.anulado);
const totalVentas = ventasActivas.reduce((sum, v) => sum + v.total_real, 0);
const totalProductosVendidos = ventasActivas.reduce((sum, v) => sum + v.productos_count, 0);

const ventasPagadas = ventasActivas.filter(v => v.pagado);
const ventasPendientes = ventasActivas.filter(v => !v.pagado);
const totalPagado = ventasPagadas.reduce((sum, v) => sum + v.total_real, 0);
const totalPendiente = ventasPendientes.reduce((sum, v) => sum + v.total_real, 0);



  return (
    <div style={{
      padding: '40px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      position: 'relative'
    }}>
      
      {ventaSeleccionada && (
        <ModalDetalleVenta 
          venta={ventaSeleccionada} 
          onClose={() => setVentaSeleccionada(null)} 
        />
      )}

      {mostrarNuevaVenta && (
        <ModalNuevaVenta 
          onClose={() => setMostrarNuevaVenta(false)} 
          onVentaCreada={cargarVentas}
        />
      )}

      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
        borderRadius: '50%'
      }}></div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <div>
            <h1 style={{
              color: 'white',
              fontSize: '3rem',
              fontWeight: '800',
              margin: '0 0 8px 0',
              background: 'linear-gradient(135deg, #fff 0%, #10b981 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Gestión de Ventas
            </h1>
            <p style={{
              color: '#94a3b8',
              fontSize: '1.1rem',
              margin: 0
            }}>
              Registra y administra las ventas de productos
            </p>
          </div>

          <button
            onClick={() => setMostrarNuevaVenta(true)}
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>💰</span>
            Nueva Venta
          </button>
        </div>

        {/* 👇 ESTADÍSTICAS ACTUALIZADAS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '25px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💵</div>
            <div style={{ color: 'white', fontSize: '1.8rem', fontWeight: '700' }}>
              {formatCurrency(totalVentas)}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Total en Ventas</div>
          </div>

          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '16px',
            padding: '25px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✅</div>
            <div style={{ color: '#86efac', fontSize: '1.8rem', fontWeight: '700' }}>
              {formatCurrency(totalPagado)}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Pagado ({ventasPagadas.length})
            </div>
          </div>

          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '16px',
            padding: '25px',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
            <div style={{ color: '#fbbf24', fontSize: '1.8rem', fontWeight: '700' }}>
              {formatCurrency(totalPendiente)}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Pendiente ({ventasPendientes.length})
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '25px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🛒</div>
            <div style={{ color: 'white', fontSize: '1.8rem', fontWeight: '700' }}>
              {ventas.length}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Ventas Realizadas</div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '25px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📱</div>
            <div style={{ color: 'white', fontSize: '1.8rem', fontWeight: '700' }}>
              {totalProductosVendidos}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Productos Vendidos</div>
          </div>
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1))}
              style={{
                padding: '10px 16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1.2rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              ←
            </button>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>
                {filtroActivo ? 'Viendo ventas de:' : 'Mostrando todas las ventas'}
              </div>
              <div style={{ color: 'white', fontSize: '1.3rem', fontWeight: '700' }}>
                {filtroActivo ? formatearMesAnio(mesActual) : 'Historial Completo'}
              </div>
            </div>
            
            <button
              onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1))}
              disabled={mesActual >= new Date()}
              style={{
                padding: '10px 16px',
                background: mesActual >= new Date() ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: mesActual >= new Date() ? '#64748b' : 'white',
                fontSize: '1.2rem',
                cursor: mesActual >= new Date() ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (mesActual < new Date()) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                if (mesActual < new Date()) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              →
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>

             <button
              onClick={() => setMostrarAnuladas(!mostrarAnuladas)}
              style={{
                padding: '8px 16px',
                background: mostrarAnuladas ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                border: mostrarAnuladas ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                color: mostrarAnuladas ? '#ef4444' : '#94a3b8',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {mostrarAnuladas ? '👁️ Ocultando Anuladas' : '🗑️ Ver Anuladas'}
            </button>

            <button
              onClick={() => setMesActual(new Date())}
              style={{
                padding: '8px 16px',
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                color: '#60a5fa',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📅 Mes Actual
            </button>
            
            <button
              onClick={() => setFiltroActivo(!filtroActivo)}
              style={{
                padding: '8px 16px',
                background: filtroActivo ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                border: filtroActivo ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                color: filtroActivo ? '#86efac' : '#fbbf24',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {filtroActivo ? '✓ Filtro Activo' : '🔍 Ver Todo'}
            </button>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          padding: '40px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px'
          }}>
            <h2 style={{
              color: 'white',
              fontSize: '1.8rem',
              fontWeight: '700',
              margin: 0
            }}>
              Historial de Ventas
            </h2>
            <button
              onClick={cargarVentas}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                color: '#cbd5e1',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🔄 Actualizar
            </button>
          </div>

          {error ? (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '30px',
              textAlign: 'center',
              color: '#ef4444'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>Error al cargar ventas</h3>
              <p>{error}</p>
            </div>
          ) : loading ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: '#94a3b8'
            }}>
              <div style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '4px solid #94a3b8',
                borderTop: '4px solid #10b981',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '20px'
              }}></div>
              <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>Cargando ventas...</h3>
            </div>
          ) : ventas.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: '#94a3b8'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛒</div>
              <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>No hay ventas registradas</h3>
              <p>Comienza creando tu primera venta</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {ventas.map((venta) => (
                <div
                  key={venta.id}
                  style={{
                    background: venta.pagado 
                      ? 'rgba(16, 185, 129, 0.05)' 
                      : 'rgba(255, 255, 255, 0.03)',
                    border: venta.pagado 
                      ? '1px solid rgba(16, 185, 129, 0.2)' 
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '20px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = venta.pagado 
                      ? 'rgba(16, 185, 129, 0.1)' 
                      : 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = venta.pagado 
                      ? 'rgba(16, 185, 129, 0.05)' 
                      : 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '8px',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#86efac',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          Venta #{venta.id}
                        </span>
                        
                        {/* 👇 INDICADOR DE ESTADO DE PAGO */}
                         {venta.anulado && (
                          <span style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            🗑️ ANULADA
                          </span>
                        )}

                        {venta.pagado ? (
                          <span style={{
                            background: 'rgba(34, 197, 94, 0.2)',
                            color: '#86efac',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            ✅ Pagado
                          </span>
                        ) : (
                          <span style={{
                            background: 'rgba(245, 158, 11, 0.2)',
                            color: '#fbbf24',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            ⏳ Pendiente
                          </span>
                        )}
                        
                        <h4 style={{
                          color: 'white',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          margin: 0
                        }}>
                          {venta.cliente_name || 'Sin cliente'}
                        </h4>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        gap: '20px',
                        color: '#94a3b8',
                        fontSize: '0.9rem',
                        marginBottom: '4px'
                      }}>
                        <span>📅 Fecha: {formatearFecha(venta.date_order)}</span>
                        <span>📦 {venta.productos_count} producto{venta.productos_count !== 1 ? 's' : ''}</span>
                        {venta.fecha_pago && (
                          <span style={{ color: '#86efac' }}>
                            ✅ Pagado: {formatearFecha(venta.fecha_pago)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px'
                    }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          color: '#94a3b8',
                          fontSize: '0.75rem',
                          marginBottom: '4px'
                        }}>
                          Total
                        </div>
                        <div style={{
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '1.3rem'
                        }}>
                          {formatCurrency(venta.total_real)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setVentaSeleccionada(venta)}
                          style={{
                            padding: '8px 16px',
                            background: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '8px',
                            color: '#60a5fa',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          👁️ Ver Detalle
                        </button>
                        
                        {/* Mostrar botones según el estado de la venta */}
                        {venta.anulado ? (
                          // Si está anulada, mostrar solo botón de recuperar
                          <button
                            onClick={() => handleRecuperarVenta(venta.id)}
                            style={{
                              padding: '8px 16px',
                              background: 'rgba(34, 197, 94, 0.2)',
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                              borderRadius: '8px',
                              color: '#86efac',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            ♻️ Recuperar
                          </button>
                        ) : (
                          // Si NO está anulada, mostrar botones normales
                          <>
                            {venta.pagado ? (
                              // Si está pagada, botón para desmarcar
                              <button
                                onClick={() => handleDesmarcarPagada(venta.id)}
                                style={{
                                  padding: '8px 16px',
                                  background: 'rgba(245, 158, 11, 0.2)',
                                  border: '1px solid rgba(245, 158, 11, 0.3)',
                                  borderRadius: '8px',
                                  color: '#fbbf24',
                                  fontSize: '0.85rem',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                ↩️ Desmarcar Pago
                              </button>
                            ) : (
                              // Si NO está pagada, botón para marcar como pagada
                              <button
                                onClick={() => handleMarcarComoPagada(venta.id)}
                                style={{
                                  padding: '8px 16px',
                                  background: 'rgba(16, 185, 129, 0.2)',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                  borderRadius: '8px',
                                  color: '#86efac',
                                  fontSize: '0.85rem',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                💵 Marcar Pagado
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleAnularVenta(venta.id)}
                              style={{
                                padding: '8px 16px',
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px',
                                color: '#ef4444',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              ✕ Anular
                            </button>
                          </>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}