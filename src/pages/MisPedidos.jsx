import { Link, Navigate } from 'react-router-dom';
import DetalleOrden from '../components/DetalleOrden';
import PageTitle from '../components/PageTitle';
import { useAuth } from '../context/AuthContext';
import { fechaLegible, formatoCLP, pluralizar } from '../lib/format';
import { getOrdenesDeUsuario } from '../lib/store';

// Historial de pedidos del usuario con sesión (sus órdenes, de la más reciente a la más antigua)
export default function MisPedidos() {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login?aviso=pedidos&volver=mis-pedidos" replace />;
  const ordenes = getOrdenesDeUsuario(usuario.correo);

  return (
    <div className="container pb-4">
      <PageTitle titulo="Mis pedidos" subtitulo="Revisa el estado y el detalle de tus compras." />
      {ordenes.length === 0 ? (
        <div className="text-center border border-secondary-subtle rounded p-5">
          <p>Aún no tienes pedidos. Cuando pagues desde el carrito, tus compras aparecerán aquí.</p>
          <Link className="btn btn-primary" to="/productos">
            Ver productos
          </Link>
        </div>
      ) : (
        <>
          <p className="text-body-secondary" aria-live="polite" data-testid="conteo-pedidos">
            {pluralizar(ordenes.length, 'pedido', 'pedidos')}
          </p>
          <div className="table-responsive lug-panel">
            <table className="table table-dark table-hover align-middle mb-0">
              <caption className="visually-hidden">Historial de tus pedidos</caption>
              <thead>
                <tr>
                  <th scope="col">Pedido</th>
                  <th scope="col">Fecha</th>
                  <th scope="col" className="text-end">Total</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{fechaLegible(o.fecha)}</td>
                    <td className="text-end text-nowrap">{formatoCLP(o.total)}</td>
                    <td>
                      <span className="badge text-bg-info">{o.estado}</span>
                    </td>
                    <td>
                      <DetalleOrden orden={o} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
