import { cleanup, fireEvent, render } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import SiteNavbar from './SiteNavbar';
import SessionBar from './SessionBar';
import Footer from './Footer';
import StoreLayout from './StoreLayout';
import AdminLayout from './AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import ProductFilters, { FILTROS_VACIOS, errorPrecioMax } from './ProductFilters';
import ProductGrid from './ProductGrid';
import CouponForm from './CouponForm';
import { conSesion, renderApp } from '../test/helpers';
import { getProductos } from '../lib/store';
import { LS } from '../lib/storage';

describe('SiteNavbar', () => {
  it('muestra los 5 enlaces de navegación y el contador del carrito', () => {
    const { ui } = renderApp(<SiteNavbar />);
    ['Home', 'Productos', 'Nosotros', 'Blogs', 'Contacto'].forEach((t) => expect(ui.getByText(t)).toBeTruthy());
    expect(ui.getByTestId('contador-carrito').textContent).toBe('0');
  });
  it('el contador refleja los productos del carrito guardado', () => {
    LS.set('lug_carrito', [{ codigo: 'MS001', cantidad: 3 }]);
    expect(renderApp(<SiteNavbar />).ui.getByTestId('contador-carrito').textContent).toBe('3');
  });
  it('el botón de menú abre y cierra la navegación en móvil', () => {
    const { ui, container } = renderApp(<SiteNavbar />);
    const boton = ui.getByLabelText('Abrir menú');
    expect(boton.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(boton);
    expect(boton.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('#menu-principal').className).toContain('show');
    fireEvent.click(ui.getByText('Nosotros'));
    expect(container.querySelector('#menu-principal').className).not.toContain('show');
  });
});

describe('SessionBar', () => {
  it('sin sesión ofrece iniciar sesión y registrarse', () => {
    const { ui } = renderApp(<SessionBar />);
    expect(ui.getByText('Iniciar sesión').getAttribute('href')).toBe('/login');
    expect(ui.getByText('Registrar usuario').getAttribute('href')).toBe('/registro');
  });
  it('un cliente ve su nombre, nivel y puntos, sin enlace al panel', () => {
    conSesion('cliente@gmail.com');
    const { ui } = renderApp(<SessionBar />);
    expect(ui.getByText(/Hola, Camila · Nivel 1 Novato · 0 pts/)).toBeTruthy();
    expect(ui.queryByText('Panel de administración')).toBeNull();
  });
  it('un cliente ve su código de referido; el personal interno no', () => {
    conSesion('cliente@gmail.com');
    expect(renderApp(<SessionBar />).ui.getByTestId('codigo-referido').textContent).toBe('LUPCAMIL');
    cleanup();
    conSesion('admin@duoc.cl');
    expect(renderApp(<SessionBar />).ui.queryByTestId('codigo-referido')).toBeNull();
  });
  it('con sesión ofrece el enlace a Mis pedidos', () => {
    conSesion('cliente@gmail.com');
    expect(renderApp(<SessionBar />).ui.getByText('Mis pedidos').getAttribute('href')).toBe('/mis-pedidos');
  });
  it('el administrador ve el enlace al panel', () => {
    conSesion('admin@duoc.cl');
    expect(renderApp(<SessionBar />).ui.getByText('Panel de administración').getAttribute('href')).toBe('/admin');
  });
  it('cerrar sesión limpia la sesión y avisa con un toast', () => {
    conSesion('cliente@gmail.com');
    const { ui } = renderApp(<SessionBar />);
    fireEvent.click(ui.getByText('Cerrar sesión'));
    expect(localStorage.getItem('lug_sesion')).toBeNull();
    expect(ui.getByText('Iniciar sesión')).toBeTruthy();
    expect(ui.getByText('Cerraste sesión. ¡Vuelve pronto!')).toBeTruthy();
  });
});

describe('Footer (newsletter)', () => {
  it('lista las 10 categorías con enlace al catálogo filtrado', () => {
    const { ui } = renderApp(<Footer />);
    expect(ui.getByText('Juegos de Mesa').getAttribute('href')).toBe('/productos?categoria=Juegos%20de%20Mesa');
    expect(ui.getAllByRole('listitem').length).toBe(10);
  });
  it('valida el correo del newsletter antes de suscribir', () => {
    const { ui } = renderApp(<Footer />);
    fireEvent.click(ui.getByText('Suscribirme'));
    expect(ui.getByText('El correo es obligatorio.')).toBeTruthy();
    fireEvent.change(ui.getByLabelText('Correo para el newsletter'), { target: { value: 'ana@hotmail.com' } });
    expect(ui.getByText(/Solo se aceptan correos/)).toBeTruthy();
  });
  it('sugiere el dominio correcto ante un error de tipeo', () => {
    const { ui } = renderApp(<Footer />);
    fireEvent.change(ui.getByLabelText('Correo para el newsletter'), { target: { value: 'ana@gmial.com' } });
    expect(ui.getByText('¿Quisiste escribir ana@gmail.com?')).toBeTruthy();
  });
  it('suscribe un correo válido, limpia el campo y confirma', () => {
    const { ui } = renderApp(<Footer />);
    const campo = ui.getByLabelText('Correo para el newsletter');
    fireEvent.change(campo, { target: { value: 'ana@gmail.com' } });
    fireEvent.click(ui.getByText('Suscribirme'));
    expect(LS.get('lug_newsletter', [])).toEqual(['ana@gmail.com']);
    expect(campo.value).toBe('');
    expect(ui.getByText(/Te suscribiste al newsletter/)).toBeTruthy();
  });
});

describe('StoreLayout y AdminLayout', () => {
  it('StoreLayout envuelve el contenido con cabecera, pie y vuelve arriba al navegar (scrollTo simulado)', () => {
    spyOn(window, 'scrollTo');
    const { ui } = renderApp(<StoreLayout />, { path: '/', extra: <Route path="/" element={<StoreLayout />}><Route index element={<p>contenido</p>} /></Route> });
    expect(ui.getByText('contenido')).toBeTruthy();
    expect(ui.getByText('Saltar al contenido')).toBeTruthy();
    expect(ui.getByText('Únete al newsletter')).toBeTruthy();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
  const montarAdmin = (correo) => {
    conSesion(correo);
    return renderApp(<p>fuera</p>, { path: '/nada', ruta: '/admin', extra: <Route path="/admin" element={<ProtectedRoute roles={['Administrador', 'Vendedor']}><AdminLayout /></ProtectedRoute>}><Route index element={<p>contenido admin</p>} /><Route path="*" element={<p>otra vista</p>} /></Route> });
  };
  it('AdminLayout del administrador muestra el menú completo, incluido Usuarios', () => {
    const { ui } = montarAdmin('admin@duoc.cl');
    ['Dashboard', 'Órdenes', 'Productos', 'Usuarios', 'Ver tienda'].forEach((t) => expect(ui.getByText(t)).toBeTruthy());
    expect(ui.getByText('contenido admin')).toBeTruthy();
    expect(ui.getByText('Administrador')).toBeTruthy();
  });
  it('AdminLayout del vendedor oculta el acceso a Usuarios', () => {
    const { ui } = montarAdmin('vendedor@duoc.cl');
    expect(ui.queryByText('Usuarios')).toBeNull();
    expect(ui.getByText('Productos')).toBeTruthy();
  });
  it('cada enlace del panel cierra el menú móvil al navegar', () => {
    const { ui, container } = montarAdmin('admin@duoc.cl');
    ['Órdenes', 'Productos', 'Usuarios', 'Dashboard'].forEach((texto) => {
      fireEvent.click(ui.getByText('Menú'));
      expect(container.querySelector('#menu-admin').className).toContain('d-flex');
      fireEvent.click(ui.getByText(texto));
      expect(container.querySelector('#menu-admin').className).toContain('d-none');
    });
  });
  it('el botón Menú despliega el panel en pantallas pequeñas y Cerrar sesión sale', () => {
    const { ui, container } = montarAdmin('admin@duoc.cl');
    fireEvent.click(ui.getByText('Menú'));
    expect(container.querySelector('#menu-admin').className).toContain('d-flex');
    fireEvent.click(ui.getByText('Cerrar sesión'));
    expect(localStorage.getItem('lug_sesion')).toBeNull();
  });
});

describe('ProtectedRoute', () => {
  const montar = (roles) =>
    renderApp(<p>login</p>, {
      path: '/login',
      ruta: '/secreto',
      extra: (
        <>
          <Route path="/secreto" element={<ProtectedRoute roles={roles}><p>zona secreta</p></ProtectedRoute>} />
          <Route path="/" element={<p>inicio</p>} />
        </>
      ),
    });
  it('sin sesión redirige al login', () => {
    expect(montar(['Administrador']).ui.getByText('login')).toBeTruthy();
  });
  it('con rol no permitido redirige al inicio', () => {
    conSesion('cliente@gmail.com');
    expect(montar(['Administrador']).ui.queryByText('zona secreta')).toBeNull();
  });
  it('con rol permitido muestra el contenido', () => {
    conSesion('vendedor@duoc.cl');
    expect(montar(['Administrador', 'Vendedor']).ui.getByText('zona secreta')).toBeTruthy();
  });
});

describe('ProductFilters, ProductGrid y CouponForm', () => {
  it('errorPrecioMax valida el precio máximo', () => {
    expect(errorPrecioMax('')).toBe('');
    expect(errorPrecioMax('5000')).toBe('');
    expect(errorPrecioMax('-1')).toContain('mayor o igual a 0');
  });
  it('ProductFilters informa cada cambio y permite limpiar (callbacks simulados)', () => {
    const cambio = jasmine.createSpy('onCambio');
    const limpiar = jasmine.createSpy('onLimpiar');
    const { ui } = renderApp(<ProductFilters filtros={FILTROS_VACIOS} onCambio={cambio} onLimpiar={limpiar} />);
    fireEvent.change(ui.getByLabelText('Buscar'), { target: { name: 'q', value: 'mouse' } });
    expect(cambio).toHaveBeenCalledWith({ ...FILTROS_VACIOS, q: 'mouse' });
    fireEvent.change(ui.getByLabelText('Categoría'), { target: { name: 'categoria', value: 'Consolas' } });
    expect(cambio).toHaveBeenCalledWith({ ...FILTROS_VACIOS, categoria: 'Consolas' });
    fireEvent.click(ui.getByText('Limpiar'));
    expect(limpiar).toHaveBeenCalledTimes(1);
    expect(ui.getAllByRole('option').length).toBeGreaterThan(10);
  });
  it('ProductFilters muestra el error del precio máximo', () => {
    const { ui } = renderApp(<ProductFilters filtros={{ ...FILTROS_VACIOS, precioMax: '-5' }} onCambio={() => {}} onLimpiar={() => {}} />);
    expect(ui.getByText(/mayor o igual a 0/)).toBeTruthy();
  });
  it('ProductGrid añade al carrito y avisa con un toast; también avisa si no se puede', () => {
    const { ui } = renderApp(<><SiteNavbar /><ProductGrid productos={getProductos().slice(0, 2)} /></>);
    fireEvent.click(ui.getAllByText('Añadir')[0]);
    expect(ui.getByText('Agregaste Catan al carrito.')).toBeTruthy();
    expect(ui.getByTestId('contador-carrito').textContent).toBe('1');
  });
  it('ProductGrid muestra el error cuando se excede el stock', () => {
    const ps = getProductos().filter((p) => p.codigo === 'CO001'); // stock 4
    LS.set('lug_carrito', [{ codigo: 'CO001', cantidad: 4 }]);
    const { ui } = renderApp(<ProductGrid productos={ps} />);
    fireEvent.click(ui.getByText('Añadir'));
    expect(ui.getByText(/Solo quedan 4 unidades de PlayStation 5/)).toBeTruthy();
  });
  it('CouponForm valida el cupón y entrega el código aplicado en mayúsculas', () => {
    const aplicar = jasmine.createSpy('onAplicar');
    const { ui } = renderApp(<CouponForm subtotal={60000} onAplicar={aplicar} />);
    fireEvent.click(ui.getByText('Aplicar'));
    expect(ui.getByText('Escribe un cupón para aplicarlo.')).toBeTruthy();
    fireEvent.change(ui.getByLabelText('Cupón de descuento'), { target: { name: 'cupon', value: 'gamer5000' } });
    fireEvent.click(ui.getByText('Aplicar'));
    expect(aplicar).toHaveBeenCalledOnceWith('GAMER5000');
  });
  it('CouponForm rechaza GAMER5000 si no se alcanza el mínimo', () => {
    const aplicar = jasmine.createSpy('onAplicar');
    const { ui } = renderApp(<CouponForm subtotal={10000} onAplicar={aplicar} />);
    fireEvent.change(ui.getByLabelText('Cupón de descuento'), { target: { name: 'cupon', value: 'GAMER5000' } });
    fireEvent.click(ui.getByText('Aplicar'));
    expect(aplicar).not.toHaveBeenCalled();
    expect(ui.getByText(/compra mínima de \$50\.000/)).toBeTruthy();
  });
});
