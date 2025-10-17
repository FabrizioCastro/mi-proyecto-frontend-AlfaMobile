// src/components/AlertaCuentasPendientes.tsx
import { useEffect, useState } from "react";

type CuentaPendiente = {
  id: number;
  monto: number;
  descripcion?: string;
  tipo_egreso_name?: string;
  fecha_registro: string;
  fecha_vencimiento?: string;
  numero_pedido?: string;
  proveedor_name?: string;
};

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function obtenerCuentasPendientes(): Promise<CuentaPendiente[]> {
  const r = await fetch(`${BASE}/api/cuentas-por-pagar?pendientes=true`);
  if (!r.ok) return [];
  return r.json();
}

const formatCurrency = (value: number) => `S/ ${value.toFixed(2)}`;

export default function AlertaCuentasPendientes() {
  const [cuentas, setCuentas] = useState<CuentaPendiente[]>([]);
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
       

        const data = await obtenerCuentasPendientes();
        
        if (data.length > 0) {
          setCuentas(data);
          setMostrar(true);
        }
      } catch (e) {
        console.error("Error cargando alertas:", e);
      } finally {
        setLoading(false);
      }
    }
    
    // Esperar 1 segundo antes de mostrar para mejor UX
    const timer = setTimeout(cargar, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleCerrar = () => {
    
    setMostrar(false);
  };

  const totalPendiente = cuentas.reduce((sum, c) => sum + c.monto, 0);

  // Cuentas vencidas (si tienen fecha_vencimiento y ya pasó)
  const hoy = new Date().toISOString().split('T')[0];
  const cuentasVencidas = cuentas.filter(c => c.fecha_vencimiento && c.fecha_vencimiento < hoy);

  if (loading || !mostrar) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '24px',
        padding: '40px',
        width: '95%',
        maxWidth: '700px',
        maxHeight: '85vh',
        overflowY: 'auto',
        border: '2px solid rgba(239, 68, 68, 0.3)',
        boxShadow: '0 25px 50px rgba(239, 68, 68, 0.3)',
        animation: 'slideUp 0.4s ease'
      }}>
        
        {/* Header con ícono de alerta */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            animation: 'pulse 2s infinite'
          }}>
            ⚠️
          </div>
          
          <h2 style={{
            color: 'white',
            fontSize: '2rem',
            fontWeight: '800',
            margin: '0 0 10px 0'
          }}>
            Cuentas por Pagar Pendientes
          </h2>
          
          <p style={{
            color: '#94a3b8',
            fontSize: '1.1rem',
            margin: 0
          }}>
            Tienes {cuentas.length} cuenta{cuentas.length !== 1 ? 's' : ''} pendiente{cuentas.length !== 1 ? 's' : ''} de pago
          </p>
        </div>

        {/* Resumen Financiero */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '16px',
          padding: '25px',
          marginBottom: '25px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{
            color: '#94a3b8',
            fontSize: '0.9rem',
            marginBottom: '8px',
            fontWeight: '600'
          }}>
            Total Pendiente
          </div>
          <div style={{
            color: '#ef4444',
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '8px'
          }}>
            {formatCurrency(totalPendiente)}
          </div>
          {cuentasVencidas.length > 0 && (
            <div style={{
              color: '#fca5a5',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}>
              ⚠️ {cuentasVencidas.length} cuenta{cuentasVencidas.length !== 1 ? 's' : ''} vencida{cuentasVencidas.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Lista de Cuentas Pendientes (máximo 5) */}
        <div style={{
          marginBottom: '25px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '15px'
          }}>
            Detalle de Cuentas:
          </h3>
          
          {cuentas.slice(0, 5).map((cuenta, index) => {
            const vencida = cuenta.fecha_vencimiento && cuenta.fecha_vencimiento < hoy;
            
            return (
              <div
                key={cuenta.id}
                style={{
                  background: vencida 
                    ? 'rgba(239, 68, 68, 0.15)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  border: vencida 
                    ? '1px solid rgba(239, 68, 68, 0.4)' 
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '15px',
                  marginBottom: '10px'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px'
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
                        color: '#fbbf24',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {cuenta.tipo_egreso_name || 'Sin categoría'}
                      </span>
                    </div>
                    
                    {cuenta.descripcion && (
                      <div style={{
                        color: 'white',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        marginBottom: '4px'
                      }}>
                        {cuenta.descripcion}
                      </div>
                    )}
                    
                    {cuenta.numero_pedido && (
                      <div style={{
                        color: '#94a3b8',
                        fontSize: '0.8rem'
                      }}>
                        📦 {cuenta.numero_pedido}
                        {cuenta.proveedor_name && ` - ${cuenta.proveedor_name}`}
                      </div>
                    )}
                    
                    <div style={{
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      marginTop: '4px'
                    }}>
                      Registrado: {cuenta.fecha_registro}
                      {cuenta.fecha_vencimiento && ` • Vence: ${cuenta.fecha_vencimiento}`}
                    </div>
                  </div>
                  
                  <div style={{
                    color: vencida ? '#ef4444' : '#fca5a5',
                    fontSize: '1.3rem',
                    fontWeight: '700'
                  }}>
                    {formatCurrency(cuenta.monto)}
                  </div>
                </div>
              </div>
            );
          })}
          
          {cuentas.length > 5 && (
            <div style={{
              textAlign: 'center',
              padding: '10px',
              color: '#94a3b8',
              fontSize: '0.85rem'
            }}>
              + {cuentas.length - 5} cuenta{cuentas.length - 5 !== 1 ? 's' : ''} más...
            </div>
          )}
        </div>

        {/* Botones de Acción */}
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={handleCerrar}
            style={{
              flex: 1,
              padding: '14px 20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              color: '#cbd5e1',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            Recordar Mañana
          </button>
          
          <button
            onClick={() => {
              handleCerrar();
              window.location.href = '/cuentas-por-pagar';
            }}
            style={{
              flex: 1,
              padding: '14px 20px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
            }}
          >
            Ver Todas las Cuentas →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
        }
      `}</style>
    </div>
  );
}