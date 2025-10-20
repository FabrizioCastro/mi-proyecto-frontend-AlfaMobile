// App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import ProtectedRoute from './components/clientes/auth/ProtectedRoute';
import Clientes from './pages/Clientes';
import Productos from './pages/Productos';
import Proveedores from './pages/Proveedores';
import Empleados from './pages/Empleados';
import Marcas from './pages/Marcas';
import Modelos from './pages/Modelos';
import Ventas from './pages/Ventas';
import Egresos from './pages/Egresos';
import CuentasPorPagar from './pages/CuentasPorPagar';;
import AlertaCuentasPendientes from './components/AltertaCuentasPendientes';
import CuentasPorCobrar from './pages/CuentasPorCobrar';
import AlertaCuentasPorCobrar from './components/AlertaCuentasPorCobrar';
import ComparativoFinanciero from './pages/ComparativoFinanciero';
import ComparativoVentas from './pages/ComparativoVentas';
function App() {
  return (
    <BrowserRouter>
      <AlertaCuentasPendientes />
      <AlertaCuentasPorCobrar />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="empleados" element={<Empleados />} />
          <Route path="productos" element={<Productos />} />
          <Route path="lista-clientes" element={<Clientes />} />
          <Route path="lista-proveedores" element={<Proveedores />} />
          <Route path="registrar-cliente" element={<Clientes />} />
          <Route path="registrar-proveedor" element={<Proveedores />} />
          <Route path="marcas" element={<Marcas />} />
          <Route path="modelos" element={<Modelos />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="egresos" element={<Egresos />} />
          <Route path="cuentas-por-pagar" element={<CuentasPorPagar />} />
          <Route path ="cuentas-por-cobrar" element = {<CuentasPorCobrar/>} />
          <Route path ="balance-comparativo" element = {<ComparativoFinanciero/>} />
          <Route path = "comparar-ventas" element = {<ComparativoVentas/>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;