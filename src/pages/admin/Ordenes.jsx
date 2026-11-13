import DetalleOrden from '../../components/DetalleOrden';
import { fechaLegible, formatoCLP, pluralizar } from '../../lib/format';
import { getOrdenes } from '../../lib/store';

export default function Ordenes() {
  const ordenes = getOrdenes().slice().reverse();
  return (
    <>
      <h1 className="fs-2 mb-3">Órdenes</h1>
      <p className="text-body-secondary" aria-live="polite" data-testid="conteo-ordenes">
        {pluralizar(ordenes.length, 'orden', 'órdenes')}
      </p>
      <div className="table-responsive lug-panel">
        <table className="table table-dark table-hover align-middle mb-0">
          <caption className="visually-hidden">Listado de órdenes de compra</caption>
          <thead>
            <tr>
              <th scope="col">Orden</th>
              <th scope="col">Fecha</th>
              <th scope="col">Cliente</th>
              <th scope="col" className="text-end">Total</th>
              <th scope="col">Estado</th>
              <th scope="col">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.length ? (
              ordenes.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{fechaLegible(o.fecha)}</td>
                  <td>
                    {o.cliente}
                    <br />
                    <span className="text-body-secondary small">{o.correo}</span>
                  </td>
                  <td className="text-end text-nowrap">{formatoCLP(o.total)}</td>
                  <td>
                    <span className="badge text-bg-info">{o.estado}</span>
                  </td>
                  <td>
                    <DetalleOrden orden={o} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-body-secondary">
                  Aún no hay órdenes. Cuando un cliente pague desde el carrito, aparecerán aquí.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
