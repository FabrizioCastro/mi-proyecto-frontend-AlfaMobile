// src/pages/Proveedores.tsx - VERSIÓN FINAL CON CALLBACK PARA ACTUALIZAR TOTAL
import { useEffect, useState } from "react";
import { listarProveedores, crearProveedor, listarPedidosProveedor, 
  crearPedidoProveedor, listarMarcas, listarModelos, crearProductoDetallado, listarProductosDetallados, actualizarPedidoProveedor } from "../api";

type Proveedor = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  vat?: string;
};

// Helper para formatear números de forma segura
const formatCurrency = (value: any): string => {
  const num = Number(value) || 0;
  return `S/ ${num.toFixed(2)}`;
};

// Helper para convertir a número de forma segura (CORREGIDO: maneja undefined/null/empty)
const safeNumber = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;
  return Number(value) || 0;
};

// Componente para Modal de Pedidos - VERSIÓN CORREGIDA CON CALLBACK
const ModalPedidos = ({ proveedor, onClose }: { proveedor: Proveedor; onClose: () => void }) => {
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<any>(null);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [mostrarFormPedido, setMostrarFormPedido] = useState(false);
  const [formPedido, setFormPedido] = useState({
    numero_pedido: "",
    fecha_pedido: new Date().toISOString().split('T')[0],
    observaciones: ""
  });

  // Función para recargar pedidos (se pasa como callback al modal de productos) 👈 NUEVO: Callback principal
  const cargarPedidos = async () => {
    try {
      setLoadingPedidos(true);
      const data = await listarPedidosProveedor(proveedor.id);
      // Asegurarnos de que los totales sean números
      const pedidosProcesados = data.map(pedido => ({
        ...pedido,
        total: safeNumber(pedido.total),
        productos_count: safeNumber(pedido.productos_count)
      }));
      setPedidos(pedidosProcesados);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
    } finally {
      setLoadingPedidos(false);
    }
  };

  // Cargar pedidos del proveedor
  useEffect(() => {
    cargarPedidos();
  }, [proveedor.id]);

  // Crear nuevo pedido
  const handleCrearPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPedido.numero_pedido.trim()) {
      alert("El número de pedido es obligatorio");
      return;
    }

    try {
      await crearPedidoProveedor({
        proveedor_id: proveedor.id,
        numero_pedido: formPedido.numero_pedido,
        fecha_pedido: formPedido.fecha_pedido,
        observaciones: formPedido.observaciones
      });
      
      // Recargar la lista de pedidos
      await cargarPedidos();
      
      setFormPedido({ 
        numero_pedido: "", 
        fecha_pedido: new Date().toISOString().split('T')[0], 
        observaciones: "" 
      });
      setMostrarFormPedido(false);
      alert("✅ Pedido creado correctamente");
    } catch (error) {
      console.error("Error creando pedido:", error);
      alert("❌ Error al crear el pedido");
    }
  };

  // Total general del proveedor (suma de todos los pedidos) 👈 MEJORADO: Variables separadas para claridad
  const totalProveedor = pedidos.reduce((sum, p) => sum + safeNumber(p.total), 0);
  const totalProductos = pedidos.reduce((sum, p) => sum + safeNumber(p.productos_count), 0);

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
        maxWidth: '900px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        position: 'relative'
      }}>
        
        {/* Header del Modal - AGREGADO: Total general del proveedor */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '25px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <div>
            <h2 style={{
              color: 'white',
              fontSize: '1.8rem',
              fontWeight: '700',
              margin: 0
            }}>
              Pedidos de {proveedor.name}
            </h2>
            <p style={{
              color: '#94a3b8',
              margin: '8px 0 0 0'
            }}>
              Total general: {formatCurrency(totalProveedor)} • {totalProductos} productos
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
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Botón para nuevo pedido */}
        <div style={{ marginBottom: '25px' }}>
          <button
            onClick={() => setMostrarFormPedido(true)}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span>📦</span>
            Nuevo Pedido
          </button>
        </div>

        {/* Formulario de nuevo pedido - AGREGADO: Campo observaciones full-width */}
        {mostrarFormPedido && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ 
              color: 'white', 
              marginBottom: '15px',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}>
              Crear Nuevo Pedido
            </h3>
            <form onSubmit={handleCrearPedido}>
              <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ 
                    color: 'white', 
                    display: 'block', 
                    marginBottom: '5px',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    Número de Pedido *
                  </label>
                  <input
                    type="text"
                    placeholder="PED-001"
                    value={formPedido.numero_pedido}
                    onChange={(e) => setFormPedido({...formPedido, numero_pedido: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
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
                  <label style={{ 
                    color: 'white', 
                    display: 'block', 
                    marginBottom: '5px',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    Fecha de Pedido
                  </label>
                  <input
                    type="date"
                    value={formPedido.fecha_pedido}
                    onChange={(e) => setFormPedido({...formPedido, fecha_pedido: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}> {/* 👈 NUEVO: Observaciones full-width */}
                  <label style={{ 
                    color: 'white', 
                    display: 'block', 
                    marginBottom: '5px',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    Observaciones (Opcional)
                  </label>
                  <textarea
                    placeholder="Notas sobre el pedido..."
                    value={formPedido.observaciones}
                    onChange={(e) => setFormPedido({...formPedido, observaciones: e.target.value})}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setMostrarFormPedido(false)}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: '#cbd5e1',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Crear Pedido
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Pedidos - AGREGADO: Mostrar observaciones si existe, y conteo total */}
        <div>
          <h3 style={{ 
            color: 'white', 
            marginBottom: '15px',
            fontSize: '1.1rem',
            fontWeight: '600'
          }}>
            Pedidos Realizados ({pedidos.length})
          </h3>

          {loadingPedidos ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#94a3b8' 
            }}>
              <div style={{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                border: '2px solid #94a3b8',
                borderTop: '2px solid #f59e0b',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '8px'
              }}></div>
              Cargando pedidos...
            </div>
          ) : pedidos.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#94a3b8' 
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📦</div>
              No hay pedidos registrados
              <div style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                Crea tu primer pedido para comenzar
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {pedidos.map((pedido) => (
                <div
                  key={pedido.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      color: 'white', 
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}>
                      {pedido.numero_pedido || 'Sin número'}
                    </div>
                    <div style={{ 
                      color: '#94a3b8', 
                      fontSize: '0.8rem',
                      marginTop: '4px'
                    }}>
                      {pedido.fecha_pedido} • {pedido.productos_count || 0} productos
                      {pedido.observaciones && (
                        <span style={{ marginLeft: '8px' }}>• {pedido.observaciones.substring(0, 50)}...</span> // 👈 NUEVO: Muestra observaciones truncadas
                      )}
                    </div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '15px' 
                  }}>
                    <span style={{ 
                      color: 'white', 
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}>
                      {formatCurrency(pedido.total)}
                    </span>
                    <button
                      onClick={() => {
                        setPedidoSeleccionado(pedido);
                                              }}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '6px',
                        color: '#60a5fa',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Añadir Productos
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 👈 NUEVO: Modal de Agregar Productos con callback para actualizar pedidos */}
        {pedidoSeleccionado && (
          <ModalAgregarProductos 
            pedido={pedidoSeleccionado} 
            onClose={() => setPedidoSeleccionado(null)} 
            onProductoAgregado={cargarPedidos}  // 👈 CRÍTICO: Callback para recargar pedidos y mostrar total actualizado
          />
        )}
      </div>
    </div>
  );
};

// Componente para Modal de Añadir Productos - VERSIÓN CORREGIDA CON CALLBACK Y VALIDACIONES
const ModalAgregarProductos = ({ 
  pedido, 
  onClose, 
  onProductoAgregado  // 👈 NUEVO: Callback para notificar al padre (recargar pedidos)
}: { 
  pedido: any; 
  onClose: () => void; 
  onProductoAgregado?: () => Promise<void>;  // Opcional, pero recomendado
}) => {
  const [productos, setProductos] = useState<any[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [mostrarFormProducto, setMostrarFormProducto] = useState(false);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [modelos, setModelos] = useState<any[]>([]);
  const [formProducto, setFormProducto] = useState({
    marca_id: "",
    modelo_id: "",
    imei_1: "",
    imei_2: "",
    costo: "",
    fecha_ingreso: new Date().toISOString().split('T')[0]
  });

  // Cargar datos iniciales
  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoadingProductos(true);
        // Cargar marcas y modelos (sin filtro inicial)
        const [marcasData, modelosData, productosData] = await Promise.all([
          listarMarcas(),
          listarModelos(),  // Carga todos, filtra en frontend
          listarProductosDetallados(pedido.id)
        ]);
        
        setMarcas(marcasData);
        setModelos(modelosData);
        
        // Procesar productos para asegurar números
        const productosProcesados = productosData.map(producto => ({
          ...producto,
          costo: safeNumber(producto.costo)
        }));
        setProductos(productosProcesados);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoadingProductos(false);
      }
    }
    cargarDatos();
  }, [pedido.id]);

  // Filtrar modelos según la marca seleccionada
  const modelosFiltrados = modelos.filter(modelo => 
    formProducto.marca_id ? modelo.marca_id === parseInt(formProducto.marca_id) : true
  );

  // Validación IMEI básica (solo números, >=15 dígitos) 👈 NUEVO: Mejora UX
  const validarIMEI = (imei: string): boolean => {
    return /^\d{15,}$/.test(imei) && imei.length >= 15;
  };

  const handleAgregarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formProducto.modelo_id) {
      alert("Por favor seleccione un modelo");
      return;
    }
    if (!formProducto.imei_1 || !validarIMEI(formProducto.imei_1)) {
      alert("El IMEI 1 debe tener al menos 15 dígitos numéricos");
      return;
    }
    if (!formProducto.costo || safeNumber(formProducto.costo) <= 0) {
      alert("El costo debe ser un número mayor a 0");
      return;
    }

    try {
      setLoadingProductos(true);  // 👈 NUEVO: Loading breve para feedback

      await crearProductoDetallado({
        pedido_id: pedido.id,
        modelo_id: parseInt(formProducto.modelo_id),
        imei_1: formProducto.imei_1,
        imei_2: formProducto.imei_2 || undefined,
        costo: safeNumber(formProducto.costo),
        fecha_ingreso: formProducto.fecha_ingreso
      });

      // Recargar productos locales
      const productosData = await listarProductosDetallados(pedido.id);
      const productosProcesados = productosData.map(producto => ({
        ...producto,
        costo: safeNumber(producto.costo)
      }));
      setProductos(productosProcesados);
      
      // 👈 CRÍTICO: Llamar callback para recargar pedidos en el padre (actualiza total)
      if (onProductoAgregado) {
        await onProductoAgregado();
      }
      
      // Limpiar formulario
      setFormProducto({
        marca_id: "",
        modelo_id: "",
        imei_1: "",
        imei_2: "",
        costo: "",
        fecha_ingreso: new Date().toISOString().split('T')[0]
      });
      setMostrarFormProducto(false);
      
      alert("✅ Producto agregado correctamente");
    } catch (error: any) {
      console.error("Error agregando producto:", error);
      alert(`❌ Error al agregar el producto: ${error.message || 'Inténtalo de nuevo'}`);
    } finally {
      setLoadingProductos(false);  // 👈 Finaliza loading
    }
  };

  // Total parcial de productos en este pedido 👈 NUEVO: Para verificación rápida
  const totalProductosPedido = productos.reduce((sum, p) => sum + safeNumber(p.costo), 0);

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
      zIndex: 1001,
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
        border: '1px solid rgba(255, 255, 255, 0.15)',
        position: 'relative'
      }}>
        
        {/* Header del Modal - AGREGADO: Total del pedido */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '25px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <div>
            <h2 style={{
              color: 'white',
              fontSize: '1.8rem',
              fontWeight: '700',
              margin: 0
            }}>
              Productos del Pedido {pedido.numero_pedido || pedido.id}
            </h2>
            <p style={{
              color: '#94a3b8',
              margin: '8px 0 0 0'
            }}>
              Total del pedido: {formatCurrency(pedido.total)} • {productos.length} productos agregados
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
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Botón para agregar producto */}
        <div style={{ marginBottom: '25px' }}>
          <button
            onClick={() => setMostrarFormProducto(true)}
            disabled={loadingProductos}  // 👈 NUEVO: Deshabilita si loading
            style={{
              padding: '12px 20px',
              background: loadingProductos ? 'rgba(16, 185, 129, 0.5)' : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: loadingProductos ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!loadingProductos) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loadingProductos) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <span>📱</span>
            {loadingProductos ? 'Guardando...' : 'Agregar Producto'}
          </button>
        </div>

        {/* Formulario para agregar producto */}
        {mostrarFormProducto && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ 
              color: 'white', 
              marginBottom: '15px',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}>
              Agregar Nuevo Producto
            </h3>
            <form onSubmit={handleAgregarProducto}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr',
                gap: '15px', 
                marginBottom: '20px' 
              }}>
                {/* Columna Izquierda */}
                <div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ 
                      color: 'white', 
                      display: 'block', 
                      marginBottom: '5px',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      Marca *
                    </label>
                    <select
                      value={formProducto.marca_id}
                      onChange={(e) => setFormProducto({...formProducto, marca_id: e.target.value, modelo_id: ""})}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.07)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">Seleccionar marca</option>
                      {marcas.map((marca) => (
                        <option key={marca.id} value={marca.id}>
                          {marca.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ 
                      color: 'white', 
                      display: 'block', 
                      marginBottom: '5px',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      Modelo *
                    </label>
                    <select
                      value={formProducto.modelo_id}
                      onChange={(e) => setFormProducto({...formProducto, modelo_id: e.target.value})}
                      disabled={!formProducto.marca_id || loadingProductos}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.07)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: loadingProductos ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <option value="">Seleccionar modelo</option>
                      {modelosFiltrados.map((modelo) => (
                        <option key={modelo.id} value={modelo.id}>
                          {modelo.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ 
                      color: 'white', 
                      display: 'block', 
                      marginBottom: '5px',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      Costo (S/) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={formProducto.costo}
                      onChange={(e) => setFormProducto({...formProducto, costo: e.target.value})}
                      disabled={loadingProductos}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.07)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: 'white',
                        outline: 'none',
                        cursor: loadingProductos ? 'not-allowed' : 'text'
                      }}
                    />
                  </div>
                </div>

                {/* Columna Derecha */}
                <div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ 
                      color: 'white', 
                      display: 'block', 
                      marginBottom: '5px',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      IMEI 1 * (15+ dígitos)
                    </label>
                    <input
                      type="text"
                      placeholder="123456789012345"
                      value={formProducto.imei_1}
                      onChange={(e) => setFormProducto({...formProducto, imei_1: e.target.value})}
                      disabled={loadingProductos}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.07)',
                        border: formProducto.imei_1 && !validarIMEI(formProducto.imei_1) 
                          ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: 'white',
                        outline: 'none',
                        cursor: loadingProductos ? 'not-allowed' : 'text'
                      }}
                    />
                    {formProducto.imei_1 && !validarIMEI(formProducto.imei_1) && (
                      <small style={{ color: '#ef4444', fontSize: '0.75rem' }}>
                        IMEI inválido (debe ser 15+ dígitos numéricos)
                      </small>
                    )}
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ 
                      color: 'white', 
                      display: 'block', 
                      marginBottom: '5px',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      IMEI 2 (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="123456789012346"
                      value={formProducto.imei_2}
                      onChange={(e) => setFormProducto({...formProducto, imei_2: e.target.value})}
                      disabled={loadingProductos}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.07)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: 'white',
                        outline: 'none',
                        cursor: loadingProductos ? 'not-allowed' : 'text'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                                        <label style={{ 
                      color: 'white', 
                      display: 'block', 
                      marginBottom: '5px',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      Fecha de Ingreso
                    </label>
                    <input
                      type="date"
                      value={formProducto.fecha_ingreso}
                      onChange={(e) => setFormProducto({...formProducto, fecha_ingreso: e.target.value})}
                      disabled={loadingProductos}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.07)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: 'white',
                        outline: 'none',
                        cursor: loadingProductos ? 'not-allowed' : 'pointer'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setMostrarFormProducto(false)}
                  disabled={loadingProductos}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: '#cbd5e1',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    cursor: loadingProductos ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingProductos) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingProductos}
                  style={{
                    padding: '8px 16px',
                    background: loadingProductos ? 'rgba(16, 185, 129, 0.5)' : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    cursor: loadingProductos ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingProductos) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loadingProductos) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {loadingProductos ? 'Guardando...' : 'Agregar Producto'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Productos - AGREGADO: Total parcial al final */}
        <div>
          <h3 style={{ 
            color: 'white', 
            marginBottom: '15px',
            fontSize: '1.1rem',
            fontWeight: '600'
          }}>
            Productos ({productos.length})
          </h3>

          {loadingProductos ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#94a3b8' 
            }}>
              <div style={{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                border: '2px solid #94a3b8',
                borderTop: '2px solid #10b981',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '8px'
              }}></div>
              {productos.length > 0 ? 'Actualizando...' : 'Cargando productos...'}
            </div>
          ) : productos.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#94a3b8' 
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📱</div>
              No hay productos en este pedido
              <div style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                Agrega tu primer producto para comenzar
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
                {productos.map((producto) => (
                  <div
                    key={producto.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '15px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          color: 'white', 
                          fontWeight: '600', 
                          fontSize: '1rem',
                          marginBottom: '8px'
                        }}>
                          {producto.marca_name} {producto.modelo_name}
                        </div>
                        <div style={{ 
                          color: '#94a3b8', 
                          fontSize: '0.8rem'
                        }}>
                          <div>IMEI 1: {producto.imei_1}</div>
                          {producto.imei_2 && <div>IMEI 2: {producto.imei_2}</div>}
                          <div>Fecha: {producto.fecha_ingreso}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          color: 'white', 
                          fontWeight: '600', 
                          fontSize: '1.1rem',
                          marginBottom: '8px'
                        }}>
                          {formatCurrency(producto.costo)}
                        </div>
                        <div style={{ 
                          background: 'rgba(34, 197, 94, 0.2)', 
                          color: '#86efac', 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.7rem'
                        }}>
                          En stock
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 👈 NUEVO: Total parcial de productos */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '10px',
                padding: '15px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'right'
              }}>
                <div style={{ 
                  color: 'white', 
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  Subtotal productos: {formatCurrency(totalProductosPedido)}
                </div>
                <small style={{ color: '#94a3b8' }}>
                  (Debe coincidir con el total del pedido)
                </small>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente principal de Proveedores - VERSIÓN COMPLETA
export default function Proveedores() {
  const [items, setItems] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", vat: "" });
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);

  async function cargar(busqueda?: string) {
    try {
      setLoading(true);
      setError(null);
      const data = await listarProveedores(busqueda);
      setItems(data);
    } catch (e: any) {
      setError(e.message || "Error al cargar proveedores");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function onCrear(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setMsg("❌ El nombre es obligatorio");
      return;
    }
    try {
      setMsg(null);
      await crearProveedor({
        name: form.name.trim(),
        email: form.email || undefined,
        phone: form.phone || undefined,
        vat: form.vat || undefined,
      });
      setMsg("✅ Proveedor creado correctamente");
      setForm({ name: "", email: "", phone: "", vat: "" });
      setMostrarFormulario(false);
      await cargar();
    } catch (e: any) {
      setMsg(`❌ Error: ${e.message || e}`);
    }
  }

  const proveedoresFiltrados = items.filter((p) =>
    q
      ? (p.name?.toLowerCase() ?? "").includes(q.toLowerCase()) ||
        (p.email?.toLowerCase() ?? "").includes(q.toLowerCase()) ||
        (p.phone?.toLowerCase() ?? "").includes(q.toLowerCase()) ||
        (p.vat?.toLowerCase() ?? "").includes(q.toLowerCase())
      : true
  );

  return (
    <div style={{
      padding: '40px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      position: 'relative'
    }}>
      
      {/* Modal de Pedidos */}
      {proveedorSeleccionado && (
        <ModalPedidos 
          proveedor={proveedorSeleccionado} 
          onClose={() => setProveedorSeleccionado(null)} 
        />
      )}

      {/* Efectos de fondo */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
        borderRadius: '50%'
      }}></div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}>
        
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <div>
            <h1 style={{
              color: 'white',
              fontSize: '2.5rem',
              fontWeight: '800',
              margin: '0 0 8px 0',
              background: 'linear-gradient(135deg, #fff 0%, #f59e0b 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Gestión de Proveedores
            </h1>
            <p style={{
              color: '#94a3b8',
              fontSize: '1.1rem',
              margin: 0
            }}>
              Administra proveedores y sus pedidos de productos
            </p>
          </div>

          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span>➕</span>
            {mostrarFormulario ? 'Cancelar' : 'Nuevo Proveedor'}
          </button>
        </div>

        {/* Mensajes */}
        {msg && (
          <div style={{
            background: msg.includes('✅') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${msg.includes('✅') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: msg.includes('✅') ? '#86efac' : '#fca5a5'
          }}>
            {msg}
          </div>
        )}

        {/* Formulario de Nuevo Proveedor */}
        {mostrarFormulario && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            marginBottom: '30px'
          }}>
            <h3 style={{
              color: 'white',
              fontSize: '1.3rem',
              fontWeight: '600',
              margin: '0 0 20px 0'
            }}>
              Registrar Nuevo Proveedor
            </h3>
            
            <form onSubmit={onCrear}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '25px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    Nombre / Razón Social *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: TecnoImport SAC"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    RUC
                  </label>
                  <input
                    type="text"
                    placeholder="20123456789"
                    value={form.vat}
                    onChange={(e) => setForm({...form, vat: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="contacto@empresa.com"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid: rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    placeholder="+51 987 654 321"
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Crear Proveedor
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Búsqueda y Controles */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          gap: '20px'
        }}>
          <input
            type="text"
            placeholder="Buscar proveedores..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.07)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              color: 'white',
              fontSize: '0.9rem',
              outline: 'none',
              width: '300px'
            }}
          />
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => cargar()}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#cbd5e1',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🔄 Actualizar
            </button>
            <button
              onClick={() => setQ("")}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#cbd5e1',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🧹 Limpiar
            </button>
          </div>
        </div>

        {/* Lista de Proveedores */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '30px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '1.3rem',
            fontWeight: '600',
            margin: '0 0 25px 0'
          }}>
            Proveedores Registrados ({proveedoresFiltrados.length})
          </h3>

          {error ? (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '20px',
              color: '#ef4444',
              textAlign: 'center'
            }}>
              Error: {error}
            </div>
          ) : loading ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94a3b8'
            }}>
              <div style={{
                display: 'inline-block',
                width: '20px',
                height: '20px',
                border: '2px solid #94a3b8',
                borderTop: '2px solid #f59e0b',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <div style={{ marginTop: '12px' }}>Cargando proveedores...</div>
            </div>
          ) : proveedoresFiltrados.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94a3b8'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
              <div>No hay proveedores registrados</div>
              <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                {q ? 'No se encontraron proveedores con ese criterio' : 'Comienza creando tu primer proveedor'}
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '16px'
            }}>
              {proveedoresFiltrados.map((proveedor) => (
                <div
                  key={proveedor.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '20px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
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
                        marginBottom: '8px'
                      }}>
                        <h4 style={{
                          color: 'white',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          margin: 0
                        }}>
                          {proveedor.name}
                        </h4>
                        {proveedor.vat && (
                          <span style={{
                            background: 'rgba(245, 158, 11, 0.2)',
                            color: '#fbbf24',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          }}>
                            RUC: {proveedor.vat}
                          </span>
                        )}
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        gap: '20px',
                        color: '#94a3b8',
                        fontSize: '0.9rem'
                      }}>
                        {proveedor.email && (
                          <span>📧 {proveedor.email}</span>
                        )}
                        {proveedor.phone && (
                          <span>📞 {proveedor.phone}</span>
                        )}
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <button
                        onClick={() => setProveedorSeleccionado(proveedor)}
                        style={{
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>📦</span>
                        Ver Pedidos
                      </button>
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

                     