import { NIVELES } from '../lib/auth';

const DESCRIPCIONES = [
  '0 puntos. Ya eres parte de la comunidad.',
  '200 puntos. Empiezas a canjear descuentos.',
  '500 puntos. Productos y descuentos exclusivos.',
  '1.000 puntos. Lo mejor de Level-Up Gamer.',
];

// Niveles del programa LevelUp (Novato → Leyenda)
export default function LevelSteps() {
  return (
    <ol className="list-unstyled row row-cols-2 row-cols-md-4 g-3 lug-niveles mt-3">
      {NIVELES.map((n, i) => (
        <li className="col" key={n.nivel}>
          <div className="lug-nivel-paso h-100">
            <h3 className="h6">
              Nivel {n.nivel}: {n.nombre}
            </h3>
            <p className="small text-body-secondary mb-0">{DESCRIPCIONES[i]}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
