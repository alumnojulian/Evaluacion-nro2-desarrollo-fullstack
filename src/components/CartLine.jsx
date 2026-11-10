import { formatoPrecio, rutaImagen } from '../lib/format';

// Línea del carrito. Props: producto, cantidad, onCambiar(codigo, cantidad), onQuitar(codigo)
export default function CartLine({ producto, cantidad, onCambiar, onQuitar }) {
  return (
    <article className="row g-3 align-items-center border-bottom py-3" data-codigo={producto.codigo}>
      <div className="col-4 col-md-3">
        <img src={rutaImagen(producto.imagen)} alt={producto.nombre} className="img-fluid rounded border" loading="lazy" />
      </div>
      <div className="col-8 col-md-5">
        <h3 className="h6">{producto.nombre}</h3>
        <p className="small text-body-secondary mb-1">
          {producto.categoria} · Código {producto.codigo}
        </p>
        <button type="button" className="btn btn-link btn-sm p-0" onClick={() => onQuitar(producto.codigo)}>
          Eliminar
        </button>
      </div>
      <div className="col-12 col-md-4 d-flex flex-md-column align-items-center align-items-md-end justify-content-between gap-2">
        <span className="lug-precio">{formatoPrecio(producto.precio)}</span>
        <div className="input-group input-group-sm w-auto" role="group" aria-label={`Cantidad de ${producto.nombre}`}>
          <button type="button" className="btn btn-outline-secondary" aria-label="Quitar una unidad" onClick={() => onCambiar(producto.codigo, cantidad - 1)}>
            −
          </button>
          <input
            type="number"
            className="form-control text-center lug-cantidad"
            min="1"
            max={producto.stock}
            value={cantidad}
            aria-label="Cantidad"
            onChange={(e) => onCambiar(producto.codigo, e.target.value)}
          />
          <button type="button" className="btn btn-outline-secondary" aria-label="Agregar una unidad" onClick={() => onCambiar(producto.codigo, cantidad + 1)}>
            +
          </button>
        </div>
      </div>
    </article>
  );
}
