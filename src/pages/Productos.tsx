// src/pages/Productos.tsx
import { useEffect, useMemo, useState } from "react";
import {
  listarProductos,
  crearProducto,
  crearSeries,
  inventarioPorVariante,
} from "../api";
import { container, card, h1, tableWrap, th, td, btn, input, label } from "../ui";

type Producto = {
  id: number;
  name: string;
  default_code?: string;   // SKU
  list_price?: number;
  barcode?: string;
  tracking?: "none" | "lot" | "serial";
  variant_id?: number | null;
  variant_name?: string | null;
  type?: string;
};

type TotalesProducto = {
  product_id: number;
  quantity: number;
  reserved: number;
  available: number;
  by_location: { location: string; quantity: number; reserved: number }[];
};

export default function Productos() {
  // Lista, búsqueda y estados
  const [items, setItems] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  // Crear producto
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    barcode: "",
    tracking: "none" as "none" | "lot" | "serial",
  });
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  // Selección para acciones (series/stock)
  const [selected, setSelected] = useState<Producto | null>(null);

  // Series
  const [serialText, setSerialText] = useState("");
  const serialsArray = useMemo(
    () =>
      serialText
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    [serialText]
  );
  const [seriesMsg, setSeriesMsg] = useState<string | null>(null);
  const [seriesLoading, setSeriesLoading] = useState(false);

  // Stock
  const [stockLoading, setStockLoading] = useState(false);
  const [totales, setTotales] = useState<TotalesProducto | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);

  async function cargar(busqueda?: string) {
    try {
      setLoading(true);
      setError(null);
      const data = await listarProductos(busqueda);
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

  async function onCrearProducto(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      setCreating(true);
      setCreateMsg(null);
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim() || undefined,
        price: form.price ? Number(form.price) : 0,
        barcode: form.barcode.trim() || undefined,
        tracking: form.tracking,
      };
      const res = await crearProducto(payload); // { template_id, variant_id }
      setCreateMsg(`Producto creado (template_id: ${res.template_id}, variant_id: ${res.variant_id ?? "-"})`);
      setForm({ name: "", sku: "", price: "", barcode: "", tracking: "none" });
      await cargar(q);
    } catch (e: any) {
      setCreateMsg(`Error: ${e.message || e}`);
    } finally {
      setCreating(false);
    }
  }

  function onSelect(p: Producto) {
    // Reinicia paneles auxiliares
    setSelected(p);
    setSerialText("");
    setSeriesMsg(null);
    setTotales(null);
    setStockError(null);
  }

  async function onCargarSeries() {
    if (!selected?.variant_id) {
      setSeriesMsg("Este producto no tiene variante única (variant_id). No se pueden cargar series.");
      return;
    }
    if (serialsArray.length === 0) {
      setSeriesMsg("Agrega al menos 1 número de serie (uno por línea).");
      return;
    }
    try {
      setSeriesLoading(true);
      setSeriesMsg(null);
      const res = await crearSeries(selected.variant_id, serialsArray);
      setSeriesMsg(`Series creadas: ${res.created?.length ?? 0}`);
      setSerialText("");
    } catch (e: any) {
      setSeriesMsg(`Error: ${e.message || e}`);
    } finally {
      setSeriesLoading(false);
    }
  }

  async function onVerStock() {
    if (!selected?.variant_id) {
      setStockError("Este producto no tiene variant_id para consultar stock.");
      setTotales(null);
      return;
    }
    try {
      setStockLoading(true);
      setStockError(null);
      const res = await inventarioPorVariante(selected.variant_id);
      const t = (res?.totales || [])[0] as TotalesProducto | undefined;
      setTotales(t || null);
    } catch (e: any) {
      setStockError(e.message || "Error consultando stock");
      setTotales(null);
    } finally {
      setStockLoading(false);
    }
  }

  return (
    <main className={container}>
      <div className="mb-5">
        <h1 className={h1}>Productos</h1>
        <p className="text-sm text-slate-500">
          Crea productos (SKU, precio, código de barras), gestiona series y consulta stock por ubicación.
        </p>
      </div>

      {/* Crear producto */}
      <div className={`${card} mb-6`}>
        <form onSubmit={onCrearProducto} className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-end">
          <div className="sm:col-span-2">
            <div className={label}>Nombre *</div>
            <input
              className={input}
              placeholder="Xiaomi 13T Pro"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <div className={label}>SKU</div>
            <input
              className={input}
              placeholder="XM-13TPRO"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
          </div>
          <div>
            <div className={label}>Precio</div>
            <input
              className={input}
              type="number"
              step="0.01"
              placeholder="2499.00"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <div className={label}>Código de barras</div>
            <input
              className={input}
              placeholder="1234567890123"
              value={form.barcode}
              onChange={(e) => setForm({ ...form, barcode: e.target.value })}
            />
          </div>
          <div>
            <div className={label}>Tracking</div>
            <select
              className={`${input} pr-8`}
              value={form.tracking}
              onChange={(e) => setForm({ ...form, tracking: e.target.value as any })}
            >
              <option value="none">Sin tracking</option>
              <option value="serial">Por número de serie</option>
              <option value="lot">Por lote</option>
            </select>
          </div>
          <div className="flex">
            <button className={`${btn} w-full sm:w-auto`} disabled={creating}>
              {creating ? "Creando…" : "Crear producto"}
            </button>
          </div>
        </form>
        {createMsg && <div className="mt-3 text-sm text-slate-600">{createMsg}</div>}
      </div>

      {/* Búsqueda */}
      <div className="mb-3 flex flex-wrap gap-2 items-center">
        <input
          className={input}
          placeholder="Buscar por nombre o SKU…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className={btn} onClick={() => cargar(q)}>
          Buscar
        </button>
        <button
          className="px-4 py-2 rounded-xl border border-slate-300"
          onClick={() => {
            setQ("");
            cargar("");
          }}
        >
          Limpiar
        </button>
      </div>

      {/* Tabla de productos */}
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
                <th className={th}>SKU</th>
                <th className={th}>Precio</th>
                <th className={th}>Barcode</th>
                <th className={th}>Tracking</th>
                <th className={th}>Variante</th>
                <th className={th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => {
                const isSel = selected?.id === p.id;
                return (
                  <tr key={p.id} className={`align-top ${isSel ? "bg-slate-50" : "hover:bg-slate-50"}`}>
                    <td className={td}>{p.id}</td>
                    <td className={td}>{p.name}</td>
                    <td className={td}>{p.default_code || "-"}</td>
                    <td className={td}>S/ {(p.list_price ?? 0).toFixed(2)}</td>
                    <td className={td}>{p.barcode || "-"}</td>
                    <td className={td}>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          p.tracking === "serial"
                            ? "bg-blue-100 text-blue-700"
                            : p.tracking === "lot"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {p.tracking ?? "none"}
                      </span>
                    </td>
                    <td className={td}>
                      {p.variant_id ? (
                        <span className="text-slate-700">
                          {p.variant_id} <span className="text-slate-400">({p.variant_name || "var"})</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className={`${td} space-x-2`}>
                      <button
                        className="px-3 py-1.5 rounded-xl border border-slate-300"
                        onClick={() => onSelect(p)}
                      >
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No hay productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Panel de acciones para el producto seleccionado */}
      {selected && (
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {/* Series */}
          <div className={card}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-slate-600">Cargar series</div>
                <div className="text-xs text-slate-500">
                  Producto: <b>{selected.name}</b>{" "}
                  {selected.variant_id ? `(variant_id: ${selected.variant_id})` : "(sin variant_id)"}
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  selected.tracking === "serial"
                    ? "bg-blue-100 text-blue-700"
                    : selected.tracking === "lot"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-700"
                }`}
                title="Tipo de tracking"
              >
                {selected.tracking ?? "none"}
              </span>
            </div>

            {selected.tracking === "serial" || selected.tracking === "lot" ? (
              <>
                <textarea
                  className={`${input} h-32`}
                  placeholder={"Pega 1 número por línea...\nSN-0001\nSN-0002\nSN-0003"}
                  value={serialText}
                  onChange={(e) => setSerialText(e.target.value)}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-slate-500">
                    {serialsArray.length} {serialsArray.length === 1 ? "número" : "números"} listo(s)
                  </div>
                  <button className={btn} onClick={onCargarSeries} disabled={seriesLoading}>
                    {seriesLoading ? "Cargando…" : "Crear series"}
                  </button>
                </div>
                {seriesMsg && <div className="mt-3 text-sm text-slate-600">{seriesMsg}</div>}
              </>
            ) : (
              <div className="text-sm text-slate-500">
                Este producto no usa series/lotes (tracking: <b>none</b>). Cambia el tracking al crear el
                producto si necesitas control por serie o lote.
              </div>
            )}
          </div>

          {/* Stock */}
          <div className={card}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-slate-600">Stock por ubicación</div>
                <div className="text-xs text-slate-500">
                  Variante seleccionada: {selected.variant_id ?? "—"}
                </div>
              </div>
              <button className={btn} onClick={onVerStock} disabled={stockLoading}>
                {stockLoading ? "Consultando…" : "Ver stock"}
              </button>
            </div>

            {stockError && <div className="text-rose-600 mb-2">{stockError}</div>}

            {totales ? (
              <>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-white rounded-xl border p-4">
                    <div className="text-xs text-slate-500">Cantidad</div>
                    <div className="text-xl font-semibold">{totales.quantity}</div>
                  </div>
                  <div className="bg-white rounded-xl border p-4">
                    <div className="text-xs text-slate-500">Reservado</div>
                    <div className="text-xl font-semibold">{totales.reserved}</div>
                  </div>
                  <div className="bg-white rounded-xl border p-4">
                    <div className="text-xs text-slate-500">Disponible</div>
                    <div className="text-xl font-semibold">{totales.available}</div>
                  </div>
                </div>

                <div className={tableWrap}>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className={th}>Ubicación</th>
                        <th className={th}>Cantidad</th>
                        <th className={th}>Reservado</th>
                        <th className={th}>Disponible</th>
                      </tr>
                    </thead>
                    <tbody>
                      {totales.by_location.map((l, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className={td}>{l.location}</td>
                          <td className={td}>{l.quantity}</td>
                          <td className={td}>{l.reserved}</td>
                          <td className={td}>{(l.quantity - l.reserved).toFixed(2)}</td>
                        </tr>
                      ))}
                      {totales.by_location.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-500">
                            Sin quants en ubicaciones internas.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-500">
                Presiona <b>Ver stock</b> para consultar las cantidades en Odoo.
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
