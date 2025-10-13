import React, { useEffect, useState } from "react";
import { listarClientes, crearCliente } from "../api"; // Tus APIs reales

export default function Clientes() {
  // ====== Estados ======
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'lista' | 'registrar'>('lista');

  // formulario de cliente - solo campos que acepta tu API
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    vat: "", // RUC/DNI
    street: "",
    city: ""
  });

  // ====== Cargar ======
  async function cargar() {
    try {
      setLoading(true);
      setError(null);
      const data = await listarClientes(); // Sin parámetros si no acepta filtro
      setItems(data);
    } catch (e: any) {
      setError(e.message || "Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  // ====== Crear Cliente ======
  async function onCrear(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setMsg("❌ El nombre es obligatorio");
      return;
    }

    try {
      setMsg(null);
      
      // Validaciones de documentos
      if (form.vat) {
        if (form.vat.length === 11 && !form.vat.startsWith('20')) {
          setMsg("❌ RUC debe empezar con 20 y tener 11 dígitos");
          return;
        }
        if (form.vat.length === 8 && isNaN(Number(form.vat))) {
          setMsg("❌ DNI debe tener 8 dígitos numéricos");
          return;
        }
      }

      // Llamada real a tu API - solo campos que acepta
      const clienteData: any = {
        name: form.name.trim()
      };

      // Agregar campos opcionales solo si tienen valor
      if (form.email.trim()) clienteData.email = form.email.trim();
      if (form.phone.trim()) clienteData.phone = form.phone.trim();
      if (form.vat.trim()) clienteData.vat = form.vat.trim();
      if (form.street.trim()) clienteData.street = form.street.trim();
      if (form.city.trim()) clienteData.city = form.city.trim();

      await crearCliente(clienteData);

      setMsg("✅ Cliente creado correctamente.");
      
      // Limpiar formulario
      setForm({ 
        name: "", 
        email: "", 
        phone: "", 
        vat: "", 
        street: "", 
        city: "" 
      });
      
      // Recargar lista
      await cargar();
      setActiveTab('lista');
    } catch (e: any) {
      setMsg(`❌ Error: ${e.message || e}`);
    }
  }

  // ====== SUB-MENÚ ======
  const subMenuItems = [
    {
      id: 'registrar',
      label: 'Registrar Cliente',
      description: 'Agregar nuevo cliente al sistema',
      icon: '➕',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
    },
    {
      id: 'lista', 
      label: 'Lista de Clientes',
      description: 'Ver y gestionar todos los clientes',
      icon: '📋',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    }
  ];

  // Función de búsqueda local ya que listarClientes no acepta filtro
  const clientesFiltrados = items.filter(cliente => 
    cliente.name?.toLowerCase().includes(q.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(q.toLowerCase()) ||
    cliente.phone?.includes(q) ||
    cliente.vat?.includes(q)
  );

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
            background: 'linear-gradient(135deg, #fff 0%, #8b5cf6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Gestión de Clientes</h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '1.3rem',
            fontWeight: '500'
          }}>Administra y optimiza tu base de datos de clientes</p>
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
              onClick={() => setActiveTab(item.id as 'lista' | 'registrar')}
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
                
                {/* Efecto de brillo superior */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: item.gradient,
                  opacity: activeTab === item.id ? 0.8 : 0.6
                }}></div>

                {/* Contenido */}
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

                {/* Indicador de acción */}
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

          {/* ====== FORMULARIO REGISTRAR CLIENTE ====== */}
          {activeTab === 'registrar' && (
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
                Registrar Nuevo Cliente
              </h2>

              <form onSubmit={onCrear} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                padding: '30px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '25px',
                  marginBottom: '25px'
                }}>
                  
                  {/* Columna Izquierda */}
                  <div>
                    {/* Nombre/Razón Social */}
                    <div style={{ marginBottom: '25px' }}>
                      <label style={{
                        display: 'block',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        marginBottom: '10px'
                      }}>
                        Nombre / Razón Social *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Juan Pérez EIRL"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          background: 'rgba(255, 255, 255, 0.07)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '10px',
                          color: 'white',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '25px' }}>
                      <label style={{
                        display: 'block',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        marginBottom: '10px'
                      }}>
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        placeholder="cliente@empresa.com"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          background: 'rgba(255, 255, 255, 0.07)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '10px',
                          color: 'white',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Teléfono */}
                    <div style={{ marginBottom: '25px' }}>
                      <label style={{
                        display: 'block',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        marginBottom: '10px'
                      }}>
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        placeholder="+51 987 654 321"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
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

                  {/* Columna Derecha */}
                  <div>
                    {/* RUC/DNI */}
                    <div style={{ marginBottom: '25px' }}>
                      <label style={{
                        display: 'block',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        marginBottom: '10px'
                      }}>
                        RUC / DNI
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: 20123456789 para RUC / 87654321 para DNI"
                        value={form.vat}
                        onChange={e => setForm({ ...form, vat: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          background: 'rgba(255, 255, 255, 0.07)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '10px',
                          color: 'white',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Dirección */}
                    <div style={{ marginBottom: '25px' }}>
                      <label style={{
                        display: 'block',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        marginBottom: '10px'
                      }}>
                        Dirección
                      </label>
                      <input
                        type="text"
                        placeholder="Av. Principal 123, Urb. Los Olivos"
                        value={form.street}
                        onChange={e => setForm({ ...form, street: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          background: 'rgba(255, 255, 255, 0.07)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '10px',
                          color: 'white',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Ciudad */}
                    <div style={{ marginBottom: '25px' }}>
                      <label style={{
                        display: 'block',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        marginBottom: '10px'
                      }}>
                        Ciudad
                      </label>
                      <input
                        type="text"
                        placeholder="Lima"
                        value={form.city}
                        onChange={e => setForm({ ...form, city: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
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
                </div>

                {/* Botón y mensaje */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px'
                }}>
                  <button
                    type="submit"
                    style={{
                      padding: '14px 30px',
                      background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Crear Cliente
                  </button>
                  
                  {msg && (
                    <span style={{
                      color: msg.includes('✅') ? '#10b981' : '#ef4444',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      {msg}
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* ====== LISTA DE CLIENTES ====== */}
          {activeTab === 'lista' && (
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
                  Lista de Clientes
                </h2>

                {/* Búsqueda */}
                <div style={{
                  display: 'flex',
                  gap: '15px',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <input
                    type="text"
                    placeholder="Nombre, email o teléfono…"
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
                      minWidth: '250px'
                    }}
                  />
                  <button
                    onClick={() => cargar()}
                    style={{
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Recargar
                  </button>
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
                      cursor: 'pointer'
                    }}
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              {/* Tabla de clientes */}
              {error ? (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
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
                  Cargando clientes...
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
                        <th style={{ padding: '16px', textAlign: 'left', color: 'white', fontWeight: '600' }}>ID</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'white', fontWeight: '600' }}>Nombre</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'white', fontWeight: '600' }}>Email</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'white', fontWeight: '600' }}>Teléfono</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'white', fontWeight: '600' }}>RUC/DNI</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'white', fontWeight: '600' }}>Dirección</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientesFiltrados.map((cliente: any) => (
                        <tr key={cliente.id} style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          transition: 'background 0.2s ease'
                        }}>
                          <td style={{ padding: '16px', color: '#cbd5e1' }}>{cliente.id}</td>
                          <td style={{ padding: '16px', color: 'white', fontWeight: '500' }}>{cliente.name}</td>
                          <td style={{ padding: '16px', color: '#cbd5e1' }}>{cliente.email || "—"}</td>
                          <td style={{ padding: '16px', color: '#cbd5e1' }}>{cliente.phone || "—"}</td>
                          <td style={{ padding: '16px', color: '#cbd5e1' }}>{cliente.vat || "—"}</td>
                          <td style={{ padding: '16px', color: '#cbd5e1' }}>{cliente.street || "—"}</td>
                        </tr>
                      ))}
                      {clientesFiltrados.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                            {q ? "No se encontraron clientes con ese criterio" : "No hay clientes registrados"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



