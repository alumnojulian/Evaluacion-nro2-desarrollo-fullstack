import { formatoCLP, pluralizar } from '../lib/format';

// Detalle desplegable de una orden (productos y descuento). Props: orden. Lo usan Mis pedidos y el panel
export default function DetalleOrden({ orden }) {
  return (
    <details>
      <summary>Ver {pluralizar(orden.items.length, 'producto', 'productos')}</summary>
      <ul className="mt-2 ps-3 mb-0">
        {orden.items.map((i) => (
          <li key={i.codigo}>
            {i.cantidad} × {i.nombre} <span className="text-body-secondary">({formatoCLP(i.precio)} c/u)</span>
          </li>
        ))}
        {orden.descuento > 0 && <li className="text-body-secondary">Descuento aplicado: −{formatoCLP(orden.descuento)}</li>}
      </ul>
    </details>
  );
}
