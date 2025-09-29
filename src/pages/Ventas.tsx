import { useEffect, useMemo, useState } from "react";
import { resumenVentas, ventasPorMes } from "../api";
import {
  rangosMesActualYAnterior,
  ymFromDate,
  lastNMonthsRange,
  addMonths,
  rangoYTD,
} from "../utils/fechas";
import { container, card, h1, tableWrap, th, td, btn } from "../ui";

type Resumen = { total: number; cantidad: number; desde: string; hasta: string };
type PeriodoMes = { mes: string; total: number; cantidad: number };

export default function Ventas() {
  const [{ este, pasado }] = useState(rangosMesActualYAnterior());
  const [rEste, setREste] = useState<Resumen | null>(null);
  const [rPasado, setRPasado] = useState<Resumen | null>(null);
  const [ytd, setYtd] = useState<{ total: number; cantidad: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function cargar() {
    try {
      setLoading(true);
      setErr(null);
      const [a, b] = await Promise.all([
        resumenVentas(este.desde, este.hasta),
        resumenVentas(pasado.desde, pasado.hasta),
      ]);
      setREste(a);
      setRPasado(b);

      const { desde: yDesde, hasta: yHasta } = rangoYTD(new Date());
      const y = await resumenVentas(yDesde, yHasta);
      setYtd({ total: y.total, cantidad: y.cantidad });
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalEste = rEste?.total ?? 0;
  const totalPasado = rPasado?.total ?? 0;
  const max = Math.max(totalEste, totalPasado, 1);
  const wEste = `${Math.round((totalEste / max) * 100)}%`;
  const wPas = `${Math.round((totalPasado / max) * 100)}%`;
  const dif = totalEste - totalPasado;
  const signo = dif > 0 ? "+" : dif < 0 ? "−" : "±";

  return (
    <main className={container}>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className={h1}>Ventas — Este mes vs Mes pasado</h1>
          <p className="text-sm text-slate-500">
            Rango este mes: {este.desde} a {este.hasta} • Rango mes pasado: {pasado.desde} a {pasado.hasta}
          </p>
        </div>
        <button onClick={cargar} className={btn}>Actualizar</button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className={card}>
          <div className="text-sm text-slate-500">Total mes pasado</div>
          <div className="text-2xl font-semibold">S/ {totalPasado.toFixed(2)}</div>
          <div className="text-xs text-slate-500">Pedidos: {rPasado?.cantidad ?? 0}</div>
        </div>
        <div className={card}>
          <div className="text-sm text-slate-500">Total este mes</div>
          <div className="text-2xl font-semibold">S/ {totalEste.toFixed(2)}</div>
          <div className="text-xs text-slate-500">Pedidos: {rEste?.cantidad ?? 0}</div>
        </div>
        <div className={card}>
          <div className="text-sm text-slate-500">Diferencia</div>
          <div className={`text-2xl font-semibold ${dif>0 ? "text-emerald-600" : dif<0 ? "text-rose-600" : ""}`}>
            {signo} S/ {Math.abs(dif).toFixed(2)}
          </div>
          <div className="text-xs text-slate-500">
            {dif>0 ? "Arriba" : dif<0 ? "Abajo" : "Igual"} vs mes pasado
          </div>
        </div>
      </div>

      {/* YTD + comparativo visual */}
      <div className={`${card} mb-6`}>
        <div className="text-sm text-slate-500">Acumulado del año (YTD)</div>
        <div className="text-2xl font-semibold">S/ {(ytd?.total ?? 0).toFixed(2)}</div>
        <div className="text-xs text-slate-500 mb-3">Pedidos: {ytd?.cantidad ?? 0}</div>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-slate-500 mb-1">Mes pasado</div>
            <div className="h-3 bg-slate-200 rounded-xl overflow-hidden">
              <div className="h-3 bg-slate-400" style={{ width: wPas }} />
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Este mes</div>
            <div className="h-3 bg-slate-200 rounded-xl overflow-hidden">
              <div className="h-3 bg-blue-600" style={{ width: wEste }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla resumen */}
      <div className={tableWrap}>
        {loading ? (
          <div className="p-6">Cargando…</div>
        ) : err ? (
          <div className="p-6 text-rose-600">Error: {err}</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={th}>Periodo</th>
                <th className={th}>Desde</th>
                <th className={th}>Hasta</th>
                <th className={th}>Pedidos</th>
                <th className={th}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-slate-50">
                <td className={td}>Mes pasado</td>
                <td className={td}>{pasado.desde}</td>
                <td className={td}>{pasado.hasta}</td>
                <td className={td}>{rPasado?.cantidad ?? 0}</td>
                <td className={td}>S/ {totalPasado.toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className={td}>Este mes</td>
                <td className={td}>{este.desde}</td>
                <td className={td}>{este.hasta}</td>
                <td className={td}>{rEste?.cantidad ?? 0}</td>
                <td className={td}>S/ {totalEste.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Bloques: comparar meses y serie últimos N meses */}
      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <div className={card}>
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-sm text-slate-600">Comparar 2 meses</div>
              <div className="text-xs text-slate-500">Elige dos meses (YYYY-MM)</div>
            </div>
          </div>
          <CompararMeses />
        </div>

        <div className={card}>
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-sm text-slate-600">Serie: últimos N meses</div>
              <div className="text-xs text-slate-500">Vista rápida acumulada</div>
            </div>
          </div>
          <SerieUltimosMeses />
        </div>
      </div>
    </main>
  );
}

/** --- Componente: Comparar dos meses específicos --- */
function CompararMeses() {
  const [mesA, setMesA] = useState(ymFromDate());                // mes actual
  const [mesB, setMesB] = useState(addMonths(ymFromDate(), -1)); // mes pasado
  const [res, setRes]   = useState<{A?: number; B?: number; cA?: number; cB?: number}>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function comparar() {
    try {
      setLoading(true); setErr(null);
      const [rA, rB] = await Promise.all([
        ventasPorMes(mesA, mesA),
        ventasPorMes(mesB, mesB),
      ]);
      setRes({
        A: rA.periodos[0]?.total ?? 0,
        B: rB.periodos[0]?.total ?? 0,
        cA: rA.periodos[0]?.cantidad ?? 0,
        cB: rB.periodos[0]?.cantidad ?? 0,
      });
    } catch (e:any) {
      setErr(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { comparar(); }, [mesA, mesB]); // auto al cambiar

  const dif = (res.A ?? 0) - (res.B ?? 0);
  const signo = dif > 0 ? "+" : (dif < 0 ? "−" : "±");
  const max = Math.max(res.A ?? 0, res.B ?? 0, 1);
  const wA = `${Math.round(((res.A ?? 0) / max) * 100)}%`;
  const wB = `${Math.round(((res.B ?? 0) / max) * 100)}%`;

  return (
    <div>
      <div className="flex flex-wrap gap-3 items-end mb-4">
        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Mes A</label>
          <input type="month" className="border rounded-xl px-3 py-2"
                 value={mesA} onChange={e=>setMesA(e.target.value)} />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-slate-600 mb-1">Mes B</label>
          <input type="month" className="border rounded-xl px-3 py-2"
                 value={mesB} onChange={e=>setMesB(e.target.value)} />
        </div>
        <button onClick={comparar} className={btn} disabled={loading}>
          {loading ? "Calculando…" : "Comparar"}
        </button>
      </div>

      {err && <div className="text-rose-600 mb-3">Error: {err}</div>}

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500">Mes A ({mesA})</div>
          <div className="text-xl font-semibold">S/ {(res.A ?? 0).toFixed(2)}</div>
          <div className="text-xs text-slate-500">Pedidos: {res.cA ?? 0}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500">Mes B ({mesB})</div>
          <div className="text-xl font-semibold">S/ {(res.B ?? 0).toFixed(2)}</div>
          <div className="text-xs text-slate-500">Pedidos: {res.cB ?? 0}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500">Diferencia</div>
          <div className={`text-xl font-semibold ${dif>0?"text-emerald-600":dif<0?"text-rose-600":""}`}>
            {signo} S/ {Math.abs(dif).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Barras comparativas */}
      <div className="space-y-3">
        <div>
          <div className="text-xs text-slate-500 mb-1">Mes A ({mesA})</div>
          <div className="h-3 bg-slate-200 rounded-xl overflow-hidden">
            <div className="h-3 bg-blue-600" style={{ width: wA }} />
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Mes B ({mesB})</div>
          <div className="h-3 bg-slate-200 rounded-xl overflow-hidden">
            <div className="h-3 bg-slate-500" style={{ width: wB }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** --- Componente: Serie últimos N meses (con Exportar CSV) --- */
function SerieUltimosMeses() {
  const [n, setN] = useState(6);
  const endYM = ymFromDate();
  const { desde, hasta } = useMemo(() => lastNMonthsRange(n, endYM), [n, endYM]);
  const [data, setData] = useState<PeriodoMes[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function cargar() {
    try {
      setLoading(true); setErr(null);
      const r = await ventasPorMes(desde, hasta);
      setData(r.periodos);
    } catch (e:any) {
      setErr(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ cargar(); }, [n]);

  const max = Math.max(...data.map(d=>d.total), 1);

  function toCSV(rows: { mes: string; cantidad: number; total: number }[]) {
    const header = "mes,pedidos,total\n";
    const body = rows.map(r => `${r.mes},${r.cantidad},${r.total.toFixed(2)}`).join("\n");
    return header + body;
  }
  function exportCSV() {
    const csv = toCSV(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ventas_${desde}_a_${hasta}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-sm text-slate-600">Rango: {desde} → {hasta}</span>
        <div className="flex gap-2 ml-auto">
          {[3,6,12].map(k=>(
            <button key={k}
              className={`px-3 py-1.5 rounded-xl border ${n===k?"bg-blue-600 text-white border-blue-600":"border-slate-300"}`}
              onClick={()=>setN(k)}
            >{k}m</button>
          ))}
          <button className="px-3 py-1.5 rounded-xl border border-slate-300" onClick={exportCSV}>
            Exportar CSV
          </button>
        </div>
      </div>

      {err && <div className="text-rose-600 mb-3">Error: {err}</div>}

      {/* Mini columnas */}
      <div className="grid grid-cols-12 gap-2 items-end h-40 mb-3">
        {data.map((d,i)=>(
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-4 bg-blue-600 rounded-t"
                 style={{ height: `${Math.round((d.total / max) * 100)}%` }} />
            <div className="text-[10px] text-slate-500">{d.mes.slice(5)}</div>
          </div>
        ))}
      </div>

      <div className={tableWrap}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={th}>Mes</th>
              <th className={th}>Pedidos</th>
              <th className={th}>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d,i)=>(
              <tr key={i} className="hover:bg-slate-50">
                <td className={td}>{d.mes}</td>
                <td className={td}>{d.cantidad}</td>
                <td className={td}>S/ {d.total.toFixed(2)}</td>
              </tr>
            ))}
            {data.length===0 && <tr><td colSpan={3} className="p-6 text-center text-slate-500">Sin datos</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
