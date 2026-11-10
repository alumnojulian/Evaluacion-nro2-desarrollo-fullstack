import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { calcularNivel, esPersonalInterno } from '../lib/auth';

// Barra bajo la cabecera: enlaces de acceso o datos de la sesión con nivel LevelUp
export default function SessionBar() {
  const { usuario, logout } = useAuth();
  const { mostrarToast } = useToast();

  if (!usuario) {
    return (
      <div className="container d-flex justify-content-end gap-2 small py-1 lug-barra-sesion">
        <Link to="/login">Iniciar sesión</Link>
        <span aria-hidden="true">|</span>
        <Link to="/registro">Registrar usuario</Link>
      </div>
    );
  }
  const nivel = calcularNivel(usuario.puntos || 0);
  return (
    <div className="container d-flex flex-wrap justify-content-end align-items-center gap-2 small py-1 lug-barra-sesion">
      <span className="lug-nivel" title="Puntos LevelUp acumulados">
        Hola, {usuario.nombre} · Nivel {nivel.nivel} {nivel.nombre} · {usuario.puntos || 0} pts
      </span>
      <span aria-hidden="true">|</span>
      {esPersonalInterno(usuario) && (
        <>
          <Link to="/admin">Panel de administración</Link>
          <span aria-hidden="true">|</span>
        </>
      )}
      <button
        type="button"
        className="btn btn-link btn-sm p-0"
        onClick={() => {
          logout();
          mostrarToast('Cerraste sesión. ¡Vuelve pronto!');
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
