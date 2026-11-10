import { fireEvent } from '@testing-library/react';
import { Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import ProductosAdmin from './ProductosAdmin';
import ProductoForm from './ProductoForm';
import UsuariosAdmin from './UsuariosAdmin';
import UsuarioForm from './UsuarioForm';
import Ordenes from './Ordenes';
import ProtectedRoute from '../../components/ProtectedRoute';
import App from '../../App';
import { conSesion, renderApp, renderRutas } from '../../test/helpers';
import { buscarProducto, getProductos, guardarOrdenes } from '../../lib/store';
import { getUsuarios, buscarUsuarioPorCorreo } from '../../lib/auth';
import { LS } from '../../lib/storage';

const llenar = (ui, etiqueta, valor) => fireEvent.change(ui.getByLabelText(etiqueta), { target: { value: valor } });
const admin = () => conSesion('admin@duoc.cl');
const vendedor = () => conSesion('vendedor@duoc.cl');

describe('Dashboard', () => {
  it('saluda y muestra 4 métricas al administrador', () => {
    admin();
    const { ui } = renderApp(<Dashboard />);
    expect(ui.getByText('¡Hola Administrador Ana!')).toBeTruthy();
    expect(ui.getByText('Productos en catálogo')).toBeTruthy();
    expect(ui.getByText('Usuarios registrados')).toBeTruthy();
    expect(ui.getByText('12')).toBeTruthy();
  });
  it('el vendedor no ve usuarios ni el restablecimiento de datos', () => {
    vendedor();
    const { ui } = renderApp(<Dashboard />);
    expect(ui.getByText('¡Hola Vendedor Vicente!')).toBeTruthy();
    expect(ui.queryByText('Usuarios registrados')).toBeNull();
    expect(ui.queryByText('Restablecer datos de demostración')).toBeNull();
  });
  it('lista los productos en stock crítico o agotado (PlayStation 5 de la semilla)', () => {
    admin();
    const { ui } = renderApp(<Dashboard />);
    expect(ui.getByText('PlayStation 5')).toBeTruthy();
    expect(ui.getByText('Stock crítico', { selector: 'span.badge' })).toBeTruthy();
  });
  it('si no hay críticos informa que todo está en orden', () => {
    admin();
    LS.set('lug_productos', getProductos().map((p) => ({ ...p, stock: 100 })));
    expect(renderApp(<Dashboard />).ui.getByText(/ningún producto está en nivel crítico/)).toBeTruthy();
  });
  it('restablecer pide confirmación y vuelve a los datos iniciales', () => {
    admin();
    LS.set('lug_productos', getProductos().slice(0, 3));
    const { ui } = renderApp(<p>fuera</p>, {
      path: '/nada',
      ruta: '/admin',
      extra: (
        <>
          <Route path="/admin" element={<ProtectedRoute roles={['Administrador']}><Dashboard /></ProtectedRoute>} />
          <Route path="/login" element={<p>login</p>} />
        </>
      ),
    });
    fireEvent.click(ui.getByText('Restablecer datos de demostración'));
    expect(ui.getByRole('dialog')).toBeTruthy();
    fireEvent.click(ui.getByText('Cancelar'));
    expect(ui.queryByRole('dialog')).toBeNull();
    expect(getProductos().length).toBe(3);
    fireEvent.click(ui.getByText('Restablecer datos de demostración'));
    fireEvent.click(ui.getByText('Restablecer'));
    expect(getProductos().length).toBe(12);
    expect(localStorage.getItem('lug_sesion')).toBeNull();
    expect(ui.getByText('login')).toBeTruthy();
  });
});

describe('ProductosAdmin', () => {
  it('el administrador ve Nuevo producto, Editar y Eliminar', () => {
    admin();
    const { ui } = renderApp(<ProductosAdmin />);
    expect(ui.getByTestId('conteo-productos').textContent).toBe('12 productos');
    expect(ui.getByText('Nuevo producto')).toBeTruthy();
    expect(ui.getAllByText('Editar').length).toBe(12);
    expect(ui.getAllByText('Eliminar').length).toBe(12);
  });
  it('el vendedor solo puede ver el detalle', () => {
    vendedor();
    const { ui } = renderApp(<ProductosAdmin />);
    expect(ui.queryByText('Nuevo producto')).toBeNull();
    expect(ui.queryByText('Eliminar')).toBeNull();
    expect(ui.getAllByText('Ver detalle').length).toBe(12);
  });
  it('busca por código, nombre o categoría', () => {
    admin();
    const { ui } = renderApp(<ProductosAdmin />);
    llenar(ui, 'Buscar', 'mousepad');
    expect(ui.getByTestId('conteo-productos').textContent).toBe('1 producto');
    llenar(ui, 'Buscar', 'zzz');
    expect(ui.getByText('No hay productos que coincidan con la búsqueda.')).toBeTruthy();
  });
  it('filtra solo stock crítico, también desde ?estado=critico', () => {
    admin();
    const { ui } = renderApp(<ProductosAdmin />, { ruta: '/admin/productos?estado=critico' });
    expect(ui.getByTestId('conteo-productos').textContent).toBe('1 producto');
    llenar(ui, 'Mostrar', '');
    expect(ui.getByTestId('conteo-productos').textContent).toBe('12 productos');
  });
  it('eliminar pide confirmación; al confirmar borra el producto y lo saca del carrito', () => {
    admin();
    LS.set('lug_carrito', [{ codigo: 'MS001', cantidad: 1 }]);
    const { ui } = renderApp(<ProductosAdmin />);
    fireEvent.click(ui.getAllByText('Eliminar')[0]);
    expect(ui.getByText(/¿Eliminar "Catan" \(JM001\)\?/)).toBeTruthy();
    fireEvent.click(ui.getByText('Cancelar'));
    expect(buscarProducto('JM001')).not.toBeNull();
    fireEvent.click(ui.getAllByText('Eliminar')[0]);
    fireEvent.click(ui.getAllByText('Eliminar').find((b) => b.className.includes('btn-outline-danger') && b.closest('.modal-footer')));
    expect(buscarProducto('JM001')).toBeNull();
    expect(ui.getByText('Producto eliminado.')).toBeTruthy();
    expect(ui.getByTestId('conteo-productos').textContent).toBe('11 productos');
  });
});

describe('ProductoForm (página)', () => {
  const montar = (ruta, path) =>
    renderApp(<ProductoForm />, { path, ruta, extra: (<><Route path="/admin/productos" element={<p>listado</p>} /><Route path="/admin/productos/:codigo" element={<ProductoForm />} /></>) });
  it('nuevo producto: crea y vuelve al listado', async () => {
    admin();
    const { ui } = montar('/admin/productos/nuevo', '/admin/productos/nuevo');
    expect(ui.getByText('Nuevo producto', { selector: 'h1' })).toBeTruthy();
    llenar(ui, 'Código del producto', 'ZZ999');
    llenar(ui, 'Nombre', 'Producto de prueba');
    llenar(ui, 'Precio (CLP)', '1000');
    llenar(ui, 'Stock', '2');
    llenar(ui, 'Stock crítico (opcional)', '5');
    llenar(ui, 'Categoría', 'Mouse');
    fireEvent.click(ui.getByText('Guardar producto'));
    await ui.findByText('listado');
    expect(buscarProducto('ZZ999').nombre).toBe('Producto de prueba');
  });
  it('editar: carga el producto y muestra el título de edición', () => {
    admin();
    const { ui } = montar('/admin/productos/MS001', '/admin/productos/:codigo');
    expect(ui.getByText('Editar producto')).toBeTruthy();
    expect(ui.getByLabelText('Código del producto').value).toBe('MS001');
  });
  it('vendedor: ve el detalle en solo lectura', () => {
    vendedor();
    const { ui } = montar('/admin/productos/MS001', '/admin/productos/:codigo');
    expect(ui.getByText('Detalle del producto')).toBeTruthy();
    expect(ui.getByLabelText('Nombre').disabled).toBe(true);
  });
  it('vendedor no puede crear productos: vuelve al listado', () => {
    vendedor();
    const { ui } = montar('/admin/productos/nuevo', '/admin/productos/nuevo');
    expect(ui.getByText('listado')).toBeTruthy();
  });
  it('código inexistente: avisa que no encontró el producto', () => {
    admin();
    expect(montar('/admin/productos/NOPE', '/admin/productos/:codigo').ui.getByText(/No encontramos ese producto/)).toBeTruthy();
  });
});

describe('UsuariosAdmin', () => {
  it('lista las 4 cuentas de prueba con su rol y puntos', () => {
    admin();
    const { ui } = renderApp(<UsuariosAdmin />);
    expect(ui.getByTestId('conteo-usuarios').textContent).toBe('4 usuarios');
    expect(ui.getByText('Diego Alumno Duoc')).toBeTruthy();
    expect(ui.getAllByText('Cliente').length).toBeGreaterThan(1);
  });
  it('busca por texto y filtra por tipo de usuario', () => {
    admin();
    const { ui } = renderApp(<UsuariosAdmin />);
    llenar(ui, 'Buscar', 'camila');
    expect(ui.getByTestId('conteo-usuarios').textContent).toBe('1 usuario');
    llenar(ui, 'Buscar', '');
    llenar(ui, 'Tipo de usuario', 'Cliente');
    expect(ui.getByTestId('conteo-usuarios').textContent).toBe('2 usuarios');
    llenar(ui, 'Buscar', 'nadie');
    expect(ui.getByText('No hay usuarios que coincidan con la búsqueda.')).toBeTruthy();
  });
  it('no permite eliminar la propia cuenta', () => {
    admin();
    const { ui } = renderApp(<UsuariosAdmin />);
    fireEvent.click(ui.getAllByText('Eliminar')[0]); // Ana (admin) es la primera
    expect(ui.getByText('No puedes eliminar tu propia cuenta mientras tienes la sesión abierta.')).toBeTruthy();
    expect(getUsuarios().length).toBe(4);
  });
  it('elimina a otro usuario tras confirmar', () => {
    admin();
    const { ui } = renderApp(<UsuariosAdmin />);
    fireEvent.click(ui.getAllByText('Eliminar')[3]); // Diego
    expect(ui.getByText(/¿Eliminar al usuario Diego Alumno Duoc/)).toBeTruthy();
    fireEvent.click(ui.getAllByText('Eliminar').find((b) => b.closest('.modal-footer')));
    expect(buscarUsuarioPorCorreo('alumno@duoc.cl')).toBeNull();
    expect(ui.getByTestId('conteo-usuarios').textContent).toBe('3 usuarios');
  });
});

describe('UsuarioForm (página)', () => {
  const montar = (ruta, path) =>
    renderApp(<UsuarioForm />, { path, ruta, extra: (<><Route path="/admin/usuarios" element={<p>listado usuarios</p>} /><Route path="/admin/usuarios/:run" element={<UsuarioForm />} /></>) });
  it('nuevo usuario: valida y vuelve al listado al crear', () => {
    admin();
    const { ui } = montar('/admin/usuarios/nuevo', '/admin/usuarios/nuevo');
    expect(ui.getByText('Nuevo usuario', { selector: 'h1' })).toBeTruthy();
    const d = { RUN: '100000040', Nombre: 'Nuevo', Apellidos: 'Usuario', Correo: 'nuevo@gmail.com', 'Confirmar correo': 'nuevo@gmail.com', Contraseña: 'abcd', 'Confirmar contraseña': 'abcd', Dirección: 'Calle 1' };
    Object.entries(d).forEach(([k, v]) => llenar(ui, k, v));
    llenar(ui, 'Tipo de usuario', 'Cliente');
    llenar(ui, 'Región', 'Región de Valparaíso');
    llenar(ui, 'Comuna', 'Viña del Mar');
    fireEvent.click(ui.getByText('Crear usuario'));
    expect(ui.getByText('listado usuarios')).toBeTruthy();
    expect(buscarUsuarioPorCorreo('nuevo@gmail.com').tipo).toBe('Cliente');
  });
  it('editar: carga los datos y guarda los cambios', () => {
    admin();
    const { ui } = montar('/admin/usuarios/201234565', '/admin/usuarios/:run');
    expect(ui.getByText('Editar usuario', { selector: 'h1' })).toBeTruthy();
    expect(ui.getByLabelText('Nombre').value).toBe('Diego');
    llenar(ui, 'Teléfono (opcional)', '+56 9 1234 5678');
    fireEvent.click(ui.getByText('Guardar cambios'));
    expect(ui.getByText('listado usuarios')).toBeTruthy();
    expect(buscarUsuarioPorCorreo('alumno@duoc.cl').telefono).toBe('+56 9 1234 5678');
  });
  it('RUN inexistente: avisa que no encontró el usuario', () => {
    admin();
    expect(montar('/admin/usuarios/000', '/admin/usuarios/:run').ui.getByText(/No encontramos ese usuario/)).toBeTruthy();
  });
});

describe('Ordenes', () => {
  it('sin órdenes explica cuándo aparecerán', () => {
    expect(renderApp(<Ordenes />).ui.getByText(/Aún no hay órdenes/)).toBeTruthy();
  });
  it('lista las órdenes más recientes primero, con detalle y descuento', () => {
    guardarOrdenes([
      { id: 'LUG-0001', fecha: '2026-01-01T10:00:00.000Z', correo: 'a@duoc.cl', cliente: 'Ana A', items: [{ codigo: 'X', nombre: 'Mouse', precio: 1000, cantidad: 2 }], subtotal: 2000, descuento: 400, total: 1600, estado: 'Pendiente' },
      { id: 'LUG-0002', fecha: '2026-01-02T10:00:00.000Z', correo: 'b@gmail.com', cliente: 'Beto B', items: [{ codigo: 'Y', nombre: 'Teclado', precio: 5000, cantidad: 1 }], subtotal: 5000, descuento: 0, total: 5000, estado: 'Pendiente' },
    ]);
    const { ui, container } = renderApp(<Ordenes />);
    expect(ui.getByTestId('conteo-ordenes').textContent).toBe('2 órdenes');
    const ids = Array.from(container.querySelectorAll('tbody tr td:first-child')).map((td) => td.textContent);
    expect(ids).toEqual(['LUG-0002', 'LUG-0001']);
    expect(ui.getByText('2 × Mouse')).toBeTruthy();
    expect(ui.getByText('Descuento aplicado: −$400')).toBeTruthy();
    expect(ui.getAllByText('Ver 1 producto').length).toBe(2);
  });
});

describe('App (rutas completas y permisos por rol)', () => {
  it('sin sesión, /admin redirige al login con el aviso de acceso', () => {
    const { ui } = renderRutas(App, '/admin');
    expect(ui.getByText(/necesitas iniciar sesión con una cuenta de Administrador o Vendedor/)).toBeTruthy();
  });
  it('un cliente no puede entrar al panel', () => {
    conSesion('cliente@gmail.com');
    const { ui } = renderRutas(App, '/admin');
    expect(ui.queryByText(/Panel Level-Up/)).toBeNull();
    expect(ui.getByText('Sube de nivel con tu setup gamer')).toBeTruthy();
  });
  it('el vendedor entra al panel pero /admin/usuarios lo devuelve a la tienda', () => {
    vendedor();
    const panel = renderRutas(App, '/admin');
    expect(panel.ui.getByText('¡Hola Vendedor Vicente!')).toBeTruthy();
    panel.unmount();
    const usuarios = renderRutas(App, '/admin/usuarios');
    expect(usuarios.ui.queryByText('Nuevo usuario')).toBeNull();
    expect(usuarios.ui.getByText('Sube de nivel con tu setup gamer')).toBeTruthy();
  });
  it('el administrador accede a Usuarios', () => {
    admin();
    expect(renderRutas(App, '/admin/usuarios').ui.getByText('Nuevo usuario')).toBeTruthy();
  });
  it('una ruta desconocida muestra la página 404', () => {
    expect(renderRutas(App, '/ruta/inexistente').ui.getByText('Página no encontrada')).toBeTruthy();
  });
  it('flujo completo: añadir al carrito, iniciar sesión y pagar con descuento Duoc', () => {
    const { ui } = renderRutas(App, '/productos?categoria=Mouse');
    fireEvent.click(ui.getAllByText('Añadir')[0]);
    expect(ui.getByTestId('contador-carrito').textContent).toBe('1');
    fireEvent.click(ui.getByLabelText('Carrito de compras'));
    fireEvent.click(ui.getByText('Pagar'));
    expect(ui.getByText(/Inicia sesión para terminar tu compra/)).toBeTruthy();
    llenar(ui, 'Correo', 'alumno@duoc.cl');
    llenar(ui, 'Contraseña', 'duoc1234');
    fireEvent.click(ui.getByRole('button', { name: 'Iniciar sesión' }));
    expect(ui.getByText('Descuento Duoc 20 %')).toBeTruthy();
    fireEvent.click(ui.getByText('Pagar'));
    expect(ui.getByText('¡Compra realizada!')).toBeTruthy();
    expect(ui.getByTestId('numero-orden').textContent).toBe('LUG-0001');
  });
});
