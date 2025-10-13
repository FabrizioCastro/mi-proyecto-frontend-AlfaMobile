// src/pages/Marcas.tsx - VERSIÓN CON APIs REALES
import React, { useEffect, useState } from "react";
import { listarMarcas, crearMarca } from "../api";

type Marca = {
  id: number;
  name: string;
  descripcion?: string;
  activo: boolean;
};

export default function Marcas() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [form, setForm] = useState({ name: "", descripcion: "" });
  const [msg, setMsg] = useState<string | null>(null);

  // Cargar marcas desde la API
  useEffect(() => {
    async function cargarMarcas() {
      try {
        setLoading(true);
        const data = await listarMarcas();
        setMarcas(data);
      } catch (error) {
        console.error("Error cargando marcas:", error);
        setMsg("❌ Error al cargar las marcas");
      } finally {
        setLoading(false);
      }
    }
    cargarMarcas();
  }, []);

  // Crear nueva marca
  const handleCrearMarca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setMsg("❌ El nombre es obligatorio");
      return;
    }

    try {
      setMsg(null);
      await crearMarca({
        name: form.name.trim(),
        descripcion: form.descripcion.trim() || undefined,
      });

      setMsg("✅ Marca creada correctamente");
      
      // Limpiar formulario
      setForm({ name: "", descripcion: "" });
      setMostrarFormulario(false);
      
      // Recargar lista
      const data = await listarMarcas();
      setMarcas(data);
    } catch (error: any) {
      setMsg(`❌ Error: ${error.message || error}`);
    }
  };

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
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
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
              background: 'linear-gradient(135deg, #fff 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Gestión de Marcas
            </h1>
            <p style={{
              color: '#94a3b8',
              fontSize: '1.1rem',
              margin: 0
            }}>
              Catálogo global de marcas disponibles para todos los proveedores
            </p>
          </div>

          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span>➕</span>
            Nueva Marca
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

        {/* Formulario para Nueva Marca */}
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
              Crear Nueva Marca
            </h3>
            
            <form onSubmit={handleCrearMarca}>
              <div style={{
                display: 'grid',
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
                    Nombre de la Marca *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Samsung, Apple, Xiaomi..."
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
                    Descripción (opcional)
                  </label>
                  <textarea
                    placeholder="Breve descripción de la marca..."
                    value={form.descripcion}
                    onChange={(e) => setForm({...form, descripcion: e.target.value})}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit'
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
                    background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Crear Marca
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Marcas */}
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
            Catálogo de Marcas ({marcas.length})
          </h3>

          {loading ? (
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
                borderTop: '2px solid #8b5cf6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <div style={{ marginTop: '12px' }}>Cargando marcas...</div>
            </div>
          ) : marcas.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94a3b8'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏷️</div>
              <div>No hay marcas registradas</div>
              <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                Comienza creando tu primera marca
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '16px'
            }}>
              {marcas.map((marca) => (
                <div
                  key={marca.id}
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
                    <div>
                      <h4 style={{
                        color: 'white',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        margin: '0 0 8px 0'
                      }}>
                        {marca.name}
                      </h4>
                      {marca.descripcion && (
                        <p style={{
                          color: '#94a3b8',
                          margin: 0,
                          fontSize: '0.9rem'
                        }}>
                          {marca.descripcion}
                        </p>
                      )}
                      <div style={{
                        marginTop: '8px'
                      }}>
                        <span style={{
                          background: marca.activo 
                            ? 'rgba(34, 197, 94, 0.2)' 
                            : 'rgba(239, 68, 68, 0.2)',
                          color: marca.activo ? '#86efac' : '#fca5a5',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}>
                          {marca.activo ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </div>
                    <div style={{
                      color: '#8b5cf6',
                      fontSize: '24px',
                      fontWeight: 'bold'
                    }}>
                      🏷️
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