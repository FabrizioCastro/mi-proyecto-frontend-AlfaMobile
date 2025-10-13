// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import ProtectedRoute from './components/clientes/auth/ProtectedRoute';
import Clientes from './pages/Clientes';
import Productos from './pages/Productos';
import Proveedores from './pages/Proveedores';
import Empleados from './pages/Empleados'; // 👈 AGREGAR ESTA IMPORT
import Marcas from './pages/Marcas';
import Modelos from './pages/Modelos';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública del login */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          {/* 👇 AGREGAR TODAS TUS RUTAS AQUÍ */}
          <Route path="empleados" element={<Empleados />} />
          <Route path="productos" element={<Productos />} />
          <Route path="lista-clientes" element={<Clientes />} />
          <Route path="lista-proveedores" element={<Proveedores />} />
          <Route path="registrar-cliente" element={<Clientes />} />
          <Route path="registrar-proveedor" element={<Proveedores />} />
          <Route path="marcas" element={<Marcas />} />
          <Route path="modelos" element={<Modelos />} />
          {/* ... otras rutas que tengas */}
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;