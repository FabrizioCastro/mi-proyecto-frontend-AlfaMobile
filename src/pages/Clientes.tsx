import { useEffect, useMemo, useState } from "react";
import { listarClientes, crearCliente } from "../api";
import { container, card, h1, tableWrap, th, td, btn, input, label } from "../ui";

type Cliente = { id: number; name: string; email?: string; phone?: string };

export default function Clientes() {
  const [items, setItems] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [q, setQ] = useState("");

  async function cargar() {
    try {
      setLoading(true);
      setError(null);
      const data = await listarClientes();
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

  const filtrados = useMemo(() => {
  if (!q.trim()) return items;
  const t = q.toLowerCase();

  const low = (v: any) =>
    typeof v === "string" ? v.toLowerCase()
    : v === null || v === undefined ? ""
    : String(v).toLowerCase(); // evita reventar si viene número/false

  return items.filter((c) =>
    low(c.name).includes(t) ||
    low(c.email).includes(t) ||
    low(c.phone).includes(t)
  );
}, [items, q]);


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await crearCliente({
      name: form.name.trim(),
      email: form.email || undefined,
      phone: form.phone || undefined,
    });
    setForm({ name: "", email: "", phone: "" });
    await cargar();
  }

  return (
    <main className={container}>
      <div className="mb-5">
        <h1 className={h1}>Clientes</h1>
        <p className="text-sm text-slate-500">Registra clientes y consúltalos desde Odoo.</p>
      </div>

      {/* Form crear */}
      <div className={`${card} mb-6`}>
        <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
          <div className="sm:col-span-2">
            <div className={label}>Nombre *</div>
            <input
              className={input}
              placeholder="Juan Pérez"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <div className={label}>Email</div>
            <input
              className={input}
              type="email"
              placeholder="juan@correo.pe"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <div className={label}>Teléfono</div>
            <input
              className={input}
              placeholder="987 654 321"
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
          placeholder="Buscar por nombre, email o teléfono…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className={btn} onClick={() => setQ(q)}>
          Buscar
        </button>
        <button className="px-4 py-2 rounded-xl border border-slate-300" onClick={() => setQ("")}>
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
                <th className={th}>Nombre</th>
                <th className={th}>Email</th>
                <th className={th}>Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className={td}>{c.id}</td>
                  <td className={td}>{c.name}</td>
                  <td className={td}>{c.email || "-"}</td>
                  <td className={td}>{c.phone || "-"}</td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Sin clientes.
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
