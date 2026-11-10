import { Link } from 'react-router-dom';
import CampoForm from './CampoForm';
import useFormValidation from '../hooks/useFormValidation';
import { useToast } from '../context/ToastContext';
import { CATEGORIAS } from '../data/productos';
import { sugerirCorreo, validarCorreo } from '../lib/validators';
import { suscribirNewsletter } from '../lib/store';

const REGLAS = { correo: (v) => validarCorreo(v) };
const AYUDAS = { correo: sugerirCorreo };

// Pie de página: medios de pago, categorías y newsletter con validación
export default function Footer() {
  const { mostrarToast } = useToast();
  const form = useFormValidation({ initial: { correo: '' }, reglas: REGLAS, ayudas: AYUDAS });

  const enviar = (v) => {
    suscribirNewsletter(v.correo);
    form.reset();
    mostrarToast('¡Listo! Te suscribiste al newsletter de Level-Up Gamer.');
  };

  return (
    <footer className="lug-pie mt-5 py-4">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <h2 className="h6 lug-titulo">Level-Up Gamer</h2>
            <p className="small text-body-secondary">Tienda online de videojuegos y tecnología gamer con despachos a todo Chile.</p>
            <p className="small text-body-secondary mb-1">Medios de pago:</p>
            <div className="d-flex flex-wrap gap-2" aria-label="Medios de pago">
              {['Tarjeta de crédito', 'Tarjeta de débito', 'Transferencia'].map((m) => (
                <span key={m} className="badge text-bg-dark border">
                  {m}
                </span>
              ))}
            </div>
          </div>
          <div className="col-lg-4">
            <h2 className="h6 lug-titulo">Categorías</h2>
            <ul className="list-unstyled small lug-categorias">
              {CATEGORIAS.map((c) => (
                <li key={c}>
                  <Link to={`/productos?categoria=${encodeURIComponent(c)}`}>{c}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-lg-4">
            <h2 className="h6 lug-titulo">Únete al newsletter</h2>
            <p className="small text-body-secondary">Recibe novedades y promociones para gamers.</p>
            <form onSubmit={form.handleSubmit(enviar)} noValidate aria-label="Newsletter">
              <CampoForm {...form.campo('correo')} id="correo-newsletter" label="Correo para el newsletter" ocultarEtiqueta type="email" placeholder="tucorreo@gmail.com" autoComplete="email" />
              <button type="submit" className="btn btn-primary">
                Suscribirme
              </button>
            </form>
          </div>
        </div>
        <p className="small text-body-secondary border-top pt-3 mt-4 mb-0">
          © 2026 Level-Up Gamer. Proyecto académico DSY1104 Desarrollo Fullstack II, DUOC UC. Los productos y precios son referenciales.
        </p>
      </div>
    </footer>
  );
}
