import React, { useEffect, useState } from "react";
import { listarInventarioAuto } from "../api"; // 👈 CAMBIO AQUÍ

type ProductoInventario = {
  marca: string;
  modelo: string;
  stock: number;
  ultima_entrada: string;
  proveedores: string[];
};

export default function Productos() {
  const [inventario, setInventario] = useState<ProductoInventario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState<'inventario' | 'stock'>('inventario');

  // Cargar inventario desde productos_detallados
  useEffect(() => {
    async function cargarInventario() {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Cargando inventario automático...');
        
        const data = await listarInventarioAuto(q); // 👈 CAMBIO AQUÍ
        console.log('📦 Inventario recibido:', data);
        
        // Asegurar que sea array
        const dataArray = Array.isArray(data) ? data : [];
        setInventario(dataArray);
        
        if (dataArray.length === 0) {
          console.log('ℹ️ No hay productos en inventario aún');
        }
      } catch (e: any) {
        console.error("❌ Error cargando inventario:", e);
        setError(e.message || "Error al cargar el inventario. Verifica la conexión al backend.");
        setInventario([]);
      } finally {
        setLoading(false);
      }
    }
    
    cargarInventario();
  }, [q]);
  // Filtrar inventario
  const inventarioFiltrado = inventario.filter(item =>
    q ? 
      item.marca.toLowerCase().includes(q.toLowerCase()) ||
      item.modelo.toLowerCase().includes(q.toLowerCase()) ||
      item.proveedores.some(prov => prov.toLowerCase().includes(q.toLowerCase()))
    : true
  );

  // Calcular estadísticas
  const estadisticas = {
    totalProductos: inventario.reduce((sum, item) => sum + item.stock, 0),
    totalItems: inventario.length,
  };

  // SUB-MENÚ
  const subMenuItems = [
    {
      id: 'inventario',
      label: 'Inventario General',
      description: 'Vista completa de todos los productos en stock',
      icon: '📊',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    },
    {
      id: 'stock', 
      label: 'Control de Stock',
      description: 'Gestión de niveles de inventario y alertas',
      icon: '📦',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
    }
  ];

  return (
    <div style={{
      padding: '40px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      position: 'relative'
    }}>
      
      {/* Efectos de fondo */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
        borderRadius: '50%'
      }}></div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}>
        
        {/* Header Mejorado */}
        <div style={{
          marginBottom: '50px',
          textAlign: 'center'
        }}>
          <h1 style={{
            color: 'white',
            fontSize: '3rem',
            fontWeight: '800',
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #fff 0%, #3b82f6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Inventario Automático</h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '1.3rem',
            fontWeight: '500'
          }}>Stock actualizado automáticamente desde los pedidos de proveedores</p>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📦</div>
            <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>
              {estadisticas.totalProductos}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Productos en Stock</div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '25px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🏷️</div>
            <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>
              {estadisticas.totalItems}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Modelos Diferentes</div>
          </div>

          
        </div>

        {/* Sub-menú Mejorado */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '30px',
          marginBottom: '50px',
          maxWidth: '900px',
          margin: '0 auto 50px'
        }}>
          {subMenuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id as 'inventario' | 'stock')}
              style={{
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              <div style={{
                background: activeTab === item.id 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(255, 255, 255, 0.05)',
                border: activeTab === item.id 
                  ? `1px solid ${item.color}40` 
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '40px 35px',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.boxShadow = `0 20px 40px ${item.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.background = activeTab === item.id 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: item.gradient,
                  opacity: activeTab === item.id ? 0.8 : 0.6
                }}></div>

                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '25px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: item.gradient,
                      borderRadius: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      boxShadow: `0 10px 30px ${item.color}40`
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 style={{
                        color: 'white',
                        fontSize: '1.6rem',
                        fontWeight: '700',
                        margin: '0 0 10px 0'
                      }}>
                        {item.label}
                      </h3>
                      <p style={{
                        color: '#cbd5e1',
                        margin: 0,
                        fontSize: '1.1rem',
                        fontWeight: '400'
                      }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{
                    color: activeTab === item.id ? item.color : '#94a3b8',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}>
                    {activeTab === item.id ? 'Activo' : 'Click para acceder'}
                  </span>
                  <div style={{
                    color: item.color,
                    fontSize: '24px',
                    fontWeight: 'bold',
                    transition: 'transform 0.3s ease',
                    transform: activeTab === item.id ? 'translateX(0)' : 'translateX(-5px)'
                  }}>
                    →
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          padding: '40px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          minHeight: '500px'
        }}>

          {/* ====== INVENTARIO GENERAL ====== */}
          {activeTab === 'inventario' && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                flexWrap: 'wrap',
                gap: '20px'
              }}>
                <h2 style={{
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: '700',
                  margin: 0,
                  background: 'linear-gradient(135deg, #fff 0%, #3b82f6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Inventario General ({inventarioFiltrado.length})
                </h2>

                <div style={{
                  display: 'flex',
                  gap: '15px',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <input
                    type="text"
                    placeholder="Buscar por marca, modelo o proveedor…"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    style={{
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none',
                      minWidth: '300px'
                    }}
                  />
                  <button
                    onClick={() => setQ("")}
                    style={{
                      padding: '12px 20px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      color: '#cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                  >
                    🧹 Limpiar
                  </button>
                </div>
              </div>

              {/* Tabla de inventario */}
              {error ? (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '30px',
                  textAlign: 'center',
                  color: '#ef4444',
                  marginTop: '20px'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                  <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>Error al cargar inventario</h3>
                  <p>{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    style={{
                      marginTop: '15px',
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    🔄 Reintentar
                  </button>
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
                    borderTop: '4px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '20px'
                  }}></div>
                  <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>Cargando inventario...</h3>
                  <p>Obteniendo datos desde los pedidos de proveedores</p>
                </div>
              ) : inventarioFiltrado.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '80px 20px',
                  color: '#94a3b8'
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '20px' }}>📦</div>
                  <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>
                    {q ? 'No se encontraron productos' : 'No hay productos en inventario'}
                  </h3>
                  <p>
                    {q 
                      ? `No hay productos que coincidan con "${q}". Intenta con otra búsqueda.` 
                      : 'Agrega productos desde la sección de Proveedores para ver el stock aquí automáticamente.'
                    }
                  </p>
                  {!q && (
                    <div style={{ marginTop: '20px' }}>
                      <a href="/proveedores" style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        border: 'none',
                        borderRadius: '10px',
                        color: 'white',
                        textDecoration: 'none',
                        fontWeight: '600',
                        cursor: 'pointer',
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
                        ➕ Ir a Proveedores
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse'
                  }}>
                    <thead>
                      <tr style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'white', fontWeight: '600' }}>Marca</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'white', fontWeight: '600' }}>Modelo</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'white', fontWeight: '600' }}>Stock</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'white', fontWeight: '600' }}>Última Entrada</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'white', fontWeight: '600' }}>Proveedores</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventarioFiltrado.map((item, index) => (
                        <tr key={index} style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '16px', color: 'white', fontWeight: '500' }}>{item.marca}</td>
                          <td style={{ padding: '16px', color: 'white', fontWeight: '500' }}>{item.modelo}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              display: 'inline-block',
                              background: item.stock > 5 ? 'rgba(34, 197, 94, 0.2)' : 
                                          item.stock > 2 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              color: item.stock > 5 ? '#86efac' : 
                                     item.stock > 2 ? '#fbbf24' : '#ef4444',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontWeight: '600',
                              fontSize: '0.9rem'
                            }}>
                              {item.stock} unidades
                              {item.stock <= 2 && <span style={{ marginLeft: '4px' }}>⚠️</span>}
                            </span>
                          </td>
                          <td style={{ padding: '16px', color: '#cbd5e1' }}>{item.ultima_entrada}</td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {item.proveedores.map((prov, provIndex) => (
                                <span key={provIndex} style={{
                                  background: 'rgba(59, 130, 246, 0.1)',
                                  color: '#60a5fa',
                                  padding: '4px 8px',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: '500'
                                }}>
                                  {prov}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ====== CONTROL DE STOCK ====== */}
          {activeTab === 'stock' && (
            <div>
              <h2 style={{
                color: 'white',
                fontSize: '2rem',
                fontWeight: '700',
                marginBottom: '30px',
                background: 'linear-gradient(135deg, #fff 0%, #10b981 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Control de Stock
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
              }}>
                {/* Alerta general de stock */}
                <div style={{
                  background: inventarioFiltrado.some(item => item.stock <= 2) 
                    ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '12px',
                  padding: '25px',
                  border: `1px solid ${inventarioFiltrado.some(item => item.stock <= 2) 
                    ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>
                    {inventarioFiltrado.some(item => item.stock <= 2) ? '⚠️' : '✅'}
                  </div>
                  <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>
                    {inventarioFiltrado.some(item => item.stock <= 2) ? '¡Stock Bajo!' : 'Stock Óptimo'}
                  </h3>
                  <p style={{ color: '#94a3b8', margin: 0 }}>
                    {inventarioFiltrado.filter(item => item.stock <= 2).length} modelos necesitan reposición inmediata
                  </p>
                </div>

                {/* Lista de stock bajo */}
                {inventarioFiltrado.filter(item => item.stock <= 2).length > 0 && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '25px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <h4 style={{ color: 'white', margin: '0 0 15px 0' }}>Modelos Críticos (≤2 unidades)</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {inventarioFiltrado.filter(item => item.stock <= 2).map((item, index) => (
                        <li key={index} style={{ 
                          color: '#ef4444', 
                          padding: '12px 0',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{ fontWeight: '500' }}>{item.marca} {item.modelo}</span>
                          <span style={{ 
                            background: 'rgba(239, 68, 68, 0.2)', 
                            color: '#ef4444', 
                            padding: '4px 8px', 
                            borderRadius: '6px',
                            fontWeight: '600' 
                          }}>
                            {item.stock} unidades
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Resumen de rotación */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '25px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  textAlign: 'center'
                }}>
                  <h4 style={{ color: 'white', margin: '0 0 15px 0' }}>Resumen de Rotación</h4>
                  <p style={{ color: '#94a3b8', margin: '0 0 10px 0' }}>
                    Modelos activos: {inventarioFiltrado.length}
                  </p>
                  <p style={{ color: '#94a3b8', margin: 0 }}>
                    Stock promedio: {inventarioFiltrado.length > 0 
                      ? Math.round(estadisticas.totalProductos / inventarioFiltrado.length) 
                      : 0} unidades/modelo
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Style para spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}