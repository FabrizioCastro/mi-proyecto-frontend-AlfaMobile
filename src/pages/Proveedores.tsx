import { useEffect, useState } from "react";
import { listarProveedores, crearProveedor } from "../api";
import { container, card, h1, tableWrap, th, td, btn, input, label } from "../ui";

type Proveedor = {
  id: number;
  name: string;
  vat?: string;   // RUC
  email?: string;
  phone?: string;
  supplier_rank: number;
};

export default function Proveedores() {
  const [items, setItems] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", vat: "", email: "", phone: "" });
  const [q, setQ] = useState("");

  async function cargar(busqueda?: string) {
    try {
      setLoading(true);
      setError(null);
      const data = await listarProveedores(busqueda);
      setItems(data);
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await crearProveedor({
      name: form.name.trim(),
      vat: form.vat || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
    });
    setForm({ name: "", vat: "", email: "", phone: "" });
    await cargar(q);
  }

  return (
    <main className={container}>
      <div className="mb-5">
        <h1 className={h1}>Proveedores</h1>
        <p className="text-sm text-slate-500">Registra proveedores (RUC, contacto) y consúltalos desde Odoo.</p>
      </div>

      {/* Form crear proveedor */}
      <div className={`${card} mb-6`}>
        <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
          <div>
            <div className={label}>Razón social *</div>
            <input
              className={input}
              placeholder="Proveedor Demo SAC"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <div className={label}>RUC</div>
            <input
              className={input}
              placeholder="20XXXXXXXXX"
              value={form.vat}
              onChange={(e) => setForm({ ...form, vat: e.target.value })}
            />
          </div>
          <div>
            <div className={label}>Email</div>
            <input
              className={input}
              type="email"
              placeholder="ventas@proveedor.pe"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <div className={label}>Teléfono</div>
            <input
              className={input}
              placeholder="01 555 1234"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="flex">
            <button className={`${btn} w-full sm:w-auto`} type="submit">
              Crear
            </button>
          </div>
        </form>
      </div>

      {/* Búsqueda */}
      <div className="mb-3 flex gap-2">
        <input
          className={input}
          placeholder="Buscar por nombre, RUC, email o teléfono…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className={btn} onClick={() => cargar(q)}>
          Buscar
        </button>
        <button className="px-4 py-2 rounded-xl border border-slate-300" onClick={() => { setQ(""); cargar(""); }}>
          Limpiar
        </button>
      </div>

      {/* Tabla */}
      <div className={tableWrap}>
        {loading ? (
          <div className="p-6">Cargando…</div>
        ) : error ? (
          <div className="p-6 text-rose-600">Error: {error}</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={th}>ID</th>
                <th className={th}>Razón social</th>
                <th className={th}>RUC</th>
                <th className={th}>Email</th>
                <th className={th}>Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className={td}>{p.id}</td>
                  <td className={td}>{p.name}</td>
                  <td className={td}>{p.vat || "-"}</td>
                  <td className={td}>{p.email || "-"}</td>
                  <td className={td}>{p.phone || "-"}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Sin proveedores.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
