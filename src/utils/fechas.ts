function fmt(y: number, m: number, d: number) {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`; // YYYY-MM-DD en hora local (sin UTC shift)
}

export function rangosMesActualYAnterior(fechaBase = new Date()) {
  const y = fechaBase.getFullYear();
  const m = fechaBase.getMonth(); // 0..11

  // Este mes
  const iniEste = fmt(y, m, 1);
  const nextY = m === 11 ? y + 1 : y;
  const nextM = (m + 1) % 12;
  const finEste = fmt(nextY, nextM, 1); // usamos "< fin"

  // Mes pasado
  const prevY = m === 0 ? y - 1 : y;
  const prevM = m === 0 ? 11 : m - 1;
  const iniPasado = fmt(prevY, prevM, 1);
  const finPasado = fmt(y, m, 1);

  return {
    este: { desde: iniEste, hasta: finEste },
    pasado: { desde: iniPasado, hasta: finPasado },
  };
}

export function ymFromDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`; // YYYY-MM
}

export function addMonths(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number);
  const base = new Date(y, m - 1 + delta, 1);
  return ymFromDate(base);
}

export function lastNMonthsRange(n: number, endYM = ymFromDate(new Date())) {
  const desde = addMonths(endYM, -(n - 1));
  return { desde, hasta: endYM };
}

export function rangoYTD(fechaBase = new Date()) {
  const y = fechaBase.getFullYear();
  const desde = `${y}-01-01`;
  // usamos "< hasta", así que sumamos 1 día a hoy
  const d = new Date(fechaBase);
  d.setDate(d.getDate() + 1);
  const hasta = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  return { desde, hasta };
}


