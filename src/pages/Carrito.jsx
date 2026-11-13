import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartLine from '../components/CartLine';
import CartSummary from '../components/CartSummary';
import CouponForm from '../components/CouponForm';
import PageTitle from '../components/PageTitle';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatoCLP } from '../lib/format';

export default function Carrito() {
  const { resumen, cambiar, quitar, aplicarCupon, pagar } = useCart();
  const { mostrarToast } = useToast();
  const navigate = useNavigate();
  const [orden, setOrden] = useState(null);

  const alCambiar = (codigo, cantidad) => {
    const r = cambiar(codigo, cantidad);
    if (!r.ok) mostrarToast(r.mensaje, 'error');
  };

  const alQuitar = (codigo) => {
    quitar(codigo);
    mostrarToast('Producto eliminado del carrito.');
  };

  const alAplicar = (codigo) => {
    const r = aplicarCupon(codigo);
    if (r.ok) mostrarToast(`Cupón ${r.codigo} aplicado.`);
  };

  const alPagar = () => {
    const r = pagar();
    if (r.requiereLogin) {
      navigate('/login?aviso=pago&volver=carrito');
      return;
    }
    if (!r.ok) {
      mostrarToast(r.mensaje, 'error');
      return;
    }
    setOrden(r.orden);
  };

  if (orden) {
    return (
      <div className="container py-5">
        <section className="alert alert-success text-center" tabIndex="-1" aria-label="Compra realizada">
          <h2>¡Compra realizada!</h2>
          <p className="mx-auto">
            Tu orden <strong data-testid="numero-orden">{orden.id}</strong> por <strong>{formatoCLP(orden.total)}</strong> quedó registrada como pendiente. El pago es
            simulado en esta entrega.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-2">
            <Link className="btn btn-primary" to="/mis-pedidos">
              Ver mis pedidos
            </Link>
            <Link className="btn btn-outline-light" to="/productos">
              Seguir comprando
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="container pb-4">
      <PageTitle titulo="Mi carrito de compras" />
      {resumen.lineas.length === 0 ? (
        <div className="text-center border border-secondary-subtle rounded p-5">
          <p>Tu carrito está vacío. Agrega productos para empezar a subir de nivel.</p>
          <Link className="btn btn-primary" to="/productos">
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          <section className="col-lg-8" aria-label="Productos en el carrito">
            {resumen.lineas.map(({ producto, cantidad }) => (
              <CartLine key={producto.codigo} producto={producto} cantidad={cantidad} onCambiar={alCambiar} onQuitar={alQuitar} />
            ))}
          </section>
          <aside className="col-lg-4" aria-labelledby="titulo-resumen">
            <div className="lug-panel p-3 sticky-lg-top lug-resumen">
              <h2 id="titulo-resumen" className="h5">
                Resumen del pedido
              </h2>
              <CartSummary resumen={resumen} />
              <CouponForm subtotal={resumen.subtotal} onAplicar={alAplicar} />
              <button type="button" className="btn btn-primary btn-lg w-100 mt-3" onClick={alPagar}>
                Pagar
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
