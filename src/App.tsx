import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import Clientes from "./pages/Clientes";
import Ventas from "./pages/Ventas";
import Proveedores from "./pages/Proveedores"; // 👈 nuevo

export default function App() {
  return (
    <BrowserRouter>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600"></div>
            <Link to="/" className="font-semibold">Alfa Mobile · Panel</Link>
          </div>
          <nav className="flex gap-4 text-sm">
            <NavLink to="/clientes" className={({isActive}) => isActive ? "font-semibold text-blue-600" : "text-slate-600 hover:text-slate-800"}>Clientes</NavLink>
            <NavLink to="/proveedores" className={({isActive}) => isActive ? "font-semibold text-blue-600" : "text-slate-600 hover:text-slate-800"}>Proveedores</NavLink>
            <NavLink to="/ventas" className={({isActive}) => isActive ? "font-semibold text-blue-600" : "text-slate-600 hover:text-slate-800"}>Ventas</NavLink>
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Clientes />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/proveedores" element={<Proveedores />} /> {/* 👈 nuevo */}
        <Route path="/ventas" element={<Ventas />} />
      </Routes>
    </BrowserRouter>
  );
}
