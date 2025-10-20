import { useState } from "react";

type ResultadoVentas = {
  total_ventas: number;
  cantidad_ventas: number;
  ticket_promedio: number;
};

type ComparativoVentasResponse = {
  periodo1: {
    label: string;
    datos: ResultadoVentas;
  };
  periodo2: {
    label: string;
    datos: ResultadoVentas;
  };
  diferencia: {
    total_ventas: number;
    cantidad_ventas: number;
    ticket_promedio: number;
  };
};

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function compararVentas(
  fecha1_desde: string,
  fecha1_hasta: string,
  fecha2_desde: string,
  fecha2_hasta: string
): Promise<ComparativoVentasResponse> {
  const url = `${BASE}/api/comparar-ventas?fecha1_desde=${fecha1_desde}&fecha1_hasta=${fecha1_hasta}&fecha2_desde=${fecha2_desde}&fecha2_hasta=${fecha2_hasta}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('Error al comparar ventas');
  return r.json();
}

const formatCurrency = (value: number) => {
  const absValue = Math.abs(value);
  return `S/ ${absValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

const formatearFecha = (fecha: string) => {
  const [year, month, day] = fecha.split('-');
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${parseInt(day)} ${meses[parseInt(month) - 1]} ${year}`;
};

const obtenerNombreMes = (fecha: string) => {
  const [year, month] = fecha.split('-');
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${meses[parseInt(month) - 1]} ${year}`;
};

const evaluarRendimientoVentas = (cantidad: number): { texto: string; color: string; emoji: string } => {
  if (cantidad >= 100) return { texto: 'Excelente', color: '#10b981', emoji: '🚀' };
  if (cantidad >= 50) return { texto: 'Muy Bueno', color: '#22c55e', emoji: '✨' };
  if (cantidad >= 25) return { texto: 'Bueno', color: '#84cc16', emoji: '👍' };
  if (cantidad >= 10) return { texto: 'Regular', color: '#eab308', emoji: '⚠️' };
  if (cantidad >= 1) return { texto: 'Bajo', color: '#f59e0b', emoji: '📉' };
  return { texto: 'Sin Ventas', color: '#ef4444', emoji: '🔴' };
};

export default function ComparativoVentas() {
  const [modo, setModo] = useState<'comparar' | 'analizar'>('comparar');
  const [tipoComparacion, setTipoComparacion] = useState<'dia' | 'mes' | 'año' | 'rango'>('mes');
  const [datos, setDatos] = useState<ComparativoVentasResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const [periodo1Desde, setPeriodo1Desde] = useState('');
  const [periodo1Hasta, setPeriodo1Hasta] = useState('');
  const [periodo2Desde, setPeriodo2Desde] = useState('');
  const [periodo2Hasta, setPeriodo2Hasta] = useState('');

  const handleModoChange = (nuevoModo: typeof modo) => {
    setModo(nuevoModo);
    setDatos(null);
    setPeriodo1Desde('');
    setPeriodo1Hasta('');
    setPeriodo2Desde('');
    setPeriodo2Hasta('');
  };

  const handleTipoChange = (nuevoTipo: typeof tipoComparacion) => {
    setTipoComparacion(nuevoTipo);
    setDatos(null);
    setPeriodo1Desde('');
    setPeriodo1Hasta('');
    setPeriodo2Desde('');
    setPeriodo2Hasta('');
  };

  const handleComparar = async () => {
    if (modo === 'comparar') {
      if (!periodo1Desde || !periodo1Hasta || !periodo2Desde || !periodo2Hasta) {
        alert('Por favor selecciona ambos periodos');
        return;
      }
    } else {
      if (!periodo1Desde || !periodo1Hasta) {
        alert('Por favor selecciona el periodo a analizar');
        return;
      }
    }

    try {
      setLoading(true);
      const resultado = await compararVentas(
        periodo1Desde, 
        periodo1Hasta, 
        periodo2Desde || periodo1Desde, 
        periodo2Hasta || periodo1Hasta
      );
      setDatos(resultado);
    } catch (e) {
      console.error('Error:', e);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };
  const handleSeleccionDia1 = (fecha: string) => {
    setPeriodo1Desde(fecha);
    setPeriodo1Hasta(fecha);
  };

  const handleSeleccionDia2 = (fecha: string) => {
    setPeriodo2Desde(fecha);
    setPeriodo2Hasta(fecha);
  };

  const handleSeleccionMes1 = (fecha: string) => {
    const [year, month] = fecha.split('-');
    const primerDia = `${year}-${month}-01`;
    const ultimoDia = new Date(parseInt(year), parseInt(month), 0).getDate();
    setPeriodo1Desde(primerDia);
    setPeriodo1Hasta(`${year}-${month}-${ultimoDia}`);
  };

  const handleSeleccionMes2 = (fecha: string) => {
    const [year, month] = fecha.split('-');
    const primerDia = `${year}-${month}-01`;
    const ultimoDia = new Date(parseInt(year), parseInt(month), 0).getDate();
    setPeriodo2Desde(primerDia);
    setPeriodo2Hasta(`${year}-${month}-${ultimoDia}`);
  };

  const handleSeleccionAño1 = (año: string) => {
    setPeriodo1Desde(`${año}-01-01`);
    setPeriodo1Hasta(`${año}-12-31`);
  };

  const handleSeleccionAño2 = (año: string) => {
    setPeriodo2Desde(`${año}-01-01`);
    setPeriodo2Hasta(`${año}-12-31`);
  };

  const maxValor = datos ? Math.max(
    datos.periodo1.datos.total_ventas,
    datos.periodo2.datos.total_ventas
  ) : 100;

  const maxCantidad = datos ? Math.max(
    datos.periodo1.datos.cantidad_ventas,
    datos.periodo2.datos.cantidad_ventas
  ) : 100;

  const datosAnalisis = modo === 'analizar' && datos ? datos.periodo1.datos : null;
  const rendimiento = datosAnalisis ? evaluarRendimientoVentas(datosAnalisis.cantidad_ventas) : null;

  return (
    <div style={{
      padding: '40px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            color: 'white',
            fontSize: '3rem',
            fontWeight: '800',
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {modo === 'comparar' ? 'Comparar Ventas' : 'Analizar Ventas'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0 }}>
            {modo === 'comparar' 
              ? 'Compara tus ventas entre dos periodos'
              : 'Analiza el rendimiento de ventas de un periodo específico'
            }
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '25px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '15px', fontWeight: '600' }}>
            ¿Qué quieres hacer?
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <button
              onClick={() => handleModoChange('comparar')}
              style={{
                padding: '20px',
                background: modo === 'comparar' 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: modo === 'comparar' 
                  ? '2px solid #3b82f6'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚖️</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px' }}>
                Comparar Periodos
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Compara dos periodos para ver la diferencia
              </div>
            </button>

            <button
              onClick={() => handleModoChange('analizar')}
              style={{
                padding: '20px',
                background: modo === 'analizar' 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: modo === 'analizar' 
                  ? '2px solid #10b981'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📊</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px' }}>
                Analizar un Periodo
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Ve qué tan bien vendiste en un periodo específico
              </div>
            </button>
          </div>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '25px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '15px', fontWeight: '600' }}>
            {modo === 'comparar' ? '¿Qué quieres comparar?' : 'Tipo de periodo'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {[
              { value: 'dia', label: modo === 'comparar' ? '📅 Día vs Día' : '📅 Un Día', desc: modo === 'comparar' ? 'Compara dos días específicos' : 'Analiza un día específico' },
              { value: 'mes', label: modo === 'comparar' ? '📆 Mes vs Mes' : '📆 Un Mes', desc: modo === 'comparar' ? 'Compara dos meses completos' : 'Analiza un mes completo' },
              { value: 'año', label: modo === 'comparar' ? '🗓️ Año vs Año' : '🗓️ Un Año', desc: modo === 'comparar' ? 'Compara dos años completos' : 'Analiza un año completo' },
              { value: 'rango', label: '📊 Rango Personalizado', desc: modo === 'comparar' ? 'Define tus propios periodos' : 'Define tu propio periodo' }
            ].map(opcion => (
              <button
                key={opcion.value}
                onClick={() => handleTipoChange(opcion.value as any)}
                style={{
                  padding: '15px',
                  background: tipoComparacion === opcion.value 
                    ? modo === 'comparar'
                      ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: tipoComparacion === opcion.value 
                    ? modo === 'comparar'
                      ? '2px solid #3b82f6'
                      : '2px solid #10b981'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>
                  {opcion.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {opcion.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '25px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '30px'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: modo === 'comparar' ? '1fr 1fr' : '1fr', 
            gap: '30px' 
          }}>

            <div>
              <h3 style={{ 
                color: modo === 'comparar' ? '#10b981' : '#10b981', 
                fontSize: '1.1rem', 
                marginBottom: '15px', 
                fontWeight: '600' 
              }}>
                {modo === 'comparar' ? 'Periodo 1' : 'Periodo a Analizar'}
              </h3>
              
              {tipoComparacion === 'dia' && (
                <div>
                  <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                    Selecciona un día
                  </label>
                  <input
                    type="date"
                    onChange={e => handleSeleccionDia1(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                  {periodo1Desde && (
                    <div style={{ color: '#86efac', marginTop: '8px', fontSize: '0.85rem' }}>
                      ✓ {formatearFecha(periodo1Desde)}
                    </div>
                  )}
                </div>
              )}

              {tipoComparacion === 'mes' && (
                <div>
                  <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                    Selecciona un mes
                  </label>
                  <input
                    type="month"
                    onChange={e => handleSeleccionMes1(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                  {periodo1Desde && (
                    <div style={{ color: '#86efac', marginTop: '8px', fontSize: '0.85rem' }}>
                      ✓ {obtenerNombreMes(periodo1Desde)}
                    </div>
                  )}
                </div>
              )}

              {tipoComparacion === 'año' && (
                <div>
                  <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                    Selecciona un año
                  </label>
                  <select
                    onChange={e => handleSeleccionAño1(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="" style={{ background: '#1e293b' }}>Seleccionar...</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(año => (
                      <option key={año} value={año} style={{ background: '#1e293b' }}>{año}</option>
                    ))}
                  </select>
                  {periodo1Desde && (
                    <div style={{ color: '#86efac', marginTop: '8px', fontSize: '0.85rem' }}>
                      ✓ Año {periodo1Desde.split('-')[0]}
                    </div>
                  )}
                </div>
              )}

              {tipoComparacion === 'rango' && (
                <div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                      Desde
                    </label>
                    <input
                      type="date"
                      value={periodo1Desde}
                      onChange={e => setPeriodo1Desde(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.07)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                      Hasta
                    </label>
                    <input
                      type="date"
                      value={periodo1Hasta}
                      onChange={e => setPeriodo1Hasta(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.07)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            {modo === 'comparar' && (
              <div>
                <h3 style={{ color: '#3b82f6', fontSize: '1.1rem', marginBottom: '15px', fontWeight: '600' }}>
                  Periodo 2
                </h3>
                
                {tipoComparacion === 'dia' && (
                  <div>
                    <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                      Selecciona un día
                    </label>
                    <input
                      type="date"
                      onChange={e => handleSeleccionDia2(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.07)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                    {periodo2Desde && (
                      <div style={{ color: '#93c5fd', marginTop: '8px', fontSize: '0.85rem' }}>
                        ✓ {formatearFecha(periodo2Desde)}
                      </div>
                    )}
                  </div>
                )}

                {tipoComparacion === 'mes' && (
                  <div>
                    <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                      Selecciona un mes
                    </label>
                    <input
                      type="month"
                      onChange={e => handleSeleccionMes2(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.07)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                    {periodo2Desde && (
                      <div style={{ color: '#93c5fd', marginTop: '8px', fontSize: '0.85rem' }}>
                        ✓ {obtenerNombreMes(periodo2Desde)}
                      </div>
                    )}
                  </div>
                )}

                {tipoComparacion === 'año' && (
                  <div>
                    <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                      Selecciona un año
                    </label>
                    <select
                      onChange={e => handleSeleccionAño2(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.07)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="" style={{ background: '#1e293b' }}>Seleccionar...</option>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(año => (
                        <option key={año} value={año} style={{ background: '#1e293b' }}>{año}</option>
                      ))}
                    </select>
                    {periodo2Desde && (
                      <div style={{ color: '#93c5fd', marginTop: '8px', fontSize: '0.85rem' }}>
                        ✓ Año {periodo2Desde.split('-')[0]}
                      </div>
                    )}
                  </div>
                )}

                {tipoComparacion === 'rango' && (
                  <div>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                        Desde
                      </label>
                      <input
                        type="date"
                        value={periodo2Desde}
                        onChange={e => setPeriodo2Desde(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.07)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                        Hasta
                      </label>
                      <input
                        type="date"
                        value={periodo2Hasta}
                        onChange={e => setPeriodo2Hasta(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.07)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleComparar}
            disabled={loading || !periodo1Desde}
            style={{
              marginTop: '25px',
              width: '100%',
              padding: '15px',
              background: loading || !periodo1Desde
                ? 'rgba(59, 130, 246, 0.3)'
                : modo === 'comparar'
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: loading || !periodo1Desde ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {loading 
              ? '⏳ Cargando...' 
              : modo === 'comparar' 
                ? '🔍 Comparar Ventas' 
                : '📊 Analizar Ventas'
            }
          </button>
        </div>

        {modo === 'analizar' && datos && datosAnalisis && rendimiento && (
          <>
            <div style={{
              background: `linear-gradient(135deg, ${rendimiento.color}22 0%, ${rendimiento.color}11 100%)`,
              borderRadius: '16px',
              padding: '40px',
              border: `2px solid ${rendimiento.color}44`,
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '15px' }}>
                {rendimiento.emoji}
              </div>
              <h2 style={{
                color: 'white',
                fontSize: '2rem',
                fontWeight: '700',
                marginBottom: '10px'
              }}>
                Ventas {rendimiento.texto}
              </h2>
              <p style={{
                color: rendimiento.color,
                fontSize: '3rem',
                fontWeight: '800',
                margin: '15px 0'
              }}>
                {datosAnalisis.cantidad_ventas} ventas
              </p>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6' }}>
                En <strong style={{ color: 'white' }}>{datos.periodo1.label}</strong> vendiste{' '}
                <strong style={{ color: rendimiento.color }}>
                  {formatCurrency(datosAnalisis.total_ventas)}
                </strong>
                {' '}con un ticket promedio de {formatCurrency(datosAnalisis.ticket_promedio)}
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '30px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '30px'
            }}>
              <h3 style={{ color: 'white', fontSize: '1.3rem', fontWeight: '700', marginBottom: '25px' }}>
                Métricas de Ventas
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '12px',
                  padding: '25px',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <div style={{ color: '#86efac', fontSize: '0.9rem', marginBottom: '8px', fontWeight: '600' }}>
                    💰 Total Vendido
                  </div>
                  <div style={{ color: '#10b981', fontSize: '2.2rem', fontWeight: '800', marginBottom: '5px' }}>
                    {formatCurrency(datosAnalisis.total_ventas)}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    Ingresos totales del periodo
                  </div>
                </div>

                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '12px',
                  padding: '25px',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <div style={{ color: '#93c5fd', fontSize: '0.9rem', marginBottom: '8px', fontWeight: '600' }}>
                    🛒 Cantidad de Ventas
                  </div>
                  <div style={{ color: '#3b82f6', fontSize: '2.2rem', fontWeight: '800', marginBottom: '5px' }}>
                    {datosAnalisis.cantidad_ventas}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    Transacciones realizadas
                  </div>
                </div>

                <div style={{
                  background: 'rgba(168, 85, 247, 0.1)',
                  borderRadius: '12px',
                  padding: '25px',
                  border: '1px solid rgba(168, 85, 247, 0.3)'
                }}>
                  <div style={{ color: '#c4b5fd', fontSize: '0.9rem', marginBottom: '8px', fontWeight: '600' }}>
                    📈 Ticket Promedio
                  </div>
                  <div style={{ color: '#a855f7', fontSize: '2.2rem', fontWeight: '800', marginBottom: '5px' }}>
                    {formatCurrency(datosAnalisis.ticket_promedio)}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    Promedio por venta
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '30px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ color: 'white', fontSize: '1.3rem', fontWeight: '700', marginBottom: '30px' }}>
                Visualización de Ventas
              </h3>

              <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div style={{ marginBottom: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: '600' }}>Total Vendido</span>
                    <span style={{ color: '#10b981', fontWeight: '700', fontSize: '1.3rem' }}>
                      {formatCurrency(datosAnalisis.total_ventas)}
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '50px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '20px',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '1.1rem'
                    }}>
                      {datosAnalisis.cantidad_ventas} ventas
                    </div>
                  </div>
                </div>

                <div style={{ 
                  background: 'rgba(168, 85, 247, 0.1)',
                  borderRadius: '12px',
                  padding: '25px',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#c4b5fd', fontSize: '0.9rem', marginBottom: '10px' }}>
                    Promedio de venta
                  </div>
                  <div style={{ color: '#a855f7', fontSize: '2.5rem', fontWeight: '800' }}>
                    {formatCurrency(datosAnalisis.ticket_promedio)}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '10px' }}>
                    {datosAnalisis.total_ventas > 0 && datosAnalisis.cantidad_ventas > 0
                      ? `Cada venta generó en promedio ${formatCurrency(datosAnalisis.ticket_promedio)}`
                      : 'Sin ventas en este periodo'
                    }
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {modo === 'comparar' && datos && (
          <>
            <div style={{
              background: datos.diferencia.total_ventas >= 0
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
              borderRadius: '16px',
              padding: '30px',
              border: datos.diferencia.total_ventas >= 0
                ? '2px solid rgba(16, 185, 129, 0.3)'
                : '2px solid rgba(239, 68, 68, 0.3)',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>
                {datos.diferencia.total_ventas >= 0 ? '🎉' : '📉'}
              </div>
              <h2 style={{
                color: 'white',
                fontSize: '1.8rem',
                fontWeight: '700',
                marginBottom: '15px'
              }}>
                {datos.diferencia.total_ventas >= 0 ? '¡Vendiste Más!' : 'Vendiste Menos'}
              </h2>
              <p style={{
                color: datos.diferencia.total_ventas >= 0 ? '#86efac' : '#ef4444',
                fontSize: '2.5rem',
                fontWeight: '800',
                margin: '10px 0'
              }}>
                {datos.diferencia.total_ventas >= 0 ? '+' : ''}{formatCurrency(datos.diferencia.total_ventas)}
              </p>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6' }}>
                En <strong style={{ color: 'white' }}>{datos.periodo2.label}</strong> vendiste{' '}
                <strong style={{ color: datos.diferencia.total_ventas >= 0 ? '#86efac' : '#ef4444' }}>
                  {formatCurrency(Math.abs(datos.diferencia.total_ventas))} {datos.diferencia.total_ventas >= 0 ? 'más' : 'menos'}
                </strong>{' '}
                que en <strong style={{ color: 'white' }}>{datos.periodo1.label}</strong>
                {datos.diferencia.cantidad_ventas !== 0 && (
                  <span>
                    {' '}({Math.abs(datos.diferencia.cantidad_ventas)} ventas {datos.diferencia.cantidad_ventas >= 0 ? 'más' : 'menos'})
                  </span>
                )}
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '30px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '30px'
            }}>
              <h3 style={{ color: 'white', fontSize: '1.3rem', fontWeight: '700', marginBottom: '30px' }}>
                Comparación Visual
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                <div>
                  <h4 style={{ color: '#10b981', fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px', textAlign: 'center' }}>
                    {datos.periodo1.label}
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Total Vendido</span>
                        <span style={{ color: '#86efac', fontWeight: '700' }}>{formatCurrency(datos.periodo1.datos.total_ventas)}</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '35px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(datos.periodo1.datos.total_ventas / maxValor) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                          borderRadius: '8px',
                          transition: 'width 0.5s ease'
                        }}></div>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Cantidad de Ventas</span>
                        <span style={{ color: '#93c5fd', fontWeight: '700' }}>{datos.periodo1.datos.cantidad_ventas}</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '35px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(datos.periodo1.datos.cantidad_ventas / maxCantidad) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                          borderRadius: '8px',
                          transition: 'width 0.5s ease'
                        }}></div>
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(168, 85, 247, 0.1)',
                      borderRadius: '12px',
                      padding: '20px',
                      marginTop: '10px',
                      textAlign: 'center',
                      border: '1px solid rgba(168, 85, 247, 0.3)'
                    }}>
                      <div style={{ color: '#c4b5fd', fontSize: '0.85rem', marginBottom: '5px' }}>Ticket Promedio</div>
                      <div style={{
                        color: '#a855f7',
                        fontSize: '1.8rem',
                        fontWeight: '800'
                      }}>
                        {formatCurrency(datos.periodo1.datos.ticket_promedio)}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ color: '#3b82f6', fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px', textAlign: 'center' }}>
                    {datos.periodo2.label}
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Total Vendido</span>
                        <span style={{ color: '#86efac', fontWeight: '700' }}>{formatCurrency(datos.periodo2.datos.total_ventas)}</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '35px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(datos.periodo2.datos.total_ventas / maxValor) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                          borderRadius: '8px',
                          transition: 'width 0.5s ease'
                        }}></div>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Cantidad de Ventas</span>
                        <span style={{ color: '#93c5fd', fontWeight: '700' }}>{datos.periodo2.datos.cantidad_ventas}</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '35px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(datos.periodo2.datos.cantidad_ventas / maxCantidad) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                          borderRadius: '8px',
                          transition: 'width 0.5s ease'
                        }}></div>
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(168, 85, 247, 0.1)',
                      borderRadius: '12px',
                      padding: '20px',
                      marginTop: '10px',
                      textAlign: 'center',
                      border: '1px solid rgba(168, 85, 247, 0.3)'
                    }}>
                      <div style={{ color: '#c4b5fd', fontSize: '0.85rem', marginBottom: '5px' }}>Ticket Promedio</div>
                      <div style={{
                        color: '#a855f7',
                        fontSize: '1.8rem',
                        fontWeight: '800'
                      }}>
                        {formatCurrency(datos.periodo2.datos.ticket_promedio)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '30px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ color: 'white', fontSize: '1.3rem', fontWeight: '700', marginBottom: '20px' }}>
                Análisis de Diferencias
              </h3>

              <div style={{ display: 'grid', gap: '15px' }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>
                      Diferencia en Total Vendido
                    </div>
                    <div style={{ color: 'white', fontSize: '0.85rem' }}>
                      {datos.periodo1.label}: {formatCurrency(datos.periodo1.datos.total_ventas)} → {datos.periodo2.label}: {formatCurrency(datos.periodo2.datos.total_ventas)}
                    </div>
                  </div>
                  <div style={{
                    color: datos.diferencia.total_ventas >= 0 ? '#86efac' : '#ef4444',
                    fontSize: '1.5rem',
                    fontWeight: '800'
                  }}>
                    {datos.diferencia.total_ventas >= 0 ? '+' : ''}{formatCurrency(datos.diferencia.total_ventas)}
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>
                      Diferencia en Cantidad de Ventas
                    </div>
                    <div style={{ color: 'white', fontSize: '0.85rem' }}>
                      {datos.periodo1.label}: {datos.periodo1.datos.cantidad_ventas} ventas → {datos.periodo2.label}: {datos.periodo2.datos.cantidad_ventas} ventas
                    </div>
                  </div>
                  <div style={{
                    color: datos.diferencia.cantidad_ventas >= 0 ? '#86efac' : '#ef4444',
                    fontSize: '1.5rem',
                    fontWeight: '800'
                  }}>
                    {datos.diferencia.cantidad_ventas >= 0 ? '+' : ''}{datos.diferencia.cantidad_ventas}
                  </div>
                </div>

                <div style={{
                  background: datos.diferencia.ticket_promedio >= 0 
                    ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: datos.diferencia.ticket_promedio >= 0
                    ? '1px solid rgba(168, 85, 247, 0.3)'
                    : '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>
                      Diferencia en Ticket Promedio
                    </div>
                    <div style={{ color: 'white', fontSize: '0.85rem' }}>
                      {datos.periodo1.label}: {formatCurrency(datos.periodo1.datos.ticket_promedio)} → {datos.periodo2.label}: {formatCurrency(datos.periodo2.datos.ticket_promedio)}
                    </div>
                  </div>
                  <div style={{
                    color: datos.diferencia.ticket_promedio >= 0 ? '#a855f7' : '#ef4444',
                    fontSize: '1.5rem',
                    fontWeight: '800'
                  }}>
                    {datos.diferencia.ticket_promedio >= 0 ? '+' : ''}{formatCurrency(datos.diferencia.ticket_promedio)}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}