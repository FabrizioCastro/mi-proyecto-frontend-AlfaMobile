import React, { useState } from 'react';

interface RegistrarClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clienteData: any) => void;
}

const RegistrarClienteModal: React.FC<RegistrarClienteModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    // Campos compatibles con Odoo
    name: '', // Nombre del cliente (obligatorio en Odoo)
    email: '',
    phone: '',
    vat: '', // RUC/DNI
    street: '',
    city: '',
    country_id: '', // Perú por defecto
    l10n_latam_identification_type_id: '', // Tipo de documento
    company_type: 'person' // person o company
  });

  const tiposDocumento = [
    { id: '1', name: 'DNI' },
    { id: '2', name: 'RUC' },
    { id: '3', name: 'Carnet de Extranjería' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas compatibles con Odoo
    if (!formData.name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    if (formData.vat && formData.l10n_latam_identification_type_id === '2' && formData.vat.length !== 11) {
      alert('El RUC debe tener 11 dígitos');
      return;
    }

    if (formData.vat && formData.l10n_latam_identification_type_id === '1' && formData.vat.length !== 8) {
      alert('El DNI debe tener 8 dígitos');
      return;
    }

    // Enviar datos (aquí se conectaría con la API de Odoo)
    onSave(formData);
    onClose();
    
    // Limpiar formulario
    setFormData({
      name: '',
      email: '',
      phone: '',
      vat: '',
      street: '',
      city: '',
      country_id: '',
      l10n_latam_identification_type_id: '',
      company_type: 'person'
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

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
      backdropFilter: 'blur(10px)',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '24px',
        padding: '50px',
        width: '95%',
        maxWidth: '900px', // Más ancho
        maxHeight: '95vh',
        overflowY: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6)',
        position: 'relative'
      }}>
        
        {/* Header del Modal */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '40px', // Más espacio
          paddingBottom: '25px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <div>
            <h2 style={{
              color: 'white',
              fontSize: '2.2rem', // Más grande
              fontWeight: '800',
              margin: 0,
              background: 'linear-gradient(135deg, #fff 0%, #60a5fa 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px'
            }}>
              Registrar Nuevo Cliente
            </h2>
            <p style={{
              color: '#94a3b8',
              margin: '8px 0 0 0', // Más espacio
              fontSize: '1.1rem' // Más grande
            }}>
              Complete la información del cliente (compatible con Odoo)
            </p>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              color: '#ef4444',
              width: '50px', // Más grande
              height: '50px',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
<form onSubmit={handleSubmit}>
  <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '80px', // Más espacio entre columnas
    marginBottom: '40px'
  }}>
    
    {/* Columna Izquierda */}
    <div>
      {/* Nombre/Razón Social */}
      <div style={{ marginBottom: '30px' }}> {/* Más espacio abajo */}
        <label style={{
          display: 'block',
          color: 'white',
          fontSize: '1rem',
          fontWeight: '700',
          marginBottom: '12px'
        }}>
          Nombre / Razón Social *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '16px 20px',
            background: 'rgba(255, 255, 255, 0.07)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.12)';
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.07)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            e.target.style.boxShadow = 'none';
          }}
          placeholder="Ej: Juan Pérez EIRL"
        />
      </div>

      {/* Email */}
      <div style={{ marginBottom: '30px' }}> {/* Más espacio abajo */}
        <label style={{
          display: 'block',
          color: 'white',
          fontSize: '1rem',
          fontWeight: '700',
          marginBottom: '12px'
        }}>
          Correo Electrónico
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: 'rgba(255, 255, 255, 0.07)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.12)';
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.07)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            e.target.style.boxShadow = 'none';
          }}
          placeholder="cliente@empresa.com"
        />
      </div>

      {/* Teléfono */}
      <div style={{ marginBottom: '30px' }}> {/* Más espacio abajo */}
        <label style={{
          display: 'block',
          color: 'white',
          fontSize: '1rem',
          fontWeight: '700',
          marginBottom: '12px'
        }}>
          Teléfono
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: 'rgba(255, 255, 255, 0.07)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.12)';
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.07)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            e.target.style.boxShadow = 'none';
          }}
          placeholder="+51 987 654 321"
        />
      </div>
    </div>

    {/* Columna Derecha */}
    <div>
      {/* Tipo de Documento */}
      <div style={{ marginBottom: '30px' }}> {/* Más espacio abajo */}
        <label style={{
          display: 'block',
          color: 'white',
          fontSize: '1rem',
          fontWeight: '700',
          marginBottom: '12px'
        }}>
          Tipo de Documento
        </label>
        <select
          name="l10n_latam_identification_type_id"
          value={formData.l10n_latam_identification_type_id}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: 'rgba(255, 255, 255, 0.07)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            outline: 'none',
            cursor: 'pointer'
          }}
          onFocus={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.12)';
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.07)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <option value="">Seleccionar tipo de documento</option>
          {tiposDocumento.map(tipo => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.name}
            </option>
          ))}
        </select>
      </div>

      {/* Número de Documento */}
      <div style={{ marginBottom: '30px' }}> {/* Más espacio abajo */}
        <label style={{
          display: 'block',
          color: 'white',
          fontSize: '1rem',
          fontWeight: '700',
          marginBottom: '12px'
        }}>
          N° de Documento
        </label>
        <input
          type="text"
          name="vat"
          value={formData.vat}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: 'rgba(255, 255, 255, 0.07)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.12)';
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.07)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            e.target.style.boxShadow = 'none';
          }}
          placeholder="Ej: 20123456789 para RUC / 87654321 para DNI"
        />
      </div>

      {/* Dirección */}
      <div style={{ marginBottom: '30px' }}> {/* Más espacio abajo */}
        <label style={{
          display: 'block',
          color: 'white',
          fontSize: '1rem',
          fontWeight: '700',
          marginBottom: '12px'
        }}>
          Dirección
        </label>
        <input
          type="text"
          name="street"
          value={formData.street}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: 'rgba(255, 255, 255, 0.07)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.12)';
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.07)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            e.target.style.boxShadow = 'none';
          }}
          placeholder="Av. Principal 123, Urb. Los Olivos"
        />
      </div>
    </div>
  </div>

          

          
        </form>
      </div>
    </div>
  );
};

export default RegistrarClienteModal;