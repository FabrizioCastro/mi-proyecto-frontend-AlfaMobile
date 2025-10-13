import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);

  const menuItems = [
    {
      key: 'registro',
      label: 'REGISTRO',
      icon: '📋',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      hijos: [
        { path: '/empleados', label: '👥 Empleados', description: 'Gestión de personal' },
      ]
    },
    {
      key: 'clientes', 
      label: 'CLIENTES',
      icon: '👥',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      hijos: [
        { path: '/registrar-cliente', label: '➕ Registrar Cliente', description: 'Agregar nuevo cliente' },
        { path: '/lista-clientes', label: '📋 Lista de Clientes', description: 'Ver todos los clientes' }
      ]
    },
    {
      key: 'inventario',
      label: 'INVENTARIO', 
      icon: '📦',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      hijos: [
        { path: '/productos', label: '📦 Productos', description: 'Gestión de productos' }
      ]
    },
    {
  key: 'proveedores',
  label: 'PROVEEDORES', 
  icon: '🚚',
  color: '#f59e0b',
  gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  hijos: [
    { path: '/marcas', label: '🏷️ Gestión de Marcas', description: 'Catálogo global de marcas' },
    { path: '/modelos', label: '📱 Gestión de Modelos', description: 'Catálogo global de modelos' },
    { path: '/registrar-proveedor', label: '➕ Registrar Proveedor', description: 'Agregar proveedor' },
    { path: '/lista-proveedores', label: '📋 Lista de Proveedores', description: 'Ver proveedores' }
  ]
},
    {
      key: 'cuentas',
      label: 'CUENTAS',
      icon: '💰',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      hijos: [
        { path: '/cuentas-por-pagar', label: '💸 Cuentas por Pagar', description: 'Gestionar pagos' },
        { path: '/cuentas-por-cobrar', label: '💰 Cuentas por Cobrar', description: 'Gestionar cobros' }
      ]
    },
    {
      key: 'contabilidad', 
      label: 'CONTABILIDAD',
      icon: '📊',
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      hijos: [
        { path: '/ingresos', label: '📈 Ingresos (Ventas)', description: 'Control de ingresos' },
        { path: '/egresos', label: '📉 Egresos (Gastos Fijos)', description: 'Control de gastos' },
        { path: '/balance-comparativo', label: '⚖️ Balance Comparativo', description: 'Análisis financiero' }
      ]
    },
    {
      key: 'ventas',
      label: 'VENTAS',
      icon: '📈',
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      hijos: [
        { path: '/comparar-ventas', label: '📊 Comparar Ventas entre Meses', description: 'Análisis de ventas' }
      ]
    }
  ];

  const toggleMenu = (key: string) => {
    setMenuAbierto(menuAbierto === key ? null : key);
  };

  const isActive = (path: string) => location.pathname === path;

  const isMenuActivo = (hijos: any[]) => {
    return hijos.some(hijo => isActive(hijo.path));
  };

  return (
    <div style={{
      width: '400px', // el fondo del sidebar
      background: '#0d0e0dff',
      borderRight: '1px solid rgba(255, 255, 255, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      overflowY: 'auto',
      boxShadow: '8px 0 30px rgba(0, 0, 0, 0.4)',
      zIndex: 1000,
       scrollbarWidth: 'none',
  msOverflowStyle: 'none'
    }}>
      
      {/* Logo Clickable Mejorado */}
      <Link 
        to="/" 
        style={{ textDecoration: 'none' }}
      >
        <div style={{
          padding: '30px 30px', // espacio en el logo
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
          background: 'rgba(255, 255, 255, 0.03)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
          e.currentTarget.style.transform = 'translateX(5px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px'
          }}>
            <div style={{
              width: '60px', // logo
              height: '60px',
              background: 'linear-gradient(135deg, #384355ff 0%, #1c1a1fff 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%', // atras del logo
                height: '100%',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
                opacity: 0.6
              }}></div>
              <img 
                src={logo} 
                alt="Alfa Mobile" 
                style={{
                  width: '70%',
                  height: '70%',
                  borderRadius: '10px',
                  position: 'relative',
                  zIndex: 1
                }} 
              />
            </div>
            <div>
              <h1 style={{
                color: 'white',
                fontSize: '30px', // El titulo de alfa arriba
                fontWeight: 'bold',
                margin: 0,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Alfa Mobile
              </h1>
              <p style={{
                color: '#94a3b8',
                fontSize: '14px', // el subtitulo de abajo
                margin: '4px 0 0 0',
                fontWeight: '500'
              }}>
                Sistema ERP Integral
              </p>
            </div>
          </div>
        </div>
      </Link>

      {/* Navegación Mejorada */}
      <nav style={{
        flex: 1,
        padding: '10px 0' //espacio de arriba
      }}>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0
        }}>
          {menuItems.map((item) => {
            const estaActivo = isMenuActivo(item.hijos);
            const estaAbierto = menuAbierto === item.key;
            
            return (
              <li key={item.key} style={{ marginBottom: '8px' }}>
                {/* Menú Padre - SIN BARRAS LATERALES */}
                <div
                  onClick={() => toggleMenu(item.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 35px', // espaciado entre opciones
                    color: estaActivo ? 'white' : '#cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: estaActivo 
                      ? `linear-gradient(90deg, ${item.color}15 0%, transparent 100%)` 
                      : 'transparent',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (!estaActivo) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateX(8px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!estaActivo) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#cbd5e1';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                    zIndex: 1
                  }}>
                    <div style={{
                      width: '44px', //el logo del padre
                      height: '44px',
                      background: estaActivo ? item.gradient : 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px', //Iconos del side bar
                      transition: 'all 0.3s ease',
                      boxShadow: estaActivo ? `0 6px 20px ${item.color}40` : 'none',
                      transform: estaActivo ? 'scale(1.1)' : 'scale(1)'
                    }}>
                      {item.icon}
                    </div>
                    <span style={{
                      fontWeight: '700',
                      fontSize: '15px', // tamaño de la letra del sidebar padre
                      letterSpacing: '0.5px'
                    }}>{item.label}</span>
                  </div>
                  <span style={{
                    transform: estaAbierto ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontSize: '20px', //flechita del sidebar
                    opacity: 0.7
                  }}>
                    ▶
                  </span>
                </div>

                {/* Submenú Hijos - SIN BARRAS LATERALES */}
                {estaAbierto && (
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.2)',
                    animation: 'slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}>
                    {item.hijos.map((hijo, index) => (
                      <div
                        key={hijo.path}
                        style={{
                          position: 'relative',
                          animation: `slideInRight 0.3s ease ${index * 0.1}s both`
                        }}
                      >
                        <Link
                          to={hijo.path}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '16px',
                            padding: '16px 30px 15px 90px', // el espacio entre padre e hijo
                            textDecoration: 'none',
                            color: isActive(hijo.path) ? item.color : '#dee2e7ff',
                            transition: 'all 0.3s ease',
                            background: isActive(hijo.path) ? `linear-gradient(90deg, ${item.color}10 0%, transparent 100%)` : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive(hijo.path)) {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                              e.currentTarget.style.color = '#cbd5e1';
                              e.currentTarget.style.transform = 'translateX(5px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive(hijo.path)) {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#94a3b8';
                              e.currentTarget.style.transform = 'translateX(0)';
                            }
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: '17px', //El tamaño del hijo
                              fontWeight: isActive(hijo.path) ? '600' : '500',
                              letterSpacing: '0.3px',
                              marginBottom: '4px'
                            }}>{hijo.label}</div>
                            
                          </div>
                          
                          {/* Indicador de página activa */}
                          {isActive(hijo.path) && (
                            <div style={{
                              position: 'absolute',
                              right: '20px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '8px',
                              height: '8px',
                              background: item.color,
                              borderRadius: '50%',
                              animation: 'pulse 2s infinite'
                            }}></div>
                          )}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

     <style>{`
  @keyframes slideDown {
    from {
      opacity: 0;
      max-height: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      max-height: 500px;
      transform: translateY(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: translateY(-50%) scale(1);
      opacity: 1;
    }
    50% {
      transform: translateY(-50%) scale(1.2);
      opacity: 0.7;
    }
  }

  /* 👇 AGREGAR ESTO PARA OCULTAR SCROLLBAR */
  ::-webkit-scrollbar {
    display: none;
  }
`}</style>
    </div>
  );
};

export default Sidebar;