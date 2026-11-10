import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { BLOGS } from '../data/blogs';

// Artículo de blog (reemplaza blog-1.html y blog-2.html): el contenido viene de data/blogs.js
export default function BlogArticulo() {
  const { id } = useParams();
  const blog = BLOGS.find((b) => b.id === id);
  if (!blog) {
    return (
      <div className="container py-5 text-center">
        <h2>No encontramos ese artículo</h2>
        <Link className="btn btn-primary" to="/blogs">
          Volver a blogs
        </Link>
      </div>
    );
  }
  const a = blog.articulo;
  return (
    <article className="container lug-articulo pb-5">
      <Breadcrumb items={[{ texto: 'Home', to: '/' }, { texto: 'Blogs', to: '/blogs' }, { texto: a.migas }]} />
      <header className="mb-3">
        <h1>{a.titulo}</h1>
        <p className="text-body-secondary">{a.meta}</p>
      </header>
      <figure className="rounded overflow-hidden border mb-4">
        <img src={blog.imagen} className="img-fluid w-100" alt={a.altImagen} />
      </figure>
      <p>{a.intro}</p>
      {a.secciones.map((s) => (
        <section key={s.titulo}>
          <h2 className="h4 mt-4">{s.titulo}</h2>
          {s.texto && <p className="text-body-secondary">{s.texto}</p>}
          {s.lista && (
            <ul className="text-body-secondary">
              {s.lista.map((li) => (
                <li key={li}>{li}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
      <p className="mt-4">
        <Link className="btn btn-primary" to={`/productos?categoria=${encodeURIComponent(a.categoria)}`}>
          {a.textoBoton}
        </Link>
      </p>
    </article>
  );
}
