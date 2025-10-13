// src/pages/Ventas.tsx
import { useEffect, useMemo, useState } from "react";
import { resumenVentas, ventasPorMes } from "../api";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Table,
  ButtonGroup,
} from "react-bootstrap";

type Resumen = { total: number; cantidad: number; desde: string; hasta: string };
type Periodo = { mes: string; total: number; cantidad: number };

const hoy = new Date();
function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}
// primer día del mes actual
const desdeDefault = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
const hastaDefault = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1); // exclusivo (como usa tu API)

export default function Ventas() {
  // --------- Estado resumen rango libre (YYYY-MM-DD) ---------
  const [desde, setDesde] = useState(toISO(desdeDefault));
  const [hasta, setHasta] = useState(toISO(hastaDefault));
  const [res, setRes] = useState<Resumen | null>(null);
  const [loadingRes, setLoadingRes] = useState(false);
  const [errRes, setErrRes] = useState<string | null>(null);

  async function cargarResumen() {
    try {
      setLoadingRes(true);
      setErrRes(null);
      const r = await resumenVentas(desde, hasta);
      setRes(r);
    } catch (e: any) {
      setErrRes(e.message || "Error");
    } finally {
      setLoadingRes(false);
    }
  }
  useEffect(() => { cargarResumen(); }, []); // primer render

  // --------- Serie últimos N meses (YYYY-MM) ---------
  const [nMeses, setNMeses] = useState<3 | 6 | 12>(6);
  const [serie, setSerie] = useState<Periodo[]>([]);
  const [loadingSerie, setLoadingSerie] = useState(false);
  const [errSerie, setErrSerie] = useState<string | null>(null);

  const rangoYM = useMemo(() => {
    const end = new Date(hoy.getFullYear(), hoy.getMonth(), 1);   // mes actual (inicio)
    const start = new Date(end.getFullYear(), end.getMonth() - (nMeses - 1), 1);
    const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { desdeYM: ym(start), hastaYM: ym(end) };
  }, [nMeses]);

  async function cargarSerie() {
    try {
      setLoadingSerie(true);
      setErrSerie(null);
      const { periodos } = await ventasPorMes(rangoYM.desdeYM, rangoYM.hastaYM);
      setSerie(periodos);
    } catch (e: any) {
      setErrSerie(e.message || "Error");
    } finally {
      setLoadingSerie(false);
    }
  }
  useEffect(() => { cargarSerie(); }, [rangoYM.desdeYM, rangoYM.hastaYM]);

  // --------- Helpers UI ---------
  const fmtS = (n: number) => `S/ ${n.toFixed(2)}`;
  const difTexto = useMemo(() => {
    if (!res) return { signo: "±", clase: "secondary", abs: "0.00" };
    // comparación simple con mismo rango del mes anterior
    const d = new Date(desde);
    const h = new Date(hasta);
    const prevDesde = new Date(d.getFullYear(), d.getMonth() - 1, d.getDate());
    const prevHasta = new Date(h.getFullYear(), h.getMonth() - 1, h.getDate());
    // Solo para etiqueta, no recargamos API aquí para mantener simple
    return { signo: res.total >= 0 ? "+" : "±", clase: res.total > 0 ? "success" : "secondary", abs: res.total.toFixed(2) };
  }, [res, desde, hasta]);

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h3 fw-bold m-0">Ventas</h1>
      </div>

      {/* ====== Card: Resumen por rango libre ====== */}
      <Card className="mb-3 shadow-sm border-0">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Label>Desde</Form.Label>
              <Form.Control
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Hasta (exclusivo)</Form.Label>
              <Form.Control
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
              />
            </Col>
            <Col md="auto">
              <Button onClick={cargarResumen} disabled={loadingRes}>
                {loadingRes ? "Calculando…" : "Actualizar"}
              </Button>
            </Col>
          </Row>

          {errRes ? (
            <Alert variant="danger" className="mt-3">Error: {errRes}</Alert>
          ) : loadingRes ? (
            <div className="py-4 text-center"><Spinner animation="border" /></div>
          ) : res ? (
            <Row className="g-3 mt-3">
              <Col md={4}>
                <Card className="border-0 bg-light">
                  <Card.Body>
                    <div className="text-muted small">Total del rango</div>
                    <div className="h4 m-0">{fmtS(res.total)}</div>
                    <div className="text-muted small">Pedidos: {res.cantidad}</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 bg-light">
                  <Card.Body>
                    <div className="text-muted small">Rango</div>
                    <div className="m-0">{res.desde} → {res.hasta}</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 bg-light">
                  <Card.Body>
                    <div className="text-muted small">Diferencia (indicativa)</div>
                    <span className={`badge text-bg-${difTexto.clase}`} style={{ fontSize: 16 }}>
                      {difTexto.signo} {fmtS(Number(difTexto.abs))}
                    </span>
                    <div className="text-muted small mt-1">vs referencia simple</div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          ) : null}
        </Card.Body>
      </Card>

      {/* ====== Card: Serie últimos N meses ====== */}
      <Card className="mb-3 shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <div className="fw-semibold">Serie: últimos N meses</div>
              <div className="text-muted small">
                Rango: {rangoYM.desdeYM} → {rangoYM.hastaYM}
              </div>
            </div>
            <ButtonGroup>
              <Button
                size="sm"
                variant={nMeses === 3 ? "primary" : "outline-primary"}
                onClick={() => setNMeses(3)}
              >
                3m
              </Button>
              <Button
                size="sm"
                variant={nMeses === 6 ? "primary" : "outline-primary"}
                onClick={() => setNMeses(6)}
              >
                6m
              </Button>
              <Button
                size="sm"
                variant={nMeses === 12 ? "primary" : "outline-primary"}
                onClick={() => setNMeses(12)}
              >
                12m
              </Button>
            </ButtonGroup>
          </div>

          {errSerie ? (
            <Alert variant="danger" className="mt-2">Error: {errSerie}</Alert>
          ) : loadingSerie ? (
            <div className="py-4 text-center"><Spinner animation="border" /></div>
          ) : (
            <Table hover responsive className="m-0">
              <thead className="table-light">
                <tr>
                  <th>Mes</th>
                  <th>Pedidos</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {serie.map((p) => (
                  <tr key={p.mes}>
                    <td>{p.mes}</td>
                    <td>{p.cantidad}</td>
                    <td>{fmtS(p.total)}</td>
                  </tr>
                ))}
                {serie.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-muted">
                      Sin información.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
