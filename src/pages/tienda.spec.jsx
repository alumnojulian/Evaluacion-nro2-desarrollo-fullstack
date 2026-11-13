import { fireEvent } from '@testing-library/react';
import { Route } from 'react-router-dom';
import Home from './Home';
import Productos from './Productos';
import DetalleProducto from './DetalleProducto';
import Carrito from './Carrito';
import MisPedidos from './MisPedidos';
import Registro from './Registro';
import Login from './Login';
import Contacto from './Contacto';
import Nosotros from './Nosotros';
import Blogs from './Blogs';
import BlogArticulo from './BlogArticulo';
import NotFound from './NotFound';
import SiteNavbar from '../components/SiteNavbar';
import { conSesion, renderApp } from '../test/helpers';
import { LS } from '../lib/storage';
import { getMensajes, getOrdenes, buscarProducto } from '../lib/store';
import { buscarUsuarioPorCorreo } from '../lib/auth';

const llenar = (ui, etiqueta, valor) => fireEvent.change(ui.getByLabelText(etiqueta), { target: { value: valor } });

describe('Home', () => {
  it('muestra el hero, 8 productos destacados, los niveles LevelUp y el video promocional', () => {
    const { ui, container } = renderApp(<Home />);
    expect(ui.getByText('Sube de nivel con tu setup gamer')).toBeTruthy();
    expect(ui.getAllByRole('button', { name: /Añadir|Sin stock/ }).length).toBe(8);
    expect(ui.getByText('Programa LevelUp: cada referido suma puntos')).toBeTruthy();
    expect(ui.getByText(/Nivel 4: Leyenda/)).toBeTruthy();
    expect(container.querySelector('video source').getAttribute('src')).toBe('video/promo-level-up.mp4');
    expect(ui.getByText('Crear cuenta').getAttribute('href')).toBe('/registro');
  });
});

describe('Productos', () => {
  it('lista los 12 productos del catálogo', () => {
    const { ui } = renderApp(<Productos />);
    expect(ui.getByTestId('conteo').textContent).toBe('12 productos');
  });
  it('toma la categoría inicial desde el enlace del footer (?categoria=)', () => {
    const { ui } = renderApp(<Productos />, { ruta: '/productos?categoria=Accesorios' });
    expect(ui.getByTestId('conteo').textContent).toBe('2 productos');
    expect(ui.getByLabelText('Categoría').value).toBe('Accesorios');
  });
  it('ignora una categoría inválida en la URL', () => {
    const { ui } = renderApp(<Productos />, { ruta: '/productos?categoria=Inventada' });
    expect(ui.getByTestId('conteo').textContent).toBe('12 productos');
  });
  it('filtra por texto y muestra el singular con un resultado', () => {
    const { ui } = renderApp(<Productos />);
    llenar(ui, 'Buscar', 'catan');
    expect(ui.getByTestId('conteo').textContent).toBe('1 producto');
  });
  it('filtra por precio máximo y ordena de menor a mayor', () => {
    const { ui, container } = renderApp(<Productos />);
    llenar(ui, 'Precio máximo (CLP)', '30000');
    llenar(ui, 'Ordenar por', 'precio-asc');
    const precios = Array.from(container.querySelectorAll('.lug-precio')).map((e) => Number(e.textContent.replace(/\D/g, '')));
    expect(precios.length).toBe(5);
    expect(precios).toEqual(precios.slice().sort((a, b) => a - b));
  });
  it('muestra un aviso cuando no hay resultados y Limpiar restaura el listado', () => {
    const { ui } = renderApp(<Productos />);
    llenar(ui, 'Buscar', 'zzzz');
    expect(ui.getByText(/No encontramos productos con esos filtros/)).toBeTruthy();
    fireEvent.click(ui.getByText('Limpiar'));
    expect(ui.getByTestId('conteo').textContent).toBe('12 productos');
  });
  it('muestra el error del precio máximo negativo y no filtra por él', () => {
    const { ui } = renderApp(<Productos />);
    llenar(ui, 'Precio máximo (CLP)', '-10');
    expect(ui.getByText('El precio máximo debe ser un número mayor o igual a 0.')).toBeTruthy();
    expect(ui.getByTestId('conteo').textContent).toBe('12 productos');
  });
});

describe('DetalleProducto', () => {
  const ir = (codigo) => renderApp(<><SiteNavbar /><DetalleProducto /></>, { path: '/producto/:codigo', ruta: `/producto/${codigo}` });
  it('muestra la ficha: precio, código, fabricante, distribuidor y stock', () => {
    const { ui } = ir('MS001');
    expect(ui.getByRole('heading', { name: 'Mouse Gamer Logitech G502 HERO' })).toBeTruthy();
    expect(ui.getAllByText('$49.990').length).toBeGreaterThan(0);
    expect(ui.getByText('Logitech')).toBeTruthy();
    expect(ui.getByText('Stock disponible: 40 unidades.')).toBeTruthy();
    expect(ui.getAllByText('Mouse').length).toBeGreaterThan(0);
  });
  it('avisa cuando quedan pocas unidades (stock crítico)', () => {
    expect(ir('CO001').ui.getByText('¡Quedan pocas unidades! Stock disponible: 4.')).toBeTruthy();
  });
  it('un producto agotado deshabilita la compra y oculta el selector de cantidad', () => {
    const ps = JSON.parse(JSON.stringify([{ ...buscarProducto('MS001'), stock: 0 }]));
    LS.set('lug_productos', [...ps, ...JSON.parse(localStorage.getItem('lug_productos')).filter((p) => p.codigo !== 'MS001')]);
    const { ui } = ir('MS001');
    expect(ui.getByText('Sin stock por ahora.')).toBeTruthy();
    expect(ui.queryByLabelText('Cantidad')).toBeNull();
    expect(ui.getByText('Añadir al carrito').disabled).toBe(true);
  });
  it('añade la cantidad elegida al carrito y confirma con un toast', () => {
    const { ui } = ir('MS001');
    llenar(ui, 'Cantidad', '3');
    fireEvent.click(ui.getByText('Añadir al carrito'));
    expect(ui.getByTestId('contador-carrito').textContent).toBe('3');
    expect(ui.getByText('Agregaste Mouse Gamer Logitech G502 HERO al carrito.')).toBeTruthy();
  });
  it('ofrece enlaces para compartir y productos relacionados', () => {
    const { ui } = ir('MS001');
    ['WhatsApp', 'Facebook', 'X'].forEach((r) => expect(ui.getByText(r).target).toBe('_blank'));
    expect(ui.getByText('También te puede interesar')).toBeTruthy();
  });
  it('un código inexistente muestra el mensaje de producto no encontrado', () => {
    const { ui } = ir('NOEXISTE');
    expect(ui.getByText('No encontramos ese producto')).toBeTruthy();
    expect(ui.getByText('Volver a productos').getAttribute('href')).toBe('/productos');
  });
});

describe('Carrito', () => {
  const conProductos = () => LS.set('lug_carrito', [{ codigo: 'MS001', cantidad: 2 }]);
  const montar = () =>
    renderApp(<Carrito />, { path: '/carrito', ruta: '/carrito', extra: <Route path="/login" element={<p>pantalla de login</p>} /> });

  it('carrito vacío invita a ver productos', () => {
    const { ui } = montar();
    expect(ui.getByText(/Tu carrito está vacío/)).toBeTruthy();
    expect(ui.getByText('Ver productos')).toBeTruthy();
  });
  it('muestra líneas, subtotal y total', () => {
    conProductos();
    const { ui } = montar();
    expect(ui.getByText('Mouse Gamer Logitech G502 HERO')).toBeTruthy();
    expect(ui.getAllByText('$99.980').length).toBe(2);
    expect(ui.getByDisplayValue('2')).toBeTruthy();
  });
  it('cambia la cantidad con + y −, y avisa al llegar al stock máximo', () => {
    LS.set('lug_carrito', [{ codigo: 'CO001', cantidad: 4 }]);
    const { ui } = montar();
    fireEvent.click(ui.getByLabelText('Agregar una unidad'));
    expect(ui.getByText('Solo quedan 4 unidades de PlayStation 5.')).toBeTruthy();
    fireEvent.click(ui.getByLabelText('Quitar una unidad'));
    expect(ui.getByDisplayValue('3')).toBeTruthy();
  });
  it('elimina un producto del carrito', () => {
    conProductos();
    const { ui } = montar();
    fireEvent.click(ui.getByText('Eliminar'));
    expect(ui.getByText('Producto eliminado del carrito.')).toBeTruthy();
    expect(ui.getByText(/Tu carrito está vacío/)).toBeTruthy();
  });
  it('aplica el cupón LEVELUP10 y muestra el descuento', () => {
    conProductos();
    const { ui } = montar();
    llenar(ui, 'Cupón de descuento', 'levelup10');
    fireEvent.click(ui.getByText('Aplicar'));
    expect(ui.getByText('Cupón LEVELUP10')).toBeTruthy();
    expect(ui.getByText('−$9.998')).toBeTruthy();
    expect(ui.getByText('Cupón LEVELUP10 aplicado.')).toBeTruthy();
  });
  it('un cupón inexistente muestra el error y no descuenta', () => {
    conProductos();
    const { ui } = montar();
    llenar(ui, 'Cupón de descuento', 'FALSO123');
    fireEvent.click(ui.getByText('Aplicar'));
    expect(ui.getByText('Ese cupón no existe o ya expiró.')).toBeTruthy();
  });
  it('un cliente Duoc ve el 20 % de descuento y no se acumula con el cupón (gana el mayor)', () => {
    conSesion('alumno@duoc.cl');
    conProductos();
    const { ui } = montar();
    expect(ui.getByText('Descuento Duoc 20 %')).toBeTruthy();
    llenar(ui, 'Cupón de descuento', 'LEVELUP10');
    fireEvent.click(ui.getByText('Aplicar'));
    expect(ui.getByText('Descuento Duoc 20 %')).toBeTruthy();
    expect(ui.queryByText('Cupón LEVELUP10')).toBeNull();
    expect(ui.getByText('−$19.996')).toBeTruthy();
  });
  it('pagar sin sesión redirige al login', () => {
    conProductos();
    const { ui } = montar();
    fireEvent.click(ui.getByText('Pagar'));
    expect(ui.getByText('pantalla de login')).toBeTruthy();
  });
  it('pagar con sesión crea la orden LUG-0001, descuenta stock y muestra la confirmación', () => {
    conSesion('cliente@gmail.com');
    conProductos();
    const { ui } = montar();
    fireEvent.click(ui.getByText('Pagar'));
    expect(ui.getByText('¡Compra realizada!')).toBeTruthy();
    expect(ui.getByTestId('numero-orden').textContent).toBe('LUG-0001');
    expect(getOrdenes()[0].total).toBe(99980);
    expect(buscarProducto('MS001').stock).toBe(38);
    expect(JSON.parse(localStorage.getItem('lug_carrito'))).toEqual([]);
  });
  it('después de pagar, "Ver mis pedidos" muestra la orden recién creada en el historial', () => {
    conSesion('cliente@gmail.com');
    conProductos();
    const { ui } = renderApp(<Carrito />, { path: '/carrito', ruta: '/carrito', extra: <Route path="/mis-pedidos" element={<MisPedidos />} /> });
    fireEvent.click(ui.getByText('Pagar'));
    fireEvent.click(ui.getByText('Ver mis pedidos'));
    expect(ui.getByRole('heading', { name: 'Mis pedidos' })).toBeTruthy();
    expect(ui.getByTestId('conteo-pedidos').textContent).toBe('1 pedido');
    expect(ui.getByText('LUG-0001')).toBeTruthy();
    expect(ui.getByText('2 × Mouse Gamer Logitech G502 HERO')).toBeTruthy();
  });
});

describe('MisPedidos', () => {
  const montar = () =>
    renderApp(<MisPedidos />, { path: '/mis-pedidos', ruta: '/mis-pedidos', extra: <Route path="/login" element={<Login />} /> });
  const orden = (id, correo, fecha, total) => ({
    id, correo, fecha, cliente: 'X', items: [{ codigo: 'MS001', nombre: 'Mouse', precio: total, cantidad: 1 }], subtotal: total, descuento: 0, total, estado: 'Pendiente',
  });

  it('sin sesión redirige al login con el aviso de pedidos', () => {
    const { ui } = montar();
    expect(ui.getByText('Inicia sesión para ver el historial de tus pedidos.')).toBeTruthy();
  });
  it('un cliente sin compras ve el aviso y el enlace al catálogo', () => {
    conSesion('cliente@gmail.com');
    const { ui } = montar();
    expect(ui.getByText(/Aún no tienes pedidos/)).toBeTruthy();
    expect(ui.getByText('Ver productos').getAttribute('href')).toBe('/productos');
  });
  it('lista solo los pedidos del cliente, del más reciente al más antiguo', () => {
    LS.set('lug_ordenes', [
      orden('LUG-0001', 'cliente@gmail.com', '2026-01-01T10:00:00.000Z', 1000),
      orden('LUG-0002', 'alumno@duoc.cl', '2026-01-02T10:00:00.000Z', 2000),
      orden('LUG-0003', 'cliente@gmail.com', '2026-01-03T10:00:00.000Z', 3000),
    ]);
    conSesion('cliente@gmail.com');
    const { ui, container } = montar();
    expect(ui.getByTestId('conteo-pedidos').textContent).toBe('2 pedidos');
    const ids = Array.from(container.querySelectorAll('tbody tr td:first-child')).map((td) => td.textContent);
    expect(ids).toEqual(['LUG-0003', 'LUG-0001']);
    expect(ui.getByText('$3.000')).toBeTruthy();
    expect(ui.getAllByText('Pendiente').length).toBe(2);
  });
});

describe('Registro', () => {
  const registrar = (ui, referido = '') => {
    const d = { RUN: '100000040', Nombre: 'Julian', Apellidos: 'Meneses', Correo: 'julian@duoc.cl', 'Confirmar correo': 'julian@duoc.cl', Contraseña: 'clave1', 'Confirmar contraseña': 'clave1', 'Fecha de nacimiento': '2000-01-01', Dirección: 'Calle 123' };
    Object.entries(d).forEach(([k, v]) => llenar(ui, k, v));
    llenar(ui, 'Región', 'Región Metropolitana de Santiago');
    llenar(ui, 'Comuna', 'Santiago');
    if (referido) llenar(ui, 'Código de referido (opcional)', referido);
    fireEvent.click(ui.getByText('Registrar'));
  };
  it('muestra el formulario con enlace a iniciar sesión', () => {
    const { ui } = renderApp(<Registro />);
    expect(ui.getByText('Registro de usuario')).toBeTruthy();
    expect(ui.getByText('Inicia sesión').getAttribute('href')).toBe('/login');
  });
  it('registra al usuario y muestra su código de referido y el descuento Duoc', () => {
    spyOn(Math, 'random').and.returnValue(0); // código de referido predecible (mock)
    const { ui } = renderApp(<Registro />);
    registrar(ui);
    expect(ui.getByText('¡Bienvenido/a, Julian!')).toBeTruthy();
    expect(ui.getByTestId('codigo-referido').textContent).toBe('LUPAAAAA');
    expect(ui.getByText(/20 % de descuento de por vida en tus compras/)).toBeTruthy();
    expect(buscarUsuarioPorCorreo('julian@duoc.cl').descuentoDuoc).toBe(true);
  });
  it('con código de referido suma 100 puntos al referente y lo comunica', () => {
    const { ui } = renderApp(<Registro />);
    registrar(ui, 'LUPDIEGO');
    expect(ui.getByText('Tu referente ganó 100 puntos LevelUp gracias a ti.')).toBeTruthy();
    expect(buscarUsuarioPorCorreo('alumno@duoc.cl').puntos).toBe(100);
  });
  it('no registra nada si el formulario tiene errores', () => {
    const { ui } = renderApp(<Registro />);
    fireEvent.click(ui.getByText('Registrar'));
    expect(ui.queryByText(/Bienvenido/)).toBeNull();
    expect(buscarUsuarioPorCorreo('julian@duoc.cl')).toBeNull();
  });
});

describe('Login', () => {
  const montar = (ruta = '/login') =>
    renderApp(<Login />, { path: '/login', ruta, extra: (<><Route path="/" element={<p>inicio</p>} /><Route path="/admin" element={<p>panel</p>} /><Route path="/carrito" element={<p>carrito</p>} /></>) });
  it('valida correo y contraseña al enviar vacío', () => {
    const { ui } = montar();
    fireEvent.click(ui.getByRole('button', { name: 'Iniciar sesión' }));
    expect(ui.getByText('El correo es obligatorio.')).toBeTruthy();
    expect(ui.getByText('La contraseña es obligatoria.')).toBeTruthy();
  });
  it('muestra el aviso de acceso al panel y el de pago según la URL', () => {
    expect(montar('/login?aviso=acceso').ui.getByText(/necesitas iniciar sesión con una cuenta de Administrador o Vendedor/)).toBeTruthy();
    expect(montar('/login?aviso=pago').ui.getByText(/Inicia sesión para terminar tu compra/)).toBeTruthy();
  });
  it('informa cuando la cuenta no existe o la contraseña no coincide', () => {
    const { ui } = montar();
    llenar(ui, 'Correo', 'nadie@duoc.cl');
    llenar(ui, 'Contraseña', 'abcd');
    fireEvent.click(ui.getByRole('button', { name: 'Iniciar sesión' }));
    expect(ui.getByText(/No encontramos una cuenta con ese correo/)).toBeTruthy();
    llenar(ui, 'Correo', 'admin@duoc.cl');
    fireEvent.click(ui.getByRole('button', { name: 'Iniciar sesión' }));
    expect(ui.getByText('La contraseña no coincide con la de esta cuenta.')).toBeTruthy();
  });
  it('un cliente entra a la tienda', () => {
    const { ui } = montar();
    llenar(ui, 'Correo', 'cliente@gmail.com');
    llenar(ui, 'Contraseña', 'cliente1');
    fireEvent.click(ui.getByRole('button', { name: 'Iniciar sesión' }));
    expect(ui.getByText('inicio')).toBeTruthy();
  });
  it('un cliente vuelve al carrito si venía de pagar', () => {
    const { ui } = montar('/login?aviso=pago&volver=carrito');
    llenar(ui, 'Correo', 'cliente@gmail.com');
    llenar(ui, 'Contraseña', 'cliente1');
    fireEvent.click(ui.getByRole('button', { name: 'Iniciar sesión' }));
    expect(ui.getByText('carrito')).toBeTruthy();
  });
  it('el parámetro volver solo acepta rutas simples (evita redirecciones externas)', () => {
    const { ui } = montar('/login?volver=//evil.com');
    llenar(ui, 'Correo', 'cliente@gmail.com');
    llenar(ui, 'Contraseña', 'cliente1');
    fireEvent.click(ui.getByRole('button', { name: 'Iniciar sesión' }));
    expect(ui.getByText('inicio')).toBeTruthy();
  });
  it('administrador y vendedor van al panel', () => {
    [['admin@duoc.cl', 'admin123'], ['vendedor@duoc.cl', 'vend123']].forEach(([c, p]) => {
      localStorage.clear();
      const { ui, unmount } = montar();
      llenar(ui, 'Correo', c);
      llenar(ui, 'Contraseña', p);
      fireEvent.click(ui.getByRole('button', { name: 'Iniciar sesión' }));
      expect(ui.getByText('panel')).toBeTruthy();
      unmount();
    });
  });
});

describe('Contacto', () => {
  it('valida nombre, correo y comentario', () => {
    const { ui } = renderApp(<Contacto />);
    fireEvent.click(ui.getByText('Enviar mensaje'));
    expect(ui.getByText('El nombre es obligatorio.')).toBeTruthy();
    expect(ui.getByText('El correo es obligatorio.')).toBeTruthy();
    expect(ui.getByText('El comentario es obligatorio.')).toBeTruthy();
  });
  it('limita el comentario a 500 caracteres', () => {
    const { ui } = renderApp(<Contacto />);
    llenar(ui, 'Contenido', 'a'.repeat(501));
    expect(ui.getByText(/no puede superar los 500 caracteres \(tienes 501\)/)).toBeTruthy();
  });
  it('precarga nombre y correo de quien tiene sesión', () => {
    conSesion('alumno@duoc.cl');
    const { ui } = renderApp(<Contacto />);
    expect(ui.getByLabelText('Nombre completo').value).toBe('Diego Alumno Duoc');
    expect(ui.getByLabelText('Correo').value).toBe('alumno@duoc.cl');
  });
  it('guarda el mensaje, limpia el formulario y confirma', () => {
    const { ui } = renderApp(<Contacto />);
    llenar(ui, 'Nombre completo', 'Ana Pérez');
    llenar(ui, 'Correo', 'ana@gmail.com');
    llenar(ui, 'Contenido', 'Hola, tengo una consulta');
    fireEvent.click(ui.getByText('Enviar mensaje'));
    expect(getMensajes().length).toBe(1);
    expect(getMensajes()[0].comentario).toBe('Hola, tengo una consulta');
    expect(ui.getByText('¡Mensaje enviado!')).toBeTruthy();
    expect(ui.getByLabelText('Contenido').value).toBe('');
  });
});

describe('Nosotros, Blogs, artículos y NotFound', () => {
  it('Nosotros muestra misión, visión e impacto', () => {
    const { ui } = renderApp(<Nosotros />);
    ['Quiénes somos', 'Misión', 'Visión', 'Impacto en la comunidad', 'Quién desarrolló este sitio'].forEach((t) => expect(ui.getByText(t)).toBeTruthy());
  });
  it('Blogs lista los dos casos con enlace a su artículo', () => {
    const { ui } = renderApp(<Blogs />);
    const enlaces = ui.getAllByText('Ver caso');
    expect(enlaces.map((a) => a.getAttribute('href'))).toEqual(['/blogs/silla-gamer', '/blogs/juegos-de-mesa']);
  });
  it('el artículo de la silla gamer muestra sus 4 secciones y el consejo extra', () => {
    const { ui } = renderApp(<BlogArticulo />, { path: '/blogs/:id', ruta: '/blogs/silla-gamer' });
    expect(ui.getByText('Cómo elegir tu primera silla gamer')).toBeTruthy();
    expect(ui.getByText('2. Soporte lumbar')).toBeTruthy();
    expect(ui.getAllByRole('listitem').length).toBeGreaterThanOrEqual(3);
    expect(ui.getByText('Ver sillas gamer').getAttribute('href')).toBe('/productos?categoria=Sillas%20Gamers');
  });
  it('el artículo de juegos de mesa lista cinco juegos', () => {
    const { ui } = renderApp(<BlogArticulo />, { path: '/blogs/:id', ruta: '/blogs/juegos-de-mesa' });
    expect(ui.getByText('Catan (3 a 4 jugadores)')).toBeTruthy();
    expect(ui.getByText('Pandemic (2 a 4 jugadores)')).toBeTruthy();
  });
  it('un artículo inexistente muestra un aviso', () => {
    expect(renderApp(<BlogArticulo />, { path: '/blogs/:id', ruta: '/blogs/xxx' }).ui.getByText('No encontramos ese artículo')).toBeTruthy();
  });
  it('NotFound ofrece volver al inicio', () => {
    expect(renderApp(<NotFound />).ui.getByText('Volver al inicio').getAttribute('href')).toBe('/');
  });
});
