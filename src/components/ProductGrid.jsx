import ProductCard from './ProductCard';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

// Cuadrícula responsiva de tarjetas: 1 columna en móvil, 2 en tablet y 3 o 4 en escritorio
export default function ProductGrid({ productos, cuatro = false }) {
  const { agregar } = useCart();
  const { mostrarToast } = useToast();

  const alAgregar = (codigo) => {
    const r = agregar(codigo, 1);
    mostrarToast(r.mensaje, r.ok ? 'ok' : 'error');
  };

  return (
    <div className={`row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-3 ${cuatro ? 'row-cols-xl-4' : ''}`}>
      {productos.map((p) => (
        <div className="col" key={p.codigo}>
          <ProductCard producto={p} onAgregar={alAgregar} />
        </div>
      ))}
    </div>
  );
}
