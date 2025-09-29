import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import Clientes from "./pages/Clientes";
import Proveedores from "./pages/Proveedores";
import Ventas from "./pages/Ventas";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold">Alfa Mobile · Panel</Link>
          <nav className="flex gap-4 text-sm">
            <NavLink
              to="/clientes"
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-blue-600"
                  : "text-slate-600 hover:text-slate-800"
              }
            >
              Clientes
            </NavLink>
            <NavLink
              to="/proveedores"
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-blue-600"
                  : "text-slate-600 hover:text-slate-800"
              }
            >
              Proveedores
            </NavLink>
            <NavLink
              to="/ventas"
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-blue-600"
                  : "text-slate-600 hover:text-slate-800"
              }
            >
              Ventas
            </NavLink>
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Clientes />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/proveedores" element={<Proveedores />} />
        <Route path="/ventas" element={<Ventas />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
