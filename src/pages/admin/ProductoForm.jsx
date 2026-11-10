import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import FormProducto from '../../components/FormProducto';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { buscarProducto, estadoStock } from '../../lib/store';

// Nuevo producto (/admin/productos/nuevo) o edición / detalle (/admin/productos/:codigo)
export default function ProductoForm() {
  const { codigo } = useParams();
  const { usuario } = useAuth();
  const { mostrarToast } = useToast();
  const navigate = useNavigate();
  const esAdmin = usuario.tipo === 'Administrador';
  const editado = codigo ? buscarProducto(codigo) : null;

  if (!codigo && !esAdmin) return <Navigate to="/admin/productos" replace />;

  const guardado = (producto) => {
    const critico = estadoStock(producto) !== 'ok';
    mostrarToast(critico ? 'Producto guardado. ⚠ Quedó con stock crítico.' : 'Producto guardado correctamente.', critico ? 'aviso' : 'ok');
    navigate('/admin/productos');
  };

  const titulo = !codigo ? 'Nuevo producto' : esAdmin ? 'Editar producto' : 'Detalle del producto';
  return (
    <>
      <h1 className="fs-2 mb-4">{titulo}</h1>
      <section className="lug-tarjeta-form lug-tarjeta-form--ancha" aria-label={titulo}>
        <div className="p-4">
          {codigo && !editado ? (
            <p className="alert alert-danger" role="alert">
              No encontramos ese producto. <Link to="/admin/productos">Volver al listado</Link>
            </p>
          ) : (
            <FormProducto key={codigo || 'nuevo'} productoEditado={editado} soloLectura={!esAdmin} onGuardado={guardado} />
          )}
        </div>
      </section>
    </>
  );
}
