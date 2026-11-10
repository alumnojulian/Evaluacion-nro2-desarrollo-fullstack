import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import SiteNavbar from './SiteNavbar';
import SessionBar from './SessionBar';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';

// Estructura común de la tienda: cabecera, contenido (Outlet), pie y botón de WhatsApp
export default function StoreLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="d-flex flex-column min-vh-100">
      <a className="visually-hidden-focusable lug-saltar" href="#contenido">
        Saltar al contenido
      </a>
      <header className="sticky-top lug-cabecera">
        <SiteNavbar />
        <SessionBar />
      </header>
      <main id="contenido" className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
