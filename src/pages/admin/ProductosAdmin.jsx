import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CampoForm from '../../components/CampoForm';
import ConfirmModal from '../../components/ConfirmModal';
import StockBadge from '../../components/StockBadge';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { eliminarProducto, estadoStock, getProductos } from '../../lib/store';
import { formatoPrecio, pluralizar } from '../../lib/format';

export default function ProductosAdmin() {
  const { usuario } = useAuth();
  const { quitar } = useCart();
  const { mostrarToast } = useToast();
  const [params] = useSearchParams();
  const esAdmin = usuario.tipo === 'Administrador';
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState(params.get('estado') === 'critico' ? 'critico' : '');
  const [aEliminar, setAEliminar] = useState(null);
  const [, releer] = useState(0); // fuerza la relectura de los datos tras eliminar

  const lista = getProductos().filter((p) => {
    if (q.trim() && !`${p.codigo} ${p.nombre} ${p.categoria}`.toLowerCase().includes(q.trim().toLowerCase())) return false;
    if (estado === 'critico' && estadoStock(p) === 'ok') return false;
    return true;
  });

  const confirmarEliminar = () => {
    eliminarProducto(aEliminar.codigo);
    quitar(aEliminar.codigo);
    setAEliminar(null);
    releer((v) => v + 1);
    mostrarToast('Producto eliminado.');
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 className="fs-2 mb-0">Productos</h1>
        {esAdmin && (
          <Link className="btn btn-primary" to="/admin/productos/nuevo">
            Nuevo producto
          </Link>
        )}
      </div>
      <div className="row g-3 align-items-end">
        <div className="col-12 col-md-4">
          <CampoForm id="buscar-producto" name="q" label="Buscar" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Código, nombre o categoría" autoComplete="off" />
        </div>
        <div className="col-12 col-md-4">
          <CampoForm id="filtro-estado" name="estado" label="Mostrar" as="select" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos los productos</option>
            <option value="critico">Solo stock crítico o agotado</option>
          </CampoForm>
        </div>
        <div className="col-12 col-md-4">
          <p className="text-body-secondary mb-3" aria-live="polite" data-testid="conteo-productos">
            {pluralizar(lista.length, 'producto', 'productos')}
          </p>
        </div>
      </div>
      <div className="table-responsive lug-panel">
        <table className="table table-dark table-hover align-middle mb-0">
          <caption className="visually-hidden">Listado de productos</caption>
          <thead>
            <tr>
              <th scope="col">Código</th>
              <th scope="col">Nombre</th>
              <th scope="col">Categoría</th>
              <th scope="col" className="text-end">Precio</th>
              <th scope="col" className="text-end">Stock</th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.length ? (
              lista.map((p) => (
                <tr key={p.codigo}>
                  <td>{p.codigo}</td>
                  <td>{p.nombre}</td>
                  <td>{p.categoria}</td>
                  <td className="text-end text-nowrap">{formatoPrecio(p.precio)}</td>
                  <td className="text-end">{p.stock}</td>
                  <td>
                    <StockBadge producto={p} modo="admin" />
                  </td>
                  <td className="text-nowrap">
                    <Link className="btn btn-outline-info btn-sm me-1" to={`/admin/productos/${encodeURIComponent(p.codigo)}`}>
                      {esAdmin ? 'Editar' : 'Ver detalle'}
                    </Link>
                    {esAdmin && (
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setAEliminar(p)}>
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-body-secondary">
                  No hay productos que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ConfirmModal
        abierto={Boolean(aEliminar)}
        mensaje={aEliminar ? `¿Eliminar "${aEliminar.nombre}" (${aEliminar.codigo})? Esta acción no se puede deshacer.` : ''}
        textoBoton="Eliminar"
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </div>
  );
}
