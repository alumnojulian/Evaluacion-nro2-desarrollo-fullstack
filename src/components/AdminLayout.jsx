import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Panel de administración: menú lateral (según rol) y contenido
export default function AdminLayout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const esAdmin = usuario.tipo === 'Administrador';

  const salir = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="lug-admin d-md-flex min-vh-100">
      <div className="d-md-none d-flex justify-content-between align-items-center p-2 lug-admin__barra">
        <Link className="d-flex align-items-center gap-2 text-decoration-none" to="/admin">
          <img src="img/logo.png" alt="" width="44" height="46" />
          <span className="lug-titulo">Panel Level-Up</span>
        </Link>
        <button type="button" className="btn btn-outline-light btn-sm" aria-expanded={abierto} aria-controls="menu-admin" onClick={() => setAbierto((a) => !a)}>
          Menú
        </button>
      </div>
      <aside id="menu-admin" className={`lug-admin__menu p-3 flex-column gap-3 ${abierto ? 'd-flex' : 'd-none d-md-flex'}`} aria-label="Menú del administrador">
        <Link className="d-none d-md-flex align-items-center gap-2 text-decoration-none" to="/admin">
          <img src="img/logo.png" alt="" width="44" height="46" />
          <span className="lug-titulo">Panel Level-Up</span>
        </Link>
        <nav aria-label="Secciones del panel">
          <ul className="nav nav-pills flex-column gap-1">
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin" end onClick={() => setAbierto(false)}>
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/ordenes" onClick={() => setAbierto(false)}>
                Órdenes
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/productos" onClick={() => setAbierto(false)}>
                Productos
              </NavLink>
            </li>
            {esAdmin && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/usuarios" onClick={() => setAbierto(false)}>
                  Usuarios
                </NavLink>
              </li>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Ver tienda
              </Link>
            </li>
          </ul>
        </nav>
        <div className="mt-auto border-top pt-3">
          <p className="small mb-2">
            <strong>
              {usuario.nombre} {usuario.apellidos}
            </strong>
            <br />
            <span className="text-body-secondary">{usuario.tipo}</span>
          </p>
          <button type="button" className="btn btn-outline-info btn-sm" onClick={salir}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main id="contenido" className="flex-grow-1 p-3 p-md-4 lug-admin__contenido">
        <Outlet />
      </main>
    </div>
  );
}
