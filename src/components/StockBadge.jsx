import { estadoStock } from '../lib/store';

const ETIQUETAS = { agotado: 'Agotado', critico: 'Stock crítico', ok: 'Disponible' };
const CLASES = { agotado: 'text-bg-danger', critico: 'text-bg-warning', ok: 'text-bg-success' };

// Etiqueta de estado del stock. modo="tarjeta" muestra el aviso para clientes; modo="admin" el estado interno.
export default function StockBadge({ producto, modo = 'tarjeta' }) {
  const estado = estadoStock(producto);
  if (modo === 'admin') return <span className={`badge ${CLASES[estado]}`}>{ETIQUETAS[estado]}</span>;
  if (estado === 'agotado') return <span className="badge text-bg-danger lug-etiqueta-tarjeta">Sin stock</span>;
  if (estado === 'critico') return <span className="badge text-bg-warning lug-etiqueta-tarjeta">Últimas {producto.stock} unidades</span>;
  return null;
}
