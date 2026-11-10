import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ENLACES = [
  { to: '/', texto: 'Home', end: true },
  { to: '/productos', texto: 'Productos' },
  { to: '/nosotros', texto: 'Nosotros' },
  { to: '/blogs', texto: 'Blogs' },
  { to: '/contacto', texto: 'Contacto' },
];

// Barra de navegación responsiva (Bootstrap navbar con menú colapsable controlado por estado)
export default function SiteNavbar() {
  const [abierto, setAbierto] = useState(false);
  const { totalItems } = useCart();

  return (
    <nav className="navbar navbar-expand-md lug-navbar" aria-label="Navegación principal">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <img src="img/logo.png" alt="" width="48" height="50" />
          <span className="lug-titulo">Level-Up Gamer</span>
        </Link>
        <button
          type="button"
          className="navbar-toggler"
          aria-expanded={abierto}
          aria-controls="menu-principal"
          aria-label="Abrir menú"
          onClick={() => setAbierto((a) => !a)}
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse ${abierto ? 'show' : ''}`} id="menu-principal">
          <ul className="navbar-nav mx-auto">
            {ENLACES.map((e) => (
              <li className="nav-item" key={e.to}>
                <NavLink className="nav-link" to={e.to} end={e.end} onClick={() => setAbierto(false)}>
                  {e.texto}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link className="btn btn-outline-light rounded-pill d-inline-flex align-items-center gap-2" to="/carrito" aria-label="Carrito de compras" onClick={() => setAbierto(false)}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="currentColor">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
            <span>
              Carrito (<span data-testid="contador-carrito">{totalItems}</span>)
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
