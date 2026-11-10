import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import ProductFilters, { FILTROS_VACIOS } from '../components/ProductFilters';
import ProductGrid from '../components/ProductGrid';
import { CATEGORIAS } from '../data/productos';
import { filtrarProductos, getProductos } from '../lib/store';
import { pluralizar } from '../lib/format';

// Listado con filtros (estado local). La categoría inicial puede venir del enlace del footer (?categoria=)
export default function Productos() {
  const [params] = useSearchParams();
  const catInicial = params.get('categoria');
  const [filtros, setFiltros] = useState({
    ...FILTROS_VACIOS,
    categoria: catInicial && CATEGORIAS.includes(catInicial) ? catInicial : '',
  });
  const lista = filtrarProductos(getProductos(), filtros);

  return (
    <div className="container pb-4">
      <PageTitle titulo="Productos" subtitulo="Filtra por categoría, precio o nombre para encontrar tu próximo equipo." />
      <ProductFilters filtros={filtros} onCambio={setFiltros} onLimpiar={() => setFiltros(FILTROS_VACIOS)} />
      <p className="text-body-secondary" aria-live="polite" data-testid="conteo">
        {pluralizar(lista.length, 'producto', 'productos')}
      </p>
      {lista.length ? (
        <ProductGrid productos={lista} />
      ) : (
        <div className="text-center border border-secondary-subtle rounded p-5">
          <p className="mb-0">No encontramos productos con esos filtros. Prueba con otra categoría o quita el precio máximo.</p>
        </div>
      )}
    </div>
  );
}
