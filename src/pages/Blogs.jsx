import { Link } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import { BLOGS } from '../data/blogs';

export default function Blogs() {
  return (
    <div className="container pb-4">
      <PageTitle titulo="Noticias importantes" subtitulo="Consejos, guías y datos curiosos del mundo gamer." />
      <div className="d-grid gap-4">
        {BLOGS.map((b, i) => (
          <article className="lug-panel p-3 p-md-4" key={b.id}>
            <div className="row g-4 align-items-center">
              <div className={`col-md-5 ${i % 2 ? 'order-md-first' : ''}`}>
                <h2 className="h4">{b.titulo}</h2>
                <p className="text-body-secondary">{b.resumen}</p>
                <Link className="btn btn-outline-info" to={`/blogs/${b.id}`}>
                  Ver caso
                </Link>
              </div>
              <div className="col-md-7">
                <img src={b.imagen} className="img-fluid rounded lug-blog-imagen" alt={b.altImagen} loading="lazy" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
