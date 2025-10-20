// src/pages/CuentasPorCobrar.tsx
import { useEffect, useState } from "react";
import { listarCuentasPorCobrar, marcarComoCobrado, type CuentaPorCobrarAPI } from "../api";

const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `S/ ${(num || 0).toFixed(2)}`;
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

const obtenerPrimerDiaDelMes = (fecha: Date) => {
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1).toISOString().split('T')[0];
};

const obtenerUltimoDiaDelMes = (fecha: Date) => {
  return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).toISOString().split('T')[0];
};

const formatearMesAnio = (fecha: Date) => {
  return fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
};

export default function CuentasPorCobrar() {
  const [cuentasPorCobrar, setCuentasPorCobrar] = useState<CuentaPorCobrarAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [mesActual, setMesActual] = useState(new Date());
  const [filtroActivo, setFiltroActivo] = useState(true);
  const [soloPendientes, setSoloPendientes] = useState(true);

  async function cargarCuentas() {
    try {
      setLoading(true);
      setError(null);
      
      const data = await listarCuentasPorCobrar(soloPendientes);
      
      if (filtroActivo) {
        const desde = obtenerPrimerDiaDelMes(mesActual);
        const hasta = obtenerUltimoDiaDelMes(mesActual);
        
        const filtradas = data.filter(cuenta => {
          const fechaComparar = cuenta.fecha_registro;
          return fechaComparar >= desde && fechaComparar <= hasta;
        });
        
        setCuentasPorCobrar(filtradas);
      } else {
        setCuentasPorCobrar(data);
      }
    } catch (e: any) {
      console.error("Error cargando cuentas:", e);
      setError(e.message || "Error al cargar cuentas por cobrar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarCuentas();
  }, [mesActual, filtroActivo, soloPendientes]);

  const handleMarcarCobrado = async (cuentaId: number) => {
    if (!confirm("¿Marcar esta cuenta como cobrada?")) {
      return;
    }

    try {
      await marcarComoCobrado(cuentaId);
      alert("✅ Cuenta marcada como cobrada");
      cargarCuentas();
    } catch (e: any) {
      alert(`❌ Error: ${e.message}`);
    }
  };

  const totalPendiente = cuentasPorCobrar
    .filter(c => !c.cobrado)
    .reduce((sum, c) => sum + c.monto, 0);
  
  const totalCobrado = cuentasPorCobrar
    .filter(c => c.cobrado)
    .reduce((sum, c) => sum + c.monto, 0);

  const hoy = new Date().toISOString().split('T')[0];
  const cuentasVencidas = cuentasPorCobrar.filter(c => !c.cobrado && c.fecha_vencimiento && c.fecha_vencimiento < hoy);

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
              Cuentas por Cobrar
            </h1>
            <p style={{
              color: '#94a3b8',
              fontSize: '1.1rem',
              margin: 0
            }}>
              Control de cobros pendientes de clientes
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
            <div style={{ color: '#10b981', fontSize: '1.8rem', fontWeight: '700' }}>
              {formatCurrency(totalPendiente)}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Pendiente de Cobro</div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '25px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✅</div>
            <div style={{ color: '#86efac', fontSize: '1.8rem', fontWeight: '700' }}>
              {formatCurrency(totalCobrado)}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Cobrado</div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '25px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️</div>
            <div style={{ color: '#fbbf24', fontSize: '1.8rem', fontWeight: '700' }}>
              {cuentasVencidas.length}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Cuentas Vencidas</div>
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
                cursor: 'pointer'
              }}
            >
              ←
            </button>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>
                {filtroActivo ? 'Viendo cuentas de:' : 'Mostrando todas las cuentas'}
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
                cursor: mesActual >= new Date() ? 'not-allowed' : 'pointer'
              }}
            >
              →
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
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

            <button
              onClick={() => setSoloPendientes(!soloPendientes)}
              style={{
                padding: '8px 16px',
                background: soloPendientes ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: soloPendientes ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: soloPendientes ? '#86efac' : '#fca5a5',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {soloPendientes ? '⏳ Solo Pendientes' : '✅ Mostrar Todas'}
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
              {soloPendientes ? 'Cuentas Pendientes' : 'Todas las Cuentas'}
            </h2>
            <button
              onClick={cargarCuentas}
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
              <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>Error al cargar cuentas</h3>
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
              <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>Cargando cuentas...</h3>
            </div>
          ) : cuentasPorCobrar.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: '#94a3b8'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>
                {soloPendientes ? '✅' : '💰'}
              </div>
              <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>
                {soloPendientes ? '¡Excelente! No hay cuentas pendientes' : 'No hay cuentas registradas'}
              </h3>
              <p>
                {soloPendientes 
                  ? 'Todas las cuentas están al día' 
                  : 'Las cuentas se crean automáticamente al registrar ventas'
                }
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {cuentasPorCobrar.map((cuenta) => {
                const vencida = cuenta.fecha_vencimiento && cuenta.fecha_vencimiento < hoy && !cuenta.cobrado;
                
                return (
                  <div
                    key={cuenta.id}
                    style={{
                      background: vencida 
                        ? 'rgba(239, 68, 68, 0.1)' 
                        : cuenta.cobrado 
                        ? 'rgba(16, 185, 129, 0.05)' 
                        : 'rgba(16, 185, 129, 0.05)',
                      border: vencida 
                        ? '1px solid rgba(239, 68, 68, 0.4)' 
                        : cuenta.cobrado 
                        ? '1px solid rgba(16, 185, 129, 0.2)' 
                        : '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: '12px',
                      padding: '20px',
                      transition: 'all 0.3s ease'
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
                          {vencida && (
                            <span style={{
                              background: 'rgba(239, 68, 68, 0.3)',
                              color: '#fca5a5',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: '700'
                            }}>
                              VENCIDA
                            </span>
                          )}
                          <span style={{
                            background: cuenta.cobrado ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                            color: cuenta.cobrado ? '#86efac' : '#60a5fa',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            Venta #{cuenta.venta_id}
                          </span>
                        </div>
                        
                        <h4 style={{
                          color: 'white',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          margin: '0 0 8px 0'
                        }}>
                          {cuenta.cliente_name}
                        </h4>
                        
                        <div style={{
                          display: 'flex',
                          gap: '20px',
                          color: '#94a3b8',
                          fontSize: '0.9rem'
                        }}>
                          <span>📅 Registrado: {formatearFecha(cuenta.fecha_registro)}</span>
                          {cuenta.fecha_vencimiento && (
                            <span style={{ color: vencida ? '#ef4444' : '#94a3b8' }}>
                              ⏰ Vence: {formatearFecha(cuenta.fecha_vencimiento)}
                            </span>
                          )}
                          {cuenta.fecha_cobro && (
                            <span style={{ color: '#86efac' }}>
                              ✅ Cobrado: {formatearFecha(cuenta.fecha_cobro)}
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
                            Monto
                          </div>
                          <div style={{
                            color: cuenta.cobrado ? '#86efac' : '#10b981',
                            fontWeight: '700',
                            fontSize: '1.3rem'
                          }}>
                            {formatCurrency(cuenta.monto)}
                          </div>
                        </div>

                        {!cuenta.cobrado && (
                          <button
                            onClick={() => handleMarcarCobrado(cuenta.id)}
                            style={{
                              padding: '8px 16px',
                              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                              border: 'none',
                              borderRadius: '8px',
                              color: 'white',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            ✓ Marcar Cobrado
                          </button>
                        )}

                        {cuenta.cobrado && (
                          <div style={{
                            padding: '8px 16px',
                            background: 'rgba(16, 185, 129, 0.2)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: '8px',
                            color: '#86efac',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                          }}>
                            ✅ Cobrado
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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