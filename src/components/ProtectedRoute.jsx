import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Protege vistas por rol: sin sesión → login; con rol no permitido → home
export default function ProtectedRoute({ roles, children }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login?aviso=acceso" replace />;
  if (!roles.includes(usuario.tipo)) return <Navigate to="/" replace />;
  return children;
}
