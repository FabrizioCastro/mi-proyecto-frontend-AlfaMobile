// src/pages/Empleados.tsx
import React, { useEffect, useState } from "react";
import { crearEmpleado, listarPuestos, crearPuesto, actualizarEmpleado, eliminarEmpleado as eliminarEmpleadoAPI } from "../api";

type Empleado = {
  id: number;
  name: string;
  work_email?: string;
  work_phone?: string;
  department_name?: string;
  job_name?: string;
  job_id?: number;
  fecha_ingreso?: string;
  salario?: number;
  identification_id?: string;
  activo?: boolean;
};

type Puesto = {
  id: number;
  name: string;
};

export default function Empleados() {
  // ====== Estados ======
  const [items, setItems] = useState<Empleado[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPuestos, setLoadingPuestos] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoEmpleado, setEditandoEmpleado] = useState<Empleado | null>(null);
  const [mostrarModalPuesto, setMostrarModalPuesto] = useState(false);
  const [nuevoPuesto, setNuevoPuesto] = useState("");
  const [verEliminados, setVerEliminados] = useState(false);

  // Formulario de empleado
  const [form, setForm] = useState({
    name: "",
    work_email: "",
    work_phone: "",
    job_id: "",
    fecha_ingreso: "",
    salario: "",
    identification_id: ""
  });

  // ====== Cargar Datos ======
  async function cargarEmpleados() {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Cargando empleados...");
      
      const url = verEliminados 
        ? `http://localhost:3001/api/empleados?incluir_eliminados=true`
        : `http://localhost:3001/api/empleados`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al cargar empleados");
      const data = await response.json();
      
      console.log("✅ Empleados cargados:", data);
      setItems(data);
    } catch (e: any) {
      console.error("❌ Error cargando empleados:", e);
      setError(e.message || "Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  }

  async function cargarPuestos() {
    try {
      setLoadingPuestos(true);
      const data = await listarPuestos();
      setPuestos(data);
    } catch (e: any) {
      console.error("Error cargando puestos:", e);
    } finally {
      setLoadingPuestos(false);
    }
  }

  // Cargar datos iniciales
  useEffect(() => { 
    cargarEmpleados();
    cargarPuestos();
  }, []);

  // Recargar cuando cambie verEliminados
  useEffect(() => { 
    cargarEmpleados();
  }, [verEliminados]);

  // ====== Crear Empleado ======
  async function onCrear(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setMsg("❌ El nombre es obligatorio");
      return;
    }

    try {
      setMsg(null);
      
      const empleadoData: any = {
        name: form.name.trim(),
        work_email: form.work_email.trim(),
        work_phone: form.work_phone.trim(),
        job_id: form.job_id,
        identification_id: form.identification_id.trim(),
        fecha_ingreso: form.fecha_ingreso,
        salario: form.salario
      };

      console.log("📤 Enviando datos:", empleadoData);
      const response = await fetch('http://localhost:3001/api/empleados', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(empleadoData)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
    
    const result = await response.json();
    console.log("✅ Respuesta:", result);

    setMsg("✅ Empleado creado correctamente.");
      // Limpiar formulario
      setForm({
        name: "",
        work_email: "",
        work_phone: "",
        job_id: "",
        fecha_ingreso: "",
        salario: "",
        identification_id: ""
      });
      setMostrarFormulario(false);
      
      // Recargar lista
      await cargarEmpleados();
    } catch (e: any) {
      console.error("❌ Error creando empleado:", e);
      setMsg(`❌ Error: ${e.message || e}`);
    }
  }

  // ====== Actualizar Empleado ======
  async function onEditar(e: React.FormEvent) {
    e.preventDefault();
    if (!editandoEmpleado || !form.name.trim()) {
      setMsg("❌ El nombre es obligatorio");
      return;
    }

    try {
      setMsg(null);
      
      const updateData: any = {
        name: form.name.trim(),
        work_email: form.work_email.trim(),
        work_phone: form.work_phone.trim(),
        job_id: form.job_id,
        identification_id: form.identification_id.trim(),
        fecha_ingreso: form.fecha_ingreso,
        salario: form.salario
      };

      await actualizarEmpleado(editandoEmpleado.id, updateData);

      setMsg("✅ Empleado actualizado correctamente.");
      
      // Limpiar formulario
      setForm({
        name: "",
        work_email: "",
        work_phone: "",
        job_id: "",
        fecha_ingreso: "",
        salario: "",
        identification_id: ""
      });
      setMostrarFormulario(false);
      setEditandoEmpleado(null);
      
      // Recargar lista
      await cargarEmpleados();
    } catch (e: any) {
      console.error("❌ Error actualizando empleado:", e);
      setMsg(`❌ Error: ${e.message || e}`);
    }
  }

  // ====== Crear Nuevo Puesto ======
  async function crearNuevoPuesto() {
    if (!nuevoPuesto.trim()) {
      setMsg("❌ El nombre del puesto es obligatorio");
      return;
    }

    try {
      setMsg(null);
      await crearPuesto({ name: nuevoPuesto.trim() });
      
      // Recargar la lista de puestos
      await cargarPuestos();
      
      setMsg("✅ Puesto creado correctamente.");
      setNuevoPuesto("");
      setMostrarModalPuesto(false);
    } catch (e: any) {
      setMsg(`❌ Error creando puesto: ${e.message || e}`);
    }
  }

  // ====== Función para Editar ======
  const iniciarEdicion = (empleado: Empleado) => {
    setEditandoEmpleado(empleado);
    setForm({
      name: empleado.name,
      work_email: empleado.work_email || "",
      work_phone: empleado.work_phone || "",
      job_id: empleado.job_id?.toString() || "",
      fecha_ingreso: empleado.fecha_ingreso || "",
      salario: empleado.salario?.toString() || "",
      identification_id: empleado.identification_id || ""
    });
    setMostrarFormulario(true);
  };

  // ====== Función para Eliminar ======
  const eliminarEmpleado = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este empleado?")) {
      try {
        await eliminarEmpleadoAPI(id);
        setMsg("✅ Empleado eliminado correctamente.");
        await cargarEmpleados();
      } catch (e: any) {
        setMsg(`❌ Error al eliminar: ${e.message || e}`);
      }
    }
  };

  // ====== Función para Recuperar Empleado ======
  const recuperarEmpleado = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/empleados/${id}/recuperar`, {
        method: "PUT",
      });
      
      if (!response.ok) throw new Error("Error al recuperar empleado");
      
      setMsg("✅ Empleado recuperado correctamente");
      await cargarEmpleados();
    } catch (e: any) {
      setMsg(`❌ Error al recuperar: ${e.message || e}`);
    }
  };

  // Función de búsqueda
  const empleadosFiltrados = items.filter(empleado => 
    empleado.name?.toLowerCase().includes(q.toLowerCase()) ||
    empleado.work_email?.toLowerCase().includes(q.toLowerCase()) ||
    empleado.work_phone?.includes(q) ||
    empleado.department_name?.toLowerCase().includes(q.toLowerCase()) ||
    empleado.job_name?.toLowerCase().includes(q.toLowerCase()) ||
    empleado.identification_id?.includes(q)
  );

  return (
    <div style={{
      padding: '20px',
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
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}>
        
        {/* HEADER COMPACTO */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          {/* Título y Búsqueda */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            flex: 1
          }}>
            <h1 style={{
              color: 'white',
              fontSize: '1.8rem',
              fontWeight: '700',
              margin: 0,
              background: 'linear-gradient(135deg, #fff 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Gestión de Empleados {verEliminados && "(Eliminados)"}
            </h1>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              flex: 1,
              maxWidth: '400px'
            }}>
              <input
                type="text"
                placeholder="Buscar empleados..."
                value={q}
                onChange={e => setQ(e.target.value)}
                style={{
                  padding: '10px 16px',
                  background: 'rgba(255, 255, 255, 0.07)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                  width: '100%'
                }}
              />
            </div>
          </div>

          {/* Botones del lado derecho */}
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {/* BOTÓN VER ELIMINADOS */}
            <button
              onClick={() => setVerEliminados(!verEliminados)}
              style={{
                padding: '10px 20px',
                background: verEliminados 
                  ? 'rgba(245, 158, 11, 0.3)' 
                  : 'rgba(255, 255, 255, 0.1)',
                border: verEliminados 
                  ? '1px solid rgba(245, 158, 11, 0.5)' 
                  : '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: verEliminados ? '#fbbf24' : '#cbd5e1',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{verEliminados ? '👁️' : '🗑️'}</span>
              {verEliminados ? 'Ver Activos' : 'Ver Eliminados'}
            </button>

            {/* Botón Registrar Empleado - SOLO mostrar si no estamos viendo eliminados */}
            {!verEliminados && (
              <button
                onClick={() => {
                  setMostrarFormulario(!mostrarFormulario);
                  setEditandoEmpleado(null);
                  setForm({ 
                    name: "", 
                    work_email: "", 
                    work_phone: "", 
                    fecha_ingreso: "", 
                    job_id: "", 
                    salario: "",
                    identification_id: ""
                  });
                }}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>➕</span>
                {mostrarFormulario ? 'Cancelar' : 'Registrar Empleado'}
              </button>
            )}
          </div>
        </div>

        {/* Mensajes */}
        {msg && (
          <div style={{
            background: msg.includes('✅') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${msg.includes('✅') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: msg.includes('✅') ? '#86efac' : '#fca5a5',
            fontSize: '0.9rem'
          }}>
            {msg}
          </div>
        )}

        

        {/* FORMULARIO FLOTANTE */}
        {mostrarFormulario && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '25px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            marginBottom: '20px',
            maxWidth: '600px',
            marginLeft: 'auto',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{
              color: 'white',
              fontSize: '1.3rem',
              fontWeight: '600',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>{editandoEmpleado ? '✏️' : '👤'}</span>
              {editandoEmpleado ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
            </h3>
            
            <form onSubmit={editandoEmpleado ? onEditar : onCrear}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '20px'
              }}>
                {/* Nombre Completo */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '5px'
                  }}>
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    placeholder="Juan Pérez García"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>

                {/* DNI */}
                <div>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '5px'
                  }}>
                    DNI
                  </label>
                  <input
                    type="text"
                    placeholder="87654321"
                    value={form.identification_id}
                    onChange={e => setForm({ ...form, identification_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Puesto de Trabajo */}
                <div>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '5px'
                  }}>
                    Puesto de Trabajo
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select
  value={form.job_id}
  onChange={e => setForm({ ...form, job_id: e.target.value })}
  style={{
    flex: 1,
    padding: '12px 14px',
    background: 'rgba(255, 255, 255, 0.07)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer' // 👈 Agregué esto también
  }}
>
  <option value="" style={{ background: '#1e293b', color: 'white' }}>
    Seleccionar puesto
  </option>
  {puestos.map(puesto => (
    <option key={puesto.id} value={puesto.id} style={{ background: '#1e293b', color: 'white' }}>
      {puesto.name}
    </option>
  ))}
</select>
                    <button
                      type="button"
                      onClick={() => setMostrarModalPuesto(true)}
                      style={{
                        padding: '12px 14px',
                        background: 'rgba(34, 197, 94, 0.2)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '8px',
                        color: '#86efac',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      ➕ Nuevo
                    </button>
                  </div>
                </div>

                {/* Correo Electrónico */}
                <div>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '5px'
                  }}>
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="juan.perez@empresa.com"
                    value={form.work_email}
                    onChange={e => setForm({ ...form, work_email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '5px'
                  }}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    placeholder="+51 987 654 321"
                    value={form.work_phone}
                    onChange={e => setForm({ ...form, work_phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Fecha de Ingreso */}
                <div>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '5px'
                  }}>
                    Fecha de Ingreso
                  </label>
                  <input
                    type="date"
                    value={form.fecha_ingreso}
                    onChange={e => setForm({ ...form, fecha_ingreso: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Salario */}
                <div>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '5px'
                  }}>
                    Salario (S/)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.salario}
                    onChange={e => setForm({ ...form, salario: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
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

              {/* Botones del formulario */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '20px'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setEditandoEmpleado(null);
                    setForm({ 
                      name: "", 
                      work_email: "", 
                      work_phone: "", 
                      fecha_ingreso: "", 
                      job_id: "", 
                      salario: "",
                      identification_id: ""
                    });
                  }}
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {editandoEmpleado ? '💾 Actualizar' : '✅ Guardar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LISTA DE EMPLEADOS */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          minHeight: '600px',
          maxHeight: 'calc(100vh - 200px)',
          overflow: 'auto'
        }}>
          {/* Tabla de empleados */}
          {error ? (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '20px',
              color: '#ef4444',
              textAlign: 'center',
              margin: '20px'
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
                borderTop: '2px solid #8b5cf6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <div style={{ marginTop: '12px' }}>Cargando empleados...</div>
            </div>
          ) : (
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1
                }}>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>Nombre</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>DNI</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>Email</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>Teléfono</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>Puesto</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>Fecha Ingreso</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>Salario</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empleadosFiltrados.map((empleado) => (
                  <tr key={empleado.id} style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'background 0.2s ease',
                    background: empleado.activo === false ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                  }}>
                    <td style={{ 
                      padding: '16px', 
                      color: empleado.activo === false ? '#fca5a5' : 'white', 
                      fontWeight: '500',
                      textDecoration: empleado.activo === false ? 'line-through' : 'none'
                    }}>
                      {empleado.name}
                    </td>
                    <td style={{ padding: '16px', color: '#cbd5e1' }}>{empleado.identification_id || "—"}</td>
                    <td style={{ padding: '16px', color: '#cbd5e1' }}>{empleado.work_email || "—"}</td>
                    <td style={{ padding: '16px', color: '#cbd5e1' }}>{empleado.work_phone || "—"}</td>
                    <td style={{ padding: '16px', color: '#cbd5e1' }}>{empleado.job_name || "—"}</td>
                    <td style={{ padding: '16px', color: '#cbd5e1' }}>
                      {empleado.fecha_ingreso ? new Date(empleado.fecha_ingreso).toLocaleDateString('es-ES') : "—"}
                    </td>
                    <td style={{ padding: '16px', color: '#cbd5e1' }}>
                      {empleado.salario ? `S/ ${Number(empleado.salario).toFixed(2)}` : "—"}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {empleado.activo !== false ? (
                          <>
                            <button
                              onClick={() => iniciarEdicion(empleado)}
                              style={{
                                padding: '6px 12px',
                                background: 'rgba(59, 130, 246, 0.2)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '6px',
                                color: '#60a5fa',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                              }}
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => eliminarEmpleado(empleado.id)}
                              style={{
                                padding: '6px 12px',
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '6px',
                                color: '#fca5a5',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                              }}
                            >
                              🗑️ Eliminar
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => recuperarEmpleado(empleado.id)}
                            style={{
                              padding: '6px 12px',
                              background: 'rgba(34, 197, 94, 0.2)',
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                              borderRadius: '6px',
                              color: '#86efac',
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            🔄 Recuperar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {empleadosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                      {q ? "No se encontraron empleados con ese criterio" : "No hay empleados registrados"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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