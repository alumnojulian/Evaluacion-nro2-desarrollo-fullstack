import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import ProductGrid from '../components/ProductGrid';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { buscarProducto, estadoStock, getProductos } from '../lib/store';
import { formatoPrecio, rutaImagen } from '../lib/format';

const TEXTO_STOCK = (p, estado) =>
  estado === 'agotado' ? 'Sin stock por ahora.' : estado === 'critico' ? `¡Quedan pocas unidades! Stock disponible: ${p.stock}.` : `Stock disponible: ${p.stock} unidades.`;

const CLASE_STOCK = { ok: 'text-success', critico: 'text-warning', agotado: 'text-danger' };

export default function DetalleProducto() {
  const { codigo } = useParams();
  const producto = buscarProducto(codigo);
  const { agregar } = useCart();
  const { mostrarToast } = useToast();
  const [cantidad, setCantidad] = useState(1);

  if (!producto) {
    return (
      <div className="container py-5 text-center">
        <h2>No encontramos ese producto</h2>
        <p>Puede que el enlace esté incompleto o que el producto ya no esté a la venta.</p>
        <Link className="btn btn-primary" to="/productos">
          Volver a productos
        </Link>
      </div>
    );
  }

  const estado = estadoStock(producto);
  const maxSelect = Math.min(producto.stock, 10);
  const relacionados = getProductos()
    .filter((x) => x.codigo !== producto.codigo)
    .sort((a, b) => (b.categoria === producto.categoria) - (a.categoria === producto.categoria))
    .slice(0, 4);
  const urlActual = encodeURIComponent(window.location.href);
  const texto = encodeURIComponent(`Mira ${producto.nombre} en Level-Up Gamer por ${formatoPrecio(producto.precio)}`);

  const alAgregar = () => {
    const r = agregar(producto.codigo, Number(cantidad));
    mostrarToast(r.mensaje, r.ok ? 'ok' : 'error');
  };

  return (
    <div className="container pb-4">
      <Breadcrumb
        items={[
          { texto: 'Home', to: '/' },
          { texto: producto.categoria, to: `/productos?categoria=${encodeURIComponent(producto.categoria)}` },
          { texto: producto.nombre },
        ]}
      />
      <div className="row g-4">
        <div className="col-md-6">
          <figure className="lug-panel m-0 overflow-hidden">
            <img src={rutaImagen(producto.imagen)} className="img-fluid w-100" alt={`Ilustración de ${producto.nombre}`} />
          </figure>
        </div>
        <div className="col-md-6">
          <div className="d-flex flex-wrap justify-content-between align-items-baseline gap-2 border-bottom pb-2 mb-3">
            <h2 className="mb-0">{producto.nombre}</h2>
            <p className="lug-precio fs-3 mb-0">{formatoPrecio(producto.precio)}</p>
          </div>
          <p className="text-body-secondary">{producto.descripcion || 'Este producto aún no tiene descripción.'}</p>
          <dl className="row border-top border-bottom py-3 my-3">
            <div className="col-6">
              <dt className="small text-body-secondary">Código</dt>
              <dd>{producto.codigo}</dd>
            </div>
            <div className="col-6">
              <dt className="small text-body-secondary">Categoría</dt>
              <dd>{producto.categoria}</dd>
            </div>
            <div className="col-6">
              <dt className="small text-body-secondary">Fabricante</dt>
              <dd className="mb-0">{producto.fabricante || 'Por confirmar'}</dd>
            </div>
            <div className="col-6">
              <dt className="small text-body-secondary">Distribuidor</dt>
              <dd className="mb-0">{producto.distribuidor || 'Level-Up Gamer'}</dd>
            </div>
          </dl>
          <p className={`fw-medium ${CLASE_STOCK[estado]}`}>{TEXTO_STOCK(producto, estado)}</p>
          {estado !== 'agotado' && (
            <div className="mb-3 lug-campo-corto">
              <label htmlFor="cantidad" className="form-label">
                Cantidad
              </label>
              <select id="cantidad" className="form-select" value={cantidad} onChange={(e) => setCantidad(e.target.value)}>
                {Array.from({ length: maxSelect }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button type="button" className="btn btn-primary btn-lg" disabled={estado === 'agotado'} onClick={alAgregar}>
            Añadir al carrito
          </button>
          <p className="small text-body-secondary mt-3">
            Compartir:{' '}
            <a href={`https://wa.me/?text=${texto}%20${urlActual}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>{' '}
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${urlActual}`} target="_blank" rel="noopener noreferrer">
              Facebook
            </a>{' '}
            <a href={`https://twitter.com/intent/tweet?text=${texto}&url=${urlActual}`} target="_blank" rel="noopener noreferrer">
              X
            </a>
          </p>
        </div>
      </div>
      <section className="mt-5" aria-labelledby="titulo-relacionados">
        <h2 id="titulo-relacionados">También te puede interesar</h2>
        <ProductGrid productos={relacionados} cuatro />
      </section>
    </div>
  );
}
