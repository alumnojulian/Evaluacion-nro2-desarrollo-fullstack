import { act, fireEvent, render, within } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { CartProvider, useCart } from './CartContext';
import { DURACION_TOAST, ToastProvider, useToast } from './ToastContext';
import { MemoryRouter } from 'react-router-dom';
import { conSesion, FUTURO } from '../test/helpers';
import { buscarProducto, getOrdenes } from '../lib/store';

function AuthProbe() {
  const { usuario, login, logout } = useAuth();
  return (
    <div>
      <p data-testid="quien">{usuario ? usuario.nombre : 'nadie'}</p>
      <button onClick={() => login('admin@duoc.cl', 'admin123')}>entrar</button>
      <button onClick={() => login('admin@duoc.cl', 'mala')}>entrar mal</button>
      <button onClick={logout}>salir</button>
    </div>
  );
}

describe('AuthContext', () => {
  it('inicia sin sesión, permite login y logout', () => {
    const r = render(<AuthProvider><AuthProbe /></AuthProvider>);
    const ui = within(r.container);
    expect(ui.getByTestId('quien').textContent).toBe('nadie');
    fireEvent.click(ui.getByText('entrar mal'));
    expect(ui.getByTestId('quien').textContent).toBe('nadie');
    fireEvent.click(ui.getByText('entrar'));
    expect(ui.getByTestId('quien').textContent).toBe('Ana');
    fireEvent.click(ui.getByText('salir'));
    expect(ui.getByTestId('quien').textContent).toBe('nadie');
  });

  it('recupera la sesión guardada en localStorage', () => {
    conSesion('cliente@gmail.com');
    const r = render(<AuthProvider><AuthProbe /></AuthProvider>);
    expect(within(r.container).getByTestId('quien').textContent).toBe('Camila');
  });

  it('useAuth fuera del proveedor lanza un error claro', async () => {
    spyOn(console, 'error');
    await jasmine.spyOnGlobalErrorsAsync(async () => {
      expect(() => render(<AuthProbe />)).toThrowError(/AuthProvider/);
    });
  });
});

function ToastProbe() {
  const { mostrarToast } = useToast();
  return <button onClick={() => mostrarToast('Hola mundo', 'error')}>avisar</button>;
}

describe('ToastContext (temporizador simulado con jasmine.clock)', () => {
  beforeEach(() => jasmine.clock().install());
  afterEach(() => jasmine.clock().uninstall());

  it('muestra el mensaje y lo oculta después de la duración', () => {
    const r = render(<ToastProvider><ToastProbe /></ToastProvider>);
    const ui = within(r.container);
    fireEvent.click(ui.getByText('avisar'));
    expect(ui.getByText('Hola mundo').closest('.toast').className).toContain('lug-toast--error');
    act(() => jasmine.clock().tick(DURACION_TOAST + 10));
    expect(ui.queryByText('Hola mundo')).toBeNull();
  });

  it('useToast fuera del proveedor lanza un error claro', async () => {
    spyOn(console, 'error');
    await jasmine.spyOnGlobalErrorsAsync(async () => {
      expect(() => render(<ToastProbe />)).toThrowError(/ToastProvider/);
    });
  });
});

let ultimo;
function CartProbe() {
  const c = useCart();
  ultimo = c;
  return (
    <div>
      <p data-testid="items">{c.totalItems}</p>
      <p data-testid="total">{c.resumen.total}</p>
      <p data-testid="origen">{c.resumen.origen}</p>
    </div>
  );
}
const montarCarrito = () =>
  render(
    <MemoryRouter future={FUTURO}>
      <ToastProvider><AuthProvider><CartProvider><CartProbe /></CartProvider></AuthProvider></ToastProvider>
    </MemoryRouter>
  );

describe('CartContext', () => {
  it('agrega, cambia cantidad y quita productos', () => {
    const ui = within(montarCarrito().container);
    act(() => { expect(ultimo.agregar('MS001', 2).ok).toBe(true); });
    expect(ui.getByTestId('items').textContent).toBe('2');
    act(() => { ultimo.cambiar('MS001', 3); });
    expect(ui.getByTestId('items').textContent).toBe('3');
    act(() => { ultimo.quitar('MS001'); });
    expect(ui.getByTestId('items').textContent).toBe('0');
  });

  it('rechaza agregar más que el stock disponible', () => {
    montarCarrito();
    let r;
    act(() => { r = ultimo.agregar('CO001', 99); });
    expect(r.ok).toBe(false);
    expect(ultimo.totalItems).toBe(0);
  });

  it('persiste el carrito en localStorage y lo recupera', () => {
    montarCarrito();
    act(() => { ultimo.agregar('MS001', 1); });
    expect(JSON.parse(localStorage.getItem('lug_carrito'))).toEqual([{ codigo: 'MS001', cantidad: 1 }]);
    const ui = within(montarCarrito().container);
    expect(ui.getAllByTestId('items')[0].textContent).toBe('1');
  });

  it('aplica un cupón válido y rechaza uno inválido', () => {
    montarCarrito();
    act(() => { ultimo.agregar('MS001', 2); });
    let r;
    act(() => { r = ultimo.aplicarCupon('NOEXISTE'); });
    expect(r.ok).toBe(false);
    act(() => { r = ultimo.aplicarCupon('levelup10'); });
    expect(r).toEqual({ ok: true, codigo: 'LEVELUP10' });
    expect(ultimo.resumen.total).toBe(89982);
    expect(localStorage.getItem('lug_cupon')).toBe('"LEVELUP10"');
  });

  it('el descuento Duoc se aplica automáticamente con sesión Duoc', () => {
    conSesion('alumno@duoc.cl');
    const ui = within(montarCarrito().container);
    act(() => { ultimo.agregar('MS001', 1); });
    expect(ui.getByTestId('origen').textContent).toBe('Descuento Duoc 20 %');
    expect(ui.getByTestId('total').textContent).toBe('39992');
  });

  it('pagar sin sesión pide iniciar sesión', () => {
    montarCarrito();
    act(() => { ultimo.agregar('MS001', 1); });
    expect(ultimo.pagar()).toEqual({ ok: false, requiereLogin: true });
  });

  it('pagar con carrito vacío informa el problema', () => {
    conSesion('cliente@gmail.com');
    montarCarrito();
    expect(ultimo.pagar()).toEqual({ ok: false, mensaje: 'Tu carrito está vacío.' });
  });

  it('pagar crea la orden, descuenta el stock y vacía el carrito', () => {
    conSesion('cliente@gmail.com');
    const ui = within(montarCarrito().container);
    act(() => { ultimo.agregar('MS001', 2); });
    let r;
    act(() => { r = ultimo.pagar(); });
    expect(r.ok).toBe(true);
    expect(r.orden.id).toBe('LUG-0001');
    expect(getOrdenes().length).toBe(1);
    expect(buscarProducto('MS001').stock).toBe(38);
    expect(ui.getByTestId('items').textContent).toBe('0');
  });

  it('pagar falla si el stock bajó después de agregar al carrito', () => {
    conSesion('cliente@gmail.com');
    montarCarrito();
    act(() => { ultimo.agregar('CO001', 4); });
    const ps = JSON.parse(localStorage.getItem('lug_productos'));
    ps.find((p) => p.codigo === 'CO001').stock = 1;
    localStorage.setItem('lug_productos', JSON.stringify(ps));
    act(() => { ultimo.quitar('INEXISTENTE'); }); // fuerza un nuevo render para releer el catálogo
    let r;
    act(() => { r = ultimo.pagar(); });
    expect(r.ok).toBe(false);
    expect(r.mensaje).toContain('No hay stock suficiente de PlayStation 5');
  });

  it('vaciar limpia carrito y cupón', () => {
    montarCarrito();
    act(() => { ultimo.agregar('MS001', 2); ultimo.vaciar(); });
    expect(ultimo.totalItems).toBe(0);
    expect(ultimo.cupon).toBe('');
  });

  it('useCart fuera del proveedor lanza un error claro', async () => {
    spyOn(console, 'error');
    await jasmine.spyOnGlobalErrorsAsync(async () => {
      expect(() => render(<CartProbe />)).toThrowError(/CartProvider|AuthProvider/);
    });
  });
});
