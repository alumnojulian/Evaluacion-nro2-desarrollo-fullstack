import { Route, Routes } from 'react-router-dom';
import StoreLayout from './components/StoreLayout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Productos from './pages/Productos';
import DetalleProducto from './pages/DetalleProducto';
import Carrito from './pages/Carrito';
import MisPedidos from './pages/MisPedidos';
import Registro from './pages/Registro';
import Login from './pages/Login';
import Nosotros from './pages/Nosotros';
import Blogs from './pages/Blogs';
import BlogArticulo from './pages/BlogArticulo';
import Contacto from './pages/Contacto';
import NotFound from './pages/NotFound';
import Dashboard from './pages/admin/Dashboard';
import ProductosAdmin from './pages/admin/ProductosAdmin';
import ProductoForm from './pages/admin/ProductoForm';
import UsuariosAdmin from './pages/admin/UsuariosAdmin';
import UsuarioForm from './pages/admin/UsuarioForm';
import Ordenes from './pages/admin/Ordenes';

const PERSONAL = ['Administrador', 'Vendedor'];

// Mapa de rutas: tienda pública y panel de administración protegido por rol
export default function App() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route index element={<Home />} />
        <Route path="productos" element={<Productos />} />
        <Route path="producto/:codigo" element={<DetalleProducto />} />
        <Route path="carrito" element={<Carrito />} />
        <Route path="mis-pedidos" element={<MisPedidos />} />
        <Route path="registro" element={<Registro />} />
        <Route path="login" element={<Login />} />
        <Route path="nosotros" element={<Nosotros />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="blogs/:id" element={<BlogArticulo />} />
        <Route path="contacto" element={<Contacto />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route
        path="admin"
        element={
          <ProtectedRoute roles={PERSONAL}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="ordenes" element={<Ordenes />} />
        <Route path="productos" element={<ProductosAdmin />} />
        <Route path="productos/nuevo" element={<ProductoForm />} />
        <Route path="productos/:codigo" element={<ProductoForm />} />
        <Route
          path="usuarios"
          element={
            <ProtectedRoute roles={['Administrador']}>
              <UsuariosAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="usuarios/nuevo"
          element={
            <ProtectedRoute roles={['Administrador']}>
              <UsuarioForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="usuarios/:run"
          element={
            <ProtectedRoute roles={['Administrador']}>
              <UsuarioForm />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
