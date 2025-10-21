// src/generadorPDF.ts
import jsPDF from 'jspdf';
import logoImg from './assets/logo.png';  // 👈 AGREGAR ESTA LÍNEA
import facebookIcon from './assets/facebook.png';  // 👈 AGREGAR
import instagramIcon from './assets/instagram.png'; // 👈 AGREGAR
import tiktokIcon from './assets/tiktok.png';       // 

type TipoDocumento = 'boleta' | 'factura' | 'recibo';

interface ProductoVenta {
  marca: string;
  modelo: string;
  imei_1: string;
  imei_2?: string;
}

interface DatosDocumento {
  // Datos de la venta
  numeroDocumento: number;
  fecha: string;
  fechaVencimiento?: string;
  
  // Datos del cliente
  clienteNombre: string;
  clienteDNI?: string;
  clienteRUC?: string;  // 👈 AGREGAR ESTA LÍNEA
  
  // Datos del producto
  productos: ProductoVenta[];
  
  // Precios
  totalSinIGV: number;
  totalConIGV: number;
  
  // Campos opcionales
  observacion?: string;
  accesorios?: string;
}

const formatCurrency = (value: number) => {
  return `S/ ${value.toFixed(2)}`;
};

const formatFecha = (fecha: string) => {
  const [year, month, day] = fecha.split('-');
  return `${day}/${month}/${year}`;
};

export function generarDocumentoPDF(tipo: TipoDocumento, datos: DatosDocumento) {
  const doc = new jsPDF();
  
  // Configuración de márgenes
  const margenIzq = 20;
  const margenDer = 190;
  let yPos = 20;
  

// ENCABEZADO
  
  // 👇 AGREGAR LOGO
  try {
    doc.addImage(logoImg, 'PNG', margenIzq, yPos - 5, 25, 25);  // x, y, ancho, alto
  } catch (e) {
    console.error('Error cargando logo:', e);
  }
  
  // 👇 AGREGAR REDES SOCIALES HORIZONTALES EN LA PARTE SUPERIOR
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  
  const redesYPos = 15; // Posición vertical (arriba)
  let redesXPos = margenDer - 140; // Posición inicial desde la derecha
  const iconSize = 4; // Tamaño de los iconos
  const iconTextGap = 2; // Espacio entre icono y texto
  const redesSpacing = 35; // Espacio entre cada red social
  
  try {
    // Facebook
    doc.addImage(facebookIcon, 'PNG', redesXPos, redesYPos, iconSize, iconSize);
    doc.text('Alfa.Mobile.Pe', redesXPos + iconSize + iconTextGap, redesYPos + 3);
    redesXPos += 25;
    
    // Instagram
    doc.addImage(instagramIcon, 'PNG', redesXPos, redesYPos, iconSize, iconSize);
    doc.text('alfa_mobile_pe', redesXPos + iconSize + iconTextGap, redesYPos + 3);
    redesXPos += 25;
    
    // TikTok
    doc.addImage(tiktokIcon, 'PNG', redesXPos, redesYPos, iconSize, iconSize);
    doc.text('alfa_mobile_pe', redesXPos + iconSize + iconTextGap, redesYPos + 3);
  } catch (e) {
    console.error('Error cargando iconos de redes:', e);
  }
  
  doc.setTextColor(0, 0, 0); // Resetear color
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  yPos += 25;
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ALFAMOBILE', margenIzq, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('TIENDA DE TECNOLOGÍA', margenIzq, yPos);
  
  yPos += 15;
  
  // INFORMACIÓN DE LA EMPRESA
  doc.setFontSize(9);
  doc.text('CORPORACION ALFA-MOBILE', margenIzq, yPos);
  yPos += 5;
  doc.text('CALLE JOSÉ LEGUIA Y MELENDEZ 980, PUEBLO LIBRE', margenIzq, yPos);
  yPos += 5;
  doc.text('CENTRO COMERCIAL ANDALUCÍA TIENDA 58A-PUEBLO LIBRE', margenIzq, yPos);
  yPos += 5;
  doc.text('PUEBLO LIBRE, LIMA - LIMA', margenIzq, yPos);
  
  yPos += 10;

  
  // CUADRO DE GARANTÍA/TIPO DE DOCUMENTO
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(margenDer - 50, 20, 50, 15);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const tituloDoc = tipo === 'boleta' ? 'BOLETA' : tipo === 'factura' ? 'FACTURA' : 'RECIBO';
  doc.text(tituloDoc, margenDer - 25, 28, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('RUC 20610814876', margenDer - 25, 33, { align: 'center' });
  
  yPos += 5;
  
  // LÍNEA SEPARADORA
  doc.setLineWidth(0.3);
  doc.line(margenIzq, yPos, margenDer, yPos);
  
  yPos += 10;
  
  // DATOS DE VENTA (fondo azul)
  doc.setFillColor('#7FEFEA');
  doc.rect(margenIzq, yPos, margenDer - margenIzq, 7, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DE VENTA', margenIzq + 2, yPos + 5);
  doc.setTextColor(0, 0, 0);
  
  yPos += 12;
  
  // Información de la venta
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const fechaVenta = formatFecha(datos.fecha);
  const fechaVenc = datos.fechaVencimiento ? formatFecha(datos.fechaVencimiento) : fechaVenta;
  
  doc.text(`Fecha de venta           : ${fechaVenta}`, margenIzq, yPos);
  yPos += 5;
  
  doc.text(`Cliente                  : ${datos.clienteNombre}`, margenIzq, yPos);
  yPos += 5;
  
  doc.text(`DNI                      : ${datos.clienteDNI || ''}`, margenIzq, yPos);
  yPos += 5;
  
  // 👇 MOSTRAR RUC SOLO EN FACTURAS
  if (tipo === 'factura') {
    doc.text(`RUC                      : ${datos.clienteRUC || ''}`, margenIzq, yPos);
    yPos += 5;
  }
  
  doc.text(`Tipo de Moneda           : Soles`, margenIzq, yPos);
  yPos += 5;
  
  doc.text(`Observación              : ${datos.observacion || 'Seminuevo - Libre de Fabrica'}`, margenIzq, yPos);
  yPos += 10;
  
  // CUADRO DE IMPORTE (solo título por ahora)
  doc.setFillColor(240, 240, 240);
  doc.rect(margenIzq, yPos, margenDer - margenIzq, 7, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Importe de venta (**)', margenDer - 5, yPos + 5, { align: 'right' });
  
  yPos += 15;
  
  // TOTALES según tipo de documento
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (tipo === 'factura') {
    // FACTURA: Mostrar desglose
    const igv = datos.totalConIGV - datos.totalSinIGV;
    
    doc.text('Subtotal:', margenDer - 60, yPos);
    doc.text(formatCurrency(datos.totalSinIGV), margenDer - 5, yPos, { align: 'right' });
    yPos += 6;
    
    doc.text('IGV (18%):', margenDer - 60, yPos);
    doc.text(formatCurrency(igv), margenDer - 5, yPos, { align: 'right' });
    yPos += 8;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', margenDer - 60, yPos);
    doc.text(formatCurrency(datos.totalConIGV), margenDer - 5, yPos, { align: 'right' });
    
  } else if (tipo === 'recibo') {
    // RECIBO: Solo total sin IGV
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', margenDer - 60, yPos);
    doc.text(formatCurrency(datos.totalSinIGV), margenDer - 5, yPos, { align: 'right' });
    
  } else {
    // BOLETA: Solo total con IGV
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', margenDer - 60, yPos);
    doc.text(formatCurrency(datos.totalConIGV), margenDer - 5, yPos, { align: 'right' });
  }
  
  yPos += 15;
  
  // DATOS DEL EQUIPO (fondo azul)
  doc.setFillColor('#7FEFEA');
  doc.rect(margenIzq, yPos, margenDer - margenIzq, 7, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL EQUIPO', margenIzq + 2, yPos + 5);
  doc.setTextColor(0, 0, 0);
  
  yPos += 12;
  
  // Información del producto (solo el primero por ahora)
  if (datos.productos.length > 0) {
    const producto = datos.productos[0];
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Marca        : ${producto.marca}`, margenIzq, yPos);
    yPos += 5;
    doc.text(`Modelo       : ${producto.modelo}`, margenIzq, yPos);
    yPos += 5;
    doc.text(`N° serie     : ${producto.imei_1}`, margenIzq, yPos);
    yPos += 5;
    doc.text(`Accesorios   : ${datos.accesorios || 'Cubo 20w, Cable Tipo C-C, mica y case'}`, margenIzq, yPos);
    
    // Mostrar precio en la columna derecha
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Importe', margenDer - 5, yPos - 15, { align: 'right' });
    
    const precioMostrar = tipo === 'recibo' ? datos.totalSinIGV : datos.totalConIGV;
    doc.text(formatCurrency(precioMostrar), margenDer - 5, yPos - 8, { align: 'right' });
  }
  
  yPos += 15;
  
  // TEXTO LEGAL DE DEVOLUCIONES
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  
  const textoLegal = 'La garantía limitada otorgada por la compra de este producto perderá validez si se evidencia cualquier daño físico (golpes, abolladuras, rupturas, rajaduras), exposición a líquidos, humedad, sulfatación o manipulación indebida del equipo, hardware, software o sistema operativo. Asimismo, se invalida en caso de uso de tarjetas SIM bloqueadas o de procedencia dudosa que comprometan el correcto funcionamiento del dispositivo. El tiempo máximo de evaluación de garantía es de 72 horas hábiles. No se realizan devoluciones ni reembolsos. En caso de aprobación de la garantía, se reemplazará el producto por otro igual o equivalente.';
  
  const lineasTexto = doc.splitTextToSize(textoLegal, margenDer - margenIzq);
  doc.text(lineasTexto, margenIzq, yPos);
  
  yPos += lineasTexto.length * 3 + 5;
  
  const textoLegal2 = 'Toda garantía tendrá un tiempo de respuesta máximo de 72 horas. NO HACEMOS REEMBOLSOS NI DEVOLUCIONES, pero si la garantía es aprobada, se le puede cambiar el producto por uno idéntico o similar.';
  
  const lineasTexto2 = doc.splitTextToSize(textoLegal2, margenDer - margenIzq);
  doc.text(lineasTexto2, margenIzq, yPos);
  
  yPos += lineasTexto2.length * 3 + 15;
  
  // FIRMAS
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  doc.line(margenIzq, yPos, margenIzq + 50, yPos);
  doc.line(margenDer - 50, yPos, margenDer, yPos);
  
  yPos += 5;
  doc.text('Representante de tienda', margenIzq + 25, yPos, { align: 'center' });
  doc.text('Cliente', margenDer - 25, yPos, { align: 'center' });
  
  yPos += 10;
  
  // INFORMACIÓN DE CONTACTO (footer)
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('Centros de atención: Pueblo Libre', 105, 280, { align: 'center' });
  
  // Guardar PDF
  const nombreArchivo = `${tituloDoc}_${datos.numeroDocumento}_${datos.clienteNombre.replace(/\s+/g, '_')}.pdf`;
  doc.save(nombreArchivo);
}