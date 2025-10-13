import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    await new Promise(resolve => setTimeout(resolve, 800));

    if (username === "admin" && password === "admin") {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", username);
      navigate("/");
    } else {
      setError("Usuario o contraseña incorrectos");
    }
    
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0f1c',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif"
    }}>

      {/* Fondo con Imagen y Degradado Animado */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        overflow: 'hidden'
      }}>
        
        {/* Imagen de fondo con zoom sutil */}
        <img 
          src="/src/assets/banner2.jpg" 
          alt="Background"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            filter: 'brightness(0.4) contrast(1.1) saturate(1.2)',
            animation: 'zoomSlow 30s ease-in-out infinite'
          }}
        />

        {/* Degradado Vertical Animado - De arriba hacia abajo */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(10, 15, 28, 0.9) 0%, rgba(10, 15, 28, 0.7) 20%, rgba(15, 23, 42, 0.5) 40%, rgba(30, 41, 59, 0.3) 60%, rgba(51, 65, 85, 0.1) 80%, transparent 100%)',
          animation: 'gradientFlow 15s ease-in-out infinite'
        }}></div>

        {/* Degradado Lateral Izquierdo */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '30%',
          height: '100%',
          background: 'linear-gradient(to right, rgba(10, 15, 28, 0.8) 0%, transparent 100%)',
          animation: 'sideGlow 20s ease-in-out infinite'
        }}></div>

        {/* Degradado Lateral Derecho */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '30%',
          height: '100%',
          background: 'linear-gradient(to left, rgba(10, 15, 28, 0.8) 0%, transparent 100%)',
          animation: 'sideGlow 20s ease-in-out infinite reverse'
        }}></div>

        {/* Efecto de Vignette */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10, 15, 28, 0.6) 100%)',
          animation: 'vignettePulse 25s ease-in-out infinite'
        }}></div>

        {/* Partículas de luz animadas */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              background: `radial-gradient(circle, 
                rgba(59, 130, 246, ${Math.random() * 0.1 + 0.05}) 0%, 
                transparent 70%)`,
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `particleFloat ${Math.random() * 20 + 15}s ease-in-out infinite ${Math.random() * 5}s`,
              filter: 'blur(20px)'
            }}
          />
        ))}

      </div>

      {/* Tarjeta de Login con Animación de Entrada */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '440px',
        padding: '20px',
        animation: 'slideInUp 0.8s ease-out'
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '50px 40px',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.3s ease',
          animation: 'cardGlow 4s ease-in-out infinite'
        }}>
          
          {/* Logo con Animación */}
          <div style={{
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `
              0 15px 30px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '12px',
            margin: '0 auto 30px',
            animation: 'logoFloat 6s ease-in-out infinite'
          }}>
            <img 
              src={logo} 
              alt="Alfa Mobile" 
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '16px',
                objectFit: 'cover'
              }}
            />
          </div>

          {/* Título con Efecto Typing */}
          <h1 style={{
            color: 'white',
            fontSize: '2.2rem',
            fontWeight: '800',
            margin: '0 0 8px 0',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'titleGlow 3s ease-in-out infinite'
          }}>
            Alfa Mobile
          </h1>
          
          <p style={{
            color: '#94a3b8',
            fontSize: '1.1rem',
            margin: '0 0 40px 0',
            fontWeight: '500',
            animation: 'fadeIn 1s ease-out 0.3s both'
          }}>
            Iniciar Sesión
          </p>

          {/* Formulario */}
          <form onSubmit={handleLogin}>
            {/* Campo Usuario */}
            <div style={{ 
              marginBottom: '24px',
              animation: 'slideInLeft 0.6s ease-out 0.2s both'
            }}>
              <input
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  fontFamily: "'Inter', sans-serif"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              />
            </div>

            {/* Campo Contraseña */}
            <div style={{ 
              marginBottom: '30px',
              animation: 'slideInRight 0.6s ease-out 0.4s both'
            }}>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  fontFamily: "'Inter', sans-serif"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              />
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
                textAlign: 'center',
                animation: 'shake 0.5s ease-in-out'
              }}>
                {error}
              </div>
            )}

            {/* Botón de Login */}
            <div style={{
              animation: 'slideInUp 0.6s ease-out 0.6s both'
            }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading 
                    ? 'rgba(59, 130, 246, 0.4)' 
                    : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)';
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {loading ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Verificando...
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Animaciones CSS */}
      <style>{`
        @keyframes zoomSlow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes gradientFlow {
          0%, 100% {
            opacity: 0.8;
            background: linear-gradient(to bottom, 
              rgba(10, 15, 28, 0.9) 0%, 
              rgba(10, 15, 28, 0.7) 20%, 
              rgba(15, 23, 42, 0.5) 40%, 
              rgba(30, 41, 59, 0.3) 60%, 
              rgba(51, 65, 85, 0.1) 80%, 
              transparent 100%);
          }
          50% {
            opacity: 0.9;
            background: linear-gradient(to bottom, 
              rgba(10, 15, 28, 0.8) 0%, 
              rgba(10, 15, 28, 0.6) 20%, 
              rgba(15, 23, 42, 0.4) 40%, 
              rgba(30, 41, 59, 0.2) 60%, 
              rgba(51, 65, 85, 0.05) 80%, 
              transparent 100%);
          }
        }

        @keyframes sideGlow {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 0.9;
          }
        }

        @keyframes vignettePulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes particleFloat {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.3;
          }
          33% {
            transform: translateY(-20px) translateX(10px) scale(1.1);
            opacity: 0.5;
          }
          66% {
            transform: translateY(10px) translateX(-20px) scale(0.9);
            opacity: 0.4;
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes cardGlow {
          0%, 100% {
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
          }
          50% {
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(59, 130, 246, 0.1);
          }
        }

        @keyframes titleGlow {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.2);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}