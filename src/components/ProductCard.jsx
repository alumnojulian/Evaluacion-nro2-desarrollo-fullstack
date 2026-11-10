import { Link } from 'react-router-dom';
import StockBadge from './StockBadge';
import { formatoPrecio, rutaImagen } from '../lib/format';

// Tarjeta de producto (Bootstrap card). Props: producto y onAgregar(codigo)
export default function ProductCard({ producto, onAgregar }) {
  const agotado = producto.stock <= 0;
  return (
    <article className="card h-100 lug-tarjeta">
      <Link to={`/producto/${encodeURIComponent(producto.codigo)}`} className="text-decoration-none text-reset">
        <div className="position-relative lug-tarjeta__imagen">
          <img src={rutaImagen(producto.imagen)} className="card-img-top" alt={`Ilustración de ${producto.nombre}`} loading="lazy" />
          <StockBadge producto={producto} />
        </div>
        <h3 className="card-title h6 px-3 pt-3 mb-0 lug-tarjeta__titulo">{producto.nombre}</h3>
      </Link>
      <div className="card-body d-flex flex-column pt-1">
        <p className="small text-body-secondary mb-2">{producto.categoria}</p>
        <div className="d-flex align-items-center justify-content-between gap-2 mt-auto">
          <span className="lug-precio">{formatoPrecio(producto.precio)}</span>
          <button type="button" className="btn btn-primary btn-sm" disabled={agotado} onClick={() => onAgregar(producto.codigo)}>
            {agotado ? 'Sin stock' : 'Añadir'}
          </button>
        </div>
      </div>
    </article>
  );
}
