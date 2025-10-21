import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [username, setUsername] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener el usuario del sessionStorage
    const user = sessionStorage.getItem('user') || 'Admin';
    setUsername(user);
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función para obtener las iniciales del usuario
  const getInitials = (name: string) => {
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '30px',
      zIndex: 9999
    }}>
      {/* User Menu */}
      <div style={{ position: 'relative' }} ref={menuRef}>
        {/* Solo la bolita */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            width: '50px',
            height: '50px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: 'white',
            fontSize: '1rem',
            border: '3px solid rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
          }}
        >
          {getInitials(username)}
        </button>

        {/* Menú desplegable */}
        {showMenu && (
          <div 
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 12px)',
              width: '240px',
              background: '#ffffff',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              zIndex: 10000,
              animation: 'slideDown 0.2s ease-out'
            }}
          >
            {/* Información del usuario */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)'
            }}>
              <p style={{ 
                color: '#111827', 
                fontWeight: '600', 
                fontSize: '1rem',
                margin: 0 
              }}>
                {username}
              </p>
              <p style={{ 
                color: '#6b7280', 
                fontSize: '0.875rem',
                margin: '4px 0 0 0' 
              }}>
                Administrador
              </p>
            </div>

            {/* Opciones del menú */}
            <div style={{ padding: '8px 0' }}>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.9375rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fef2f2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <svg 
                  style={{ width: '20px', height: '20px' }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                  />
                </svg>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Header;