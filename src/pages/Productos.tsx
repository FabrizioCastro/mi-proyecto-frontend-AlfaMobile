import React, { useEffect, useState } from "react";
import { listarInventarioJerarquico, type MarcaInventario } from "../api";

export default function Productos() {
  const [inventario, setInventario] = useState<MarcaInventario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [marcaExpandida, setMarcaExpandida] = useState<number | null>(null);
  const [modeloExpandido, setModeloExpandido] = useState<number | null>(null);

  useEffect(() => {
    async function cargarInventario() {
      try {
        setLoading(true);
        setError(null);
        const data = await listarInventarioJerarquico(q);
        setInventario(data);
      } catch (e: any) {
        console.error("❌ Error cargando inventario:", e);
        setError(e.message || "Error al cargar el inventario");
        setInventario([]);
      } finally {
        setLoading(false);
      }
    }
    
    const timer = setTimeout(cargarInventario, 300);
    return () => clearTimeout(timer);
  }, [q]);

  const totalProductos = inventario.reduce((sum, marca) => sum + marca.stock_total, 0);
  const totalModelos = inventario.reduce((sum, marca) => sum + marca.modelos.length, 0);

  const toggleMarca = (marcaId: number) => {
    setMarcaExpandida(marcaExpandida === marcaId ? null : marcaId);
    setModeloExpandido(null);
  };

  const toggleModelo = (modeloId: number) => {
    setModeloExpandido(modeloExpandido === modeloId ? null : modeloId);
  };

  return (
    <div style={{
      padding: '40px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      position: 'relative'
    }}>
      
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
        
        {/* Header */}
        <div style={{ marginBottom: '50px', textAlign: 'center' }}>
          <h1 style={{
            color: 'white',
            fontSize: '3rem',
            fontWeight: '800',
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #fff 0%, #3b82f6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Inventario de Productos</h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '1.3rem',
            fontWeight: '500'
          }}>Vista detallada con IMEIs de cada unidad disponible</p>
        </div>

        {/* Estadísticas */}
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
            <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>{totalProductos}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Unidades en Stock</div>
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
            <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>{totalModelos}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Modelos Diferentes</div>
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
            <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>{inventario.length}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Marcas Disponibles</div>
          </div>
        </div>

        {/* Búsqueda */}
        <div style={{
          display: 'flex',
          gap: '15px',
          alignItems: 'center',
          marginBottom: '40px',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            placeholder="🔍 Buscar por marca, modelo, IMEI o proveedor..."
            value={q}
            onChange={e => setQ(e.target.value)}
            style={{
              flex: 1,
              minWidth: '300px',
              padding: '14px 20px',
              background: 'rgba(255, 255, 255, 0.07)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <button
            onClick={() => setQ("")}
            style={{
              padding: '14px 24px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: '#cbd5e1',
              fontSize: '1rem',
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

        {/* Contenido Principal */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          padding: '40px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          minHeight: '500px'
        }}>
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
              <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>Error al cargar inventario</h3>
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
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '20px'
              }}></div>
              <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>Cargando inventario...</h3>
            </div>
          ) : inventario.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: '#94a3b8'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📦</div>
              <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>
                {q ? 'No se encontraron productos' : 'No hay productos en inventario'}
              </h3>
              <p>{q ? `No hay productos que coincidan con "${q}"` : 'Agrega productos desde Proveedores'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {inventario.map((marca) => (
                <div key={marca.marca_id} style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden'
                }}>
                  {/* MARCA - Nivel 1 */}
                  <div
                    onClick={() => toggleMarca(marca.marca_id)}
                    style={{
                      padding: '20px 24px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{
                        fontSize: '1.5rem',
                        transform: marcaExpandida === marca.marca_id ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}>▶</span>
                      <div>
                        <h3 style={{
                          color: 'white',
                          fontSize: '1.4rem',
                          fontWeight: '700',
                          margin: 0
                        }}>{marca.marca}</h3>
                        <p style={{
                          color: '#94a3b8',
                          fontSize: '0.9rem',
                          margin: '4px 0 0 0'
                        }}>
                          {marca.modelos.length} modelo{marca.modelos.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      color: '#60a5fa',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontWeight: '700',
                      fontSize: '1rem'
                    }}>
                      Stock: {marca.stock_total}
                    </span>
                  </div>

                  {/* MODELOS - Nivel 2 */}
                  {marcaExpandida === marca.marca_id && (
                    <div style={{ padding: '16px 24px 16px 60px' }}>
                      {marca.modelos.map((modelo) => (
                        <div key={modelo.modelo_id} style={{
                          marginBottom: '12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          overflow: 'hidden'
                        }}>
                          {/* MODELO Header */}
                          <div
                            onClick={() => toggleModelo(modelo.modelo_id)}
                            style={{
                              padding: '16px 20px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{
                                fontSize: '1.2rem',
                                transform: modeloExpandido === modelo.modelo_id ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s ease'
                              }}>▶</span>
                              <span style={{
                                color: 'white',
                                fontSize: '1.1rem',
                                fontWeight: '600'
                              }}>{modelo.modelo}</span>
                            </div>
                            <span style={{
                              background: 'rgba(16, 185, 129, 0.2)',
                              color: '#86efac',
                              padding: '6px 12px',
                              borderRadius: '16px',
                              fontWeight: '600',
                              fontSize: '0.9rem'
                            }}>
                              {modelo.stock} unidad{modelo.stock !== 1 ? 'es' : ''}
                            </span>
                          </div>

                          {/* UNIDADES - Nivel 3 */}
                          {modeloExpandido === modelo.modelo_id && (
                            <div style={{
                              padding: '0 20px 16px 52px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px'
                            }}>
                              {modelo.unidades.map((unidad) => (
                                <div key={unidad.producto_id} style={{
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  borderRadius: '8px',
                                  padding: '14px 16px',
                                  border: '1px solid rgba(255, 255, 255, 0.08)',
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr 1fr auto',
                                  gap: '16px',
                                  alignItems: 'center',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                                >
                                  <div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>
                                      IMEI 1
                                    </div>
                                    <div style={{
                                      color: 'white',
                                      fontFamily: 'monospace',
                                      fontSize: '0.9rem',
                                      fontWeight: '600'
                                    }}>
                                      {unidad.imei_1}
                                    </div>
                                  </div>

                                  <div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>
                                      IMEI 2
                                    </div>
                                    <div style={{
                                      color: 'white',
                                      fontFamily: 'monospace',
                                      fontSize: '0.9rem',
                                      fontWeight: '600'
                                    }}>
                                      {unidad.imei_2 || '—'}
                                    </div>
                                  </div>

                                  <div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>
                                      Proveedor
                                    </div>
                                    <div style={{
                                      color: '#fbbf24',
                                      fontSize: '0.9rem',
                                      fontWeight: '600'
                                    }}>
                                      {unidad.proveedor || 'N/A'}
                                    </div>
                                  </div>

                                  <div style={{
                                    background: 'rgba(34, 197, 94, 0.2)',
                                    color: '#86efac',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    textAlign: 'center',
                                    minWidth: '100px'
                                  }}>
                                    En Stock
                                  </div>
                                </div>
                              ))}
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