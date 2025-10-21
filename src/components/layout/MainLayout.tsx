import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';  // 👈 IMPORTAR EL HEADER

const MainLayout: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh'
    }}>
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Área de Contenido Principal */}
      <div style={{
        flex: 1,
        marginLeft: '350px',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'  // 👈 AGREGAR ESTO
      }}>
        
        {/* 👇 AGREGAR EL HEADER AQUÍ */}
        <div style={{
          position: 'relative',
          zIndex: 10
        }}>
          <Header />
        </div>

        {/* Fondo Espectacular para el contenido */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: '400px',
          right: 0,
          bottom: 0,
          zIndex: 0
        }}>
          {/* Banner de fondo */}
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <img
              src="/src/assets/banner.jpg"
              alt="Tecnología en tendencia"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
                filter: 'brightness(0.3) contrast(1.3) saturate(1.2)',
                transform: 'scale(1.1)',
                position: 'absolute',
                top: 0,
                left: 0
              }}
            />
            
            {/* Overlay profesional */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.7) 50%, rgba(15, 23, 42, 0.9) 100%)',
              animation: 'gradientShift 8s ease infinite'
            }}></div>

            {/* Efectos de brillo */}
            <div style={{
              position: 'absolute',
              top: '20%',
              right: '-10%',
              width: '500px',
              height: '500px',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'float 8s ease-in-out infinite',
              filter: 'blur(40px)'
            }}></div>
            
            <div style={{
              position: 'absolute',
              bottom: '10%',
              left: '-5%', 
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'float 6s ease-in-out infinite 1s',
              filter: 'blur(30px)'
            }}></div>
          </div>
        </div>

        {/* Contenido de las páginas */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          flex: 1,  // 👈 AGREGAR ESTO
          minHeight: '100vh'
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;