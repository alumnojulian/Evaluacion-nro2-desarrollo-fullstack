import { CATEGORIAS } from '../data/productos';
import CampoForm from './CampoForm';

export const FILTROS_VACIOS = { q: '', categoria: '', precioMax: '', orden: '' };

export function errorPrecioMax(precioMax) {
  if (precioMax === '') return '';
  const n = Number(precioMax);
  return !Number.isFinite(n) || n < 0 ? 'El precio máximo debe ser un número mayor o igual a 0.' : '';
}

// Filtros del catálogo (componente controlado). Props: filtros, onCambio(nuevosFiltros), onLimpiar()
export default function ProductFilters({ filtros, onCambio, onLimpiar }) {
  const cambiar = (e) => onCambio({ ...filtros, [e.target.name]: e.target.value });
  return (
    <form className="row g-3 align-items-end lug-panel p-3 mb-3" role="search" aria-label="Filtros de productos" onSubmit={(e) => e.preventDefault()}>
      <div className="col-12 col-md-6 col-lg-3">
        <CampoForm id="filtro-q" name="q" label="Buscar" type="search" value={filtros.q} onChange={cambiar} placeholder="Nombre, código o marca" autoComplete="off" />
      </div>
      <div className="col-12 col-md-6 col-lg-3">
        <CampoForm id="filtro-categoria" name="categoria" label="Categoría" as="select" value={filtros.categoria} onChange={cambiar}>
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </CampoForm>
      </div>
      <div className="col-6 col-lg-2">
        <CampoForm id="filtro-precio" name="precioMax" label="Precio máximo (CLP)" type="number" min="0" step="1000" value={filtros.precioMax} onChange={cambiar} placeholder="Sin límite" error={errorPrecioMax(filtros.precioMax)} />
      </div>
      <div className="col-6 col-lg-3">
        <CampoForm id="filtro-orden" name="orden" label="Ordenar por" as="select" value={filtros.orden} onChange={cambiar}>
          <option value="">Orden del catálogo</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
          <option value="nombre">Nombre (A-Z)</option>
        </CampoForm>
      </div>
      <div className="col-12 col-lg-1 mb-3">
        <button type="button" className="btn btn-outline-info w-100" onClick={onLimpiar}>
          Limpiar
        </button>
      </div>
    </form>
  );
}
