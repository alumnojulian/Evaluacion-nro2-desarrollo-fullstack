import PageTitle from '../components/PageTitle';

export default function Nosotros() {
  return (
    <div className="container pb-4">
      <PageTitle titulo="Nosotros" subtitulo="Somos una tienda online hecha por y para la comunidad gamer de Chile." />
      <section className="py-3" aria-labelledby="quienes">
        <h2 id="quienes">Quiénes somos</h2>
        <p>
          Level-Up Gamer nació hace dos años, cuando la pandemia disparó la demanda por videojuegos. No tenemos tienda física: todo el catálogo se compra
          online y despachamos a todo el país.
        </p>
        <p>Ofrecemos consolas, accesorios, computadores y sillas gamer, además de juegos de mesa, poleras y polerones personalizados y servicio técnico.</p>
      </section>
      <section className="row g-4 py-3" aria-label="Misión y visión">
        <article className="col-md-6">
          <div className="lug-panel p-4 h-100">
            <h3 className="text-success">Misión</h3>
            <p className="mb-0">
              Proporcionar productos de alta calidad para gamers en todo Chile, con una experiencia de compra única y personalizada, enfocada en la
              satisfacción del cliente y el crecimiento de la comunidad gamer.
            </p>
          </div>
        </article>
        <article className="col-md-6">
          <div className="lug-panel p-4 h-100">
            <h3 className="text-success">Visión</h3>
            <p className="mb-0">
              Ser la tienda online líder en productos para gamers en Chile, reconocida por su innovación, su servicio al cliente y un programa de
              fidelización con gamificación que recompense a los clientes más fieles.
            </p>
          </div>
        </article>
      </section>
      <section className="py-3" aria-labelledby="impacto">
        <h2 id="impacto">Impacto en la comunidad</h2>
        <p>
          Parte de cada compra apoya a la comunidad gamer y a los eventos locales de videojuegos. Con el programa LevelUp, quienes participan y refieren
          amigos ganan puntos para canjear por productos y descuentos.
        </p>
      </section>
      <section className="lug-panel p-4 my-3" aria-labelledby="desarrollo">
        <h3 id="desarrollo" className="text-success">
          Quién desarrolló este sitio
        </h3>
        <p className="mb-0">
          Este sitio fue desarrollado por Julian, estudiante de Ingeniería en Informática de DUOC UC, como parte de la asignatura DSY1104 Desarrollo
          Fullstack II. En la Evaluación Parcial 1 se construyó con HTML, CSS y JavaScript, y en la Evaluación Parcial 2 se migró a React con Bootstrap y
          pruebas unitarias con Jasmine y Karma. Su código se versiona en GitHub.
        </p>
      </section>
    </div>
  );
}
