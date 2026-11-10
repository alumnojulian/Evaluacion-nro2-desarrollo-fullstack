import { cleanup, render, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../context/ToastContext';
import { CLAVE_SESION } from '../lib/auth';

// Aislamiento entre pruebas: limpia el DOM y localStorage antes de cada una
beforeEach(() => localStorage.clear());
afterEach(cleanup);

export const FUTURO = { v7_startTransition: true, v7_relativeSplatPath: true };

// Inicia sesión "a mano" guardando el correo en localStorage (igual que lo hace iniciarSesion)
export function conSesion(correo) {
  localStorage.setItem(CLAVE_SESION, JSON.stringify(correo));
}

// Renderiza con router en memoria y todos los contextos. `rutas` permite definir <Route> propias.
export function renderApp(ui, { ruta = '/', path = '*', extra = null } = {}) {
  const r = render(
    <MemoryRouter initialEntries={[ruta]} future={FUTURO}>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path={path} element={ui} />
              {extra}
            </Routes>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );
  // `ui` consulta solo dentro del componente (evita ruido del reporter HTML de Karma que vive en <body>)
  return { ...r, ui: within(r.container) };
}

// Renderiza la aplicación completa (rutas reales) en una ruta inicial
export function renderRutas(App, ruta) {
  const r = render(
    <MemoryRouter initialEntries={[ruta]} future={FUTURO}>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );
  return { ...r, ui: within(r.container) };
}

// Espera a que un espía de Jasmine haya sido llamado. (En Jasmine `expect` no lanza excepciones,
// por eso no sirve dentro de waitFor: se lanza un error explícito para que waitFor reintente.)
export function esperarLlamada(espia) {
  return waitFor(() => {
    if (!espia.calls.count()) throw new Error('el callback aún no fue llamado');
  });
}
