import { Link } from 'react-router-dom';

// Migas de pan. Props: items = [{ texto, to? }]; el último es la página actual
export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Ruta de navegación" className="mt-4">
      <ol className="breadcrumb">
        {items.map((it, i) =>
          i === items.length - 1 ? (
            <li key={it.texto} className="breadcrumb-item active" aria-current="page">
              {it.texto}
            </li>
          ) : (
            <li key={it.texto} className="breadcrumb-item">
              <Link to={it.to}>{it.texto}</Link>
            </li>
          )
        )}
      </ol>
    </nav>
  );
}
