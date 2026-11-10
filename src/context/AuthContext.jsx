import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { cerrarSesion, getSesion, iniciarSesion } from '../lib/auth';

const AuthContext = createContext(null);

// Estado global de la sesión: usuario actual (o null) y acciones de login / logout
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => getSesion());

  const login = useCallback((correo, password) => {
    const r = iniciarSesion(correo, password);
    if (r.ok) setUsuario(r.usuario);
    return r;
  }, []);

  const logout = useCallback(() => {
    cerrarSesion();
    setUsuario(null);
  }, []);

  const refrescar = useCallback(() => setUsuario(getSesion()), []);

  const value = useMemo(() => ({ usuario, login, logout, refrescar }), [usuario, login, logout, refrescar]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
