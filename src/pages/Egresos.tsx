// src/pages/Egresos.tsx
import { useEffect, useState } from "react";

type TipoEgresoAPI = {
  id: number;
  name: string;
  descripcion?: string;
};

type EgresoAPI = {
  id: number;
  tipo_egreso_id: number;
  tipo_egreso_name?: string;
  monto: number;
  fecha: string;
  descripcion?: string;
  origen?: string;
  pagado?: boolean;
  fecha_pago?: string;
  created_at: string;
};

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function listarTiposEgreso(): Promise<TipoEgresoAPI[]> {
  const r = await fetch(`${BASE}/api/tipos-egreso`);
  if (!r.ok) throw new Error('Error al cargar tipos de egreso');
  return r.json();
}

async function crearTipoEgreso(data: { name: string; descripcion?: string }): Promise<{ id: number; message: string }> {
  const r = await fetch(`${BASE}/api/tipos-egreso`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Error al crear tipo de egreso');
  return r.json();
}

async function listarEgresos(filtros?: { desde?: string; hasta?: string }): Promise<EgresoAPI[]> {
  let url = `${BASE}/api/egresos`;
  const params = new URLSearchParams();
  
  if (filtros?.desde) params.append('desde', filtros.desde);
  if (filtros?.hasta) params.append('hasta', filtros.hasta);
  
  if (params.toString()) url += `?${params.toString()}`;
  
  const r = await fetch(url);
  if (!r.ok) throw new Error('Error al cargar egresos');
  return r.json();
}

async function crearEgreso(data: {
  tipo_egreso_id: number;
  monto: number;
  fecha: string;
  descripcion?: string;
  fecha_vencimiento?: string;
}): Promise<{ id: number; message: string }> {
  const r = await fetch(`${BASE}/api/egresos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Error al crear egreso');
  return r.json();
}

async function eliminarEgreso(id: number): Promise<{ message: string }> {
  const r = await fetch(`${BASE}/api/egresos/${id}`, {
    method: "DELETE",
  });
  if (!r.ok) throw new Error('Error al eliminar egreso');
  return r.json();
}

async function marcarEgresoPagado(id: number): Promise<{ message: string; fecha_pago: string }> {
  const r = await fetch(`${BASE}/api/egresos/${id}/pagar`, {
    method: "PUT",
  });
  if (!r.ok) throw new Error('Error al marcar como pagado');
  return r.json();
}

const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `S/ ${(num || 0).toFixed(2)}`;
};

const formatearFecha = (fecha: string) => {
  const [year, month, day] = fecha.split('-');
  return `${day}/${month}/${year}`;
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

// ==================== MODAL NUEVO TIPO EGRESO ====================
const ModalNuevoTipoEgreso = ({ onClose, onCreado }: { onClose: () => void; onCreado: () => void }) => {
  const [form, setForm] = useState({ name: '', descripcion: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    try {
      setLoading(true);
      await crearTipoEgreso(form);
      alert("✅ Tipo de egreso creado correctamente");
      onCreado();
      onClose();
    } catch (e: any) {
      alert(`❌ Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
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
        maxWidth: '500px',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px'
        }}>
          <h2 style={{ color: 'white', fontSize: '1.6rem', fontWeight: '700', margin: 0 }}>
            Nuevo Tipo de Egreso
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
              Nombre *
            </label>
            <input
              type="text"
              placeholder="Ej: Alquiler, Servicios, Salarios..."
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
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

          <div style={{ marginBottom: '25px' }}>
            <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
              Descripción (Opcional)
            </label>
            <textarea
              placeholder="Descripción del tipo de egreso..."
              value={form.descripcion}
              onChange={e => setForm({...form, descripcion: e.target.value})}
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

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
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
              disabled={loading}
              style={{
                padding: '10px 24px',
                background: loading ? 'rgba(239, 68, 68, 0.5)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Creando...' : 'Crear Tipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== MODAL NUEVO EGRESO ====================
const ModalNuevoEgreso = ({ onClose, onCreado }: { onClose: () => void; onCreado: () => void }) => {
  const [tiposEgreso, setTiposEgreso] = useState<TipoEgresoAPI[]>([]);
  const [form, setForm] = useState({
    tipo_egreso_id: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    fecha_vencimiento: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const data = await listarTiposEgreso();
        setTiposEgreso(data);
      } catch (e) {
        console.error("Error cargando tipos:", e);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.tipo_egreso_id || !form.monto || !form.fecha) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    if (parseFloat(form.monto) <= 0) {
      alert("El monto debe ser mayor a 0");
      return;
    }

    try {
      setLoading(true);
      await crearEgreso({
        tipo_egreso_id: parseInt(form.tipo_egreso_id),
        monto: parseFloat(form.monto),
        fecha: form.fecha,
        descripcion: form.descripcion || undefined,
        fecha_vencimiento: form.fecha_vencimiento || undefined
      });
      alert("✅ Egreso y cuenta por pagar creados correctamente");
      onCreado();
      onClose();
    } catch (e: any) {
      alert(`❌ Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
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
        maxWidth: '500px',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px'
        }}>
          <h2 style={{ color: 'white', fontSize: '1.6rem', fontWeight: '700', margin: 0 }}>
            Registrar Egreso
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            Cargando...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                Tipo de Egreso *
              </label>
              <select
                value={form.tipo_egreso_id}
                onChange={e => setForm({...form, tipo_egreso_id: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.07)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              >
                <option value="" style={{ background: '#1e293b', color: 'white' }}>Seleccionar tipo</option>
                {tiposEgreso.map(tipo => (
                  <option key={tipo.id} value={tipo.id} style={{ background: '#1e293b', color: 'white' }}>
                    {tipo.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                  Monto (S/) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={form.monto}
                  onChange={e => setForm({...form, monto: e.target.value})}
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
                <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                  Fecha de Registro *
                </label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={e => setForm({...form, fecha: e.target.value})}
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
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                Fecha de Vencimiento (Opcional)
              </label>
              <input
                type="date"
                value={form.fecha_vencimiento}
                onChange={e => setForm({...form, fecha_vencimiento: e.target.value})}
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

            <div style={{ marginBottom: '25px' }}>
              <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                Descripción (Opcional)
              </label>
              <textarea
                placeholder="Detalles adicionales..."
                value={form.descripcion}
                onChange={e => setForm({...form, descripcion: e.target.value})}
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

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
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
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  background: loading ? 'rgba(239, 68, 68, 0.5)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Registrando...' : 'Registrar Egreso'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ==================== COMPONENTE PRINCIPAL ====================
export default function Egresos() {
  const [egresos, setEgresos] = useState<EgresoAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarNuevoTipo, setMostrarNuevoTipo] = useState(false);
  const [mostrarNuevoEgreso, setMostrarNuevoEgreso] = useState(false);
  
  const [mesActual, setMesActual] = useState(new Date());
  const [filtroActivo, setFiltroActivo] = useState(true);

  async function cargarEgresos() {
    try {
      setLoading(true);
      setError(null);
      
      let filtros: { desde?: string; hasta?: string } = {};
      
      if (filtroActivo) {
        filtros.desde = obtenerPrimerDiaDelMes(mesActual);
        filtros.hasta = obtenerUltimoDiaDelMes(mesActual);
      }
      
      const data = await listarEgresos(filtros);
      setEgresos(data);
    } catch (e: any) {
      console.error("Error cargando egresos:", e);
      setError(e.message || "Error al cargar egresos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarEgresos();
  }, [mesActual, filtroActivo]);

  const handleMarcarPagado = async (egresoId: number) => {
    if (!confirm("¿Marcar este egreso como pagado?")) {
      return;
    }

    try {
      await marcarEgresoPagado(egresoId);
      alert("✅ Egreso marcado como pagado");
      cargarEgresos();
    } catch (e: any) {
      alert(`❌ Error: ${e.message}`);
    }
  };

  const handleEliminar = async (egresoId: number) => {
    if (!confirm("¿Estás seguro de eliminar este egreso y su cuenta por pagar asociada?")) {
      return;
    }

    try {
      await eliminarEgreso(egresoId);
      alert("✅ Egreso eliminado correctamente");
      cargarEgresos();
    } catch (e: any) {
      alert(`❌ Error: ${e.message}`);
    }
  };

  const totalEgresos = egresos.reduce((sum, e) => sum + e.monto, 0);

  return (
    <div style={{
      padding: '40px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      position: 'relative'
    }}>
      
      {/* Modales */}
      {mostrarNuevoTipo && (
        <ModalNuevoTipoEgreso 
          onClose={() => setMostrarNuevoTipo(false)} 
          onCreado={cargarEgresos}
        />
      )}

      {mostrarNuevoEgreso && (
        <ModalNuevoEgreso 
          onClose={() => setMostrarNuevoEgreso(false)} 
          onCreado={cargarEgresos}
        />
      )}

      {/* Efectos de fondo */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)',
        borderRadius: '50%'
      }}></div>

      <div style={{
        maxWidth: '1400px',
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
              fontSize: '3rem',
              fontWeight: '800',
              margin: '0 0 8px 0',
              background: 'linear-gradient(135deg, #fff 0%, #ef4444 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Gestión de Egresos
            </h1>
            <p style={{
              color: '#94a3b8',
              fontSize: '1.1rem',
              margin: 0
            }}>
              Registro y control de egresos del negocio
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setMostrarNuevoTipo(true)}
              style={{
                padding: '12px 20px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                color: '#ef4444',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🏷️ Nuevo Tipo
            </button>
            
            <button
              onClick={() => setMostrarNuevoEgreso(true)}
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
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
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
              }}
            >
              <span style={{ fontSize: '1.3rem' }}>💸</span>
              Registrar Egreso
            </button>
          </div>
        </div>

        {/* Estadísticas */}
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
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💸</div>
            <div style={{ color: '#ef4444', fontSize: '1.8rem', fontWeight: '700' }}>
              {formatCurrency(totalEgresos)}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              {filtroActivo ? `Total del mes` : 'Total Histórico'}
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
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📋</div>
            <div style={{ color: 'white', fontSize: '1.8rem', fontWeight: '700' }}>
              {egresos.length}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Egresos Registrados</div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '25px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📊</div>
            <div style={{ color: 'white', fontSize: '1.8rem', fontWeight: '700' }}>
              {egresos.length > 0 ? formatCurrency(totalEgresos / egresos.length) : 'S/ 0.00'}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Promedio por Egreso</div>
          </div>
        </div>

        {/* Selector de Mes */}
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
                {filtroActivo ? 'Viendo egresos de:' : 'Mostrando todos los egresos'}
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
          </div>
        </div>

        {/* Lista de Egresos */}
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
              Historial de Egresos
            </h2>
            <button
              onClick={cargarEgresos}
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
              <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>Error al cargar egresos</h3>
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
                borderTop: '4px solid #ef4444',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '20px'
              }}></div>
              <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>Cargando egresos...</h3>
            </div>
          ) : egresos.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: '#94a3b8'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>💸</div>
              <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>No hay egresos registrados</h3>
              <p>
                {filtroActivo 
                  ? 'No se encontraron egresos en este mes' 
                  : 'Comienza registrando tu primer egreso'
                }
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {egresos.map((egreso) => (
                <div
                  key={egreso.id}
                  style={{
                    background: egreso.pagado 
                      ? 'rgba(16, 185, 129, 0.05)' 
                      : 'rgba(255, 255, 255, 0.03)',
                    border: egreso.pagado 
                      ? '1px solid rgba(16, 185, 129, 0.2)' 
                      : '1px solid rgba(255, 255, 255, 0.1)',
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
                      <h4 style={{
                        color: 'white',
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        margin: '0 0 8px 0'
                      }}>
                        {egreso.descripcion || egreso.tipo_egreso_name || 'Sin descripción'}
                      </h4>
                      
                      <div style={{
                        display: 'flex',
                        gap: '20px',
                        color: '#94a3b8',
                        fontSize: '0.9rem',
                        marginBottom: '4px'
                      }}>
                        <span>📅 Fecha: {formatearFecha(egreso.fecha)}</span>
                        {egreso.fecha_pago && (
                          <span style={{ color: '#86efac' }}>
                            ✅ Fecha de pago: {formatearFecha(egreso.fecha_pago)}
                          </span>
                        )}
                      </div>

                      {egreso.origen === 'pedido_proveedor' && (
                        <div style={{
                          display: 'inline-block',
                          background: 'rgba(245, 158, 11, 0.2)',
                          color: '#fbbf24',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          marginTop: '8px'
                        }}>
                          📦 Pedido automático
                        </div>
                      )}
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
                          color: egreso.pagado ? '#86efac' : '#ef4444',
                          fontWeight: '700',
                          fontSize: '1.5rem'
                        }}>
                          {formatCurrency(egreso.monto)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {!egreso.pagado && (
                          <button
                            onClick={() => handleMarcarPagado(egreso.id)}
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
                            ✓ Pagado
                          </button>
                        )}

                        {egreso.pagado && (
                          <div style={{
                            padding: '8px 16px',
                            background: 'rgba(16, 185, 129, 0.2)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: '8px',
                            color: '#86efac',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                          }}>
                            ✅ Pagado
                          </div>
                        )}

                        <button
                          onClick={() => handleEliminar(egreso.id)}
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
                          🗑️ Eliminar
                        </button>
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