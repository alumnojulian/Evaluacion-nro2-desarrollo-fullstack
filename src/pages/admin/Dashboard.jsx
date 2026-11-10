import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/ConfirmModal';
import StockBadge from '../../components/StockBadge';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getUsuarios } from '../../lib/auth';
import { estadoStock, getOrdenes, getProductos, restablecerDatosDemo } from '../../lib/store';

export default function Dashboard() {
  const { usuario, refrescar } = useAuth();
  const { vaciar } = useCart();
  const navigate = useNavigate();
  const [confirmar, setConfirmar] = useState(false);
  const esAdmin = usuario.tipo === 'Administrador';
  const productos = getProductos();
  const criticos = productos.filter((p) => estadoStock(p) !== 'ok');

  const metricas = [
    { valor: productos.length, texto: 'Productos en catálogo', to: '/admin/productos' },
    { valor: criticos.length, texto: 'Productos con stock crítico o agotado', to: '/admin/productos?estado=critico', alerta: criticos.length > 0 },
    { valor: getOrdenes().length, texto: 'Órdenes recibidas', to: '/admin/ordenes' },
  ];
  if (esAdmin) metricas.push({ valor: getUsuarios().length, texto: 'Usuarios registrados', to: '/admin/usuarios' });

  const restablecer = () => {
    restablecerDatosDemo();
    vaciar();
    refrescar();
    navigate('/login');
  };

  return (
    <>
      <h1 className="mb-4 fs-2">¡Hola {usuario.tipo} {usuario.nombre}!</h1>
      <div className="row g-3 mb-4" aria-label="Resumen del sistema">
        {metricas.map((m) => (
          <div className="col-12 col-sm-6 col-xl-3" key={m.texto}>
            <Link to={m.to} className={`lug-metrica ${m.alerta ? 'lug-metrica--alerta' : ''}`}>
              <span className="lug-metrica__valor">{m.valor}</span>
              <span className="text-body-secondary small">{m.texto}</span>
            </Link>
          </div>
        ))}
      </div>
      <section className="mb-4" aria-labelledby="titulo-criticos">
        <h2 id="titulo-criticos" className="h5">
          Productos que necesitan reposición
        </h2>
        <div className="table-responsive lug-panel">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">Código</th>
                <th scope="col">Producto</th>
                <th scope="col">Stock</th>
                <th scope="col">Stock crítico</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {criticos.length ? (
                criticos.map((p) => (
                  <tr key={p.codigo}>
                    <td>{p.codigo}</td>
                    <td>{p.nombre}</td>
                    <td>{p.stock}</td>
                    <td>{p.stockCritico ?? '—'}</td>
                    <td>
                      <StockBadge producto={p} modo="admin" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-body-secondary">
                    Todo en orden: ningún producto está en nivel crítico.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {esAdmin && (
        <section aria-labelledby="titulo-demo">
          <h2 id="titulo-demo" className="h5">
            Datos de demostración
          </h2>
          <p className="text-body-secondary">Todo se guarda en este navegador (localStorage). Si quieres empezar de cero para una demostración, restablece los datos.</p>
          <button type="button" className="btn btn-outline-danger" onClick={() => setConfirmar(true)}>
            Restablecer datos de demostración
          </button>
        </section>
      )}
      <ConfirmModal
        abierto={confirmar}
        mensaje="Se borrarán productos, usuarios, órdenes y mensajes guardados en este navegador y volverán los datos iniciales. ¿Continuar?"
        textoBoton="Restablecer"
        onConfirmar={restablecer}
        onCancelar={() => setConfirmar(false)}
      />
    </>
  );
}
