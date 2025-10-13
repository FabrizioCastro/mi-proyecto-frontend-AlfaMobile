import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/logo.png";

export default function Home() {
  const [typingText, setTypingText] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  
  const fullText = "Bienvenido/a que tengas un buen dia :)";

  useEffect(() => {
    // Carga inmediata del mensaje principal
    setShowWelcome(true);
    
    // Efecto de escritura
    let i = 0;
    const typeWriter = () => {
      if (i < fullText.length) {
        setTypingText(fullText.substring(0, i + 1));
        i++;
        setTimeout(typeWriter, 30);
      }
    };
    
    setTimeout(typeWriter, 300);
  }, []);

  return (
    <div className="fade-in" style={{
      minHeight: '100vh',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>

      {/* Mensaje de Bienvenida Principal */}
      <div style={{
        textAlign: 'center',
        maxWidth: '900px'
      }}>
        {/* Logo Elegante */}
        <div style={{
          width: '140px',
          height: '140px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          borderRadius: '35px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `
            0 30px 60px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.05)
          `,
          border: '2px solid rgba(255, 255, 255, 0.1)',
          padding: '15px',
          backdropFilter: 'blur(20px)',
          margin: '0 auto 40px'
        }}>
          <img 
            src={logo} 
            alt="Alfa Mobile" 
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '25px',
              objectFit: 'cover'
            }}
          />
        </div>
        
        {/* Título Principal - BLANCO FIJO */}
        <h1 style={{
          color: 'white',
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: '800',
          margin: '0 0 20px 0',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          lineHeight: '1.1'
        }}>
          Alfa Mobile
        </h1>
        
        {/* Subtítulo */}
        <p style={{
          color: '#60a5fa',
          fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
          fontWeight: '600',
          margin: '0 0 40px 0',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          textShadow: '0 4px 15px rgba(96, 165, 250, 0.3)'
        }}>
          ¡Tecnología en Tendencia!
        </p>

        {/* Mensaje de Bienvenida con Efecto de Escritura */}
        {showWelcome && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(25px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '25px',
            padding: '30px 40px',
            margin: '0 auto',
            maxWidth: '800px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            animation: 'fadeInUp 0.6s ease 0.2s both'
          }}>
            <div style={{
              color: '#ffffff',
              fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
              fontWeight: '500',
              lineHeight: '1.6',
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Inter', sans-serif",
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
            }}>
              <span style={{
                borderRight: '2px solid #60a5fa',
                paddingRight: '5px'
              }}>
                {typingText}
              </span>
            </div>
          </div>
        )}

        {/* Mensaje de Bienvenida Secundario */}
        {typingText.length === fullText.length && (
          <div style={{
            marginTop: '30px',
            animation: 'fadeInUp 0.6s ease 0.4s both'
          }}>
            <p style={{
              color: '#cbd5e1',
              fontSize: '1.1rem',
              fontWeight: '400',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
            }}>
              "Si hoy no puedes grandes cosas, haz cosas pequeños de una gran manera."
            </p>
          </div>
        )}
      </div>

      {/* Footer Minimalista */}
      <div style={{
        marginTop: '80px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#60a5fa',
          fontSize: '0.9rem',
          fontWeight: '600',
          justifyContent: 'center',
          marginBottom: '10px'
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            backgroundColor: '#10b981',
            borderRadius: '50%'
          }}></div>
          <span>Sistema Conectado con Odoo ERP</span>
        </div>
        
        <p style={{ 
          color: '#64748b', 
          fontSize: '0.8rem',
          margin: 0,
          fontWeight: '400'
        }}>
          Alfa Mobile PE © 2025 
        </p>
      </div>
    </div>
  );
}