import { Link } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import LevelSteps from '../components/LevelSteps';
import { getProductos } from '../lib/store';

export default function Home() {
  const destacados = getProductos().slice(0, 8);
  return (
    <>
      <section className="container py-5" aria-labelledby="titulo-hero">
        <div className="row align-items-center g-4">
          <div className="col-lg-6">
            <h1 id="titulo-hero" className="mb-3">
              Sube de nivel con tu setup gamer
            </h1>
            <p className="lead text-body-secondary">
              Consolas, computadores, sillas y accesorios seleccionados para la comunidad gamer, con despacho a todo Chile.
            </p>
            <p className="text-body-secondary">Regístrate con tu correo Duoc y obtén 20 % de descuento de por vida.</p>
            <div className="d-flex flex-wrap gap-2 mt-4">
              <Link className="btn btn-primary btn-lg" to="/productos">
                Ver productos
              </Link>
              <Link className="btn btn-outline-info btn-lg" to="/registro">
                Crear cuenta
              </Link>
            </div>
          </div>
          <div className="col-lg-6">
            <figure className="lug-hero-imagen m-0">
              <img
                src="img/comunidad.jpg"
                className="img-fluid"
                alt="Ilustración de jugadores de la comunidad Level-Up Gamer frente a computadores y controles"
                width="842"
                height="841"
              />
            </figure>
          </div>
        </div>
      </section>

      <section className="container py-4" aria-labelledby="titulo-destacados">
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
          <h2 id="titulo-destacados" className="mb-0">
            Productos destacados
          </h2>
          <Link to="/productos">Ver todos los productos</Link>
        </div>
        <ProductGrid productos={destacados} cuatro />
      </section>

      <section className="container py-5" aria-labelledby="titulo-niveles">
        <h2 id="titulo-niveles">Programa LevelUp: cada referido suma puntos</h2>
        <p className="text-body-secondary">
          Invita a tus amigos con tu código de referido. Ganas 100 puntos LevelUp por cada persona que se registre con él y subes de nivel para canjear
          productos y descuentos.
        </p>
        <LevelSteps />
      </section>

      <section className="container py-4" aria-labelledby="titulo-video">
        <h2 id="titulo-video">Así se sube de nivel</h2>
        <video className="lug-video w-100" controls preload="metadata" poster="img/poster-video.jpg">
          <source src="video/promo-level-up.mp4" type="video/mp4" />
          Tu navegador no puede reproducir este video. Puedes <a href="video/promo-level-up.mp4">descargarlo aquí</a>.
        </video>
      </section>
    </>
  );
}
