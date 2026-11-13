import { PRODUCTOS_INICIALES } from '../data/productos';
import {
  CLAVE_PRODUCTOS, buscarProducto, eliminarProducto, estadoStock, filtrarProductos, getMensajes, getOrdenes,
  getOrdenesDeUsuario, getProductos, guardarMensaje, guardarOrdenes, guardarProducto, restablecerDatosDemo, suscribirNewsletter,
} from './store';
import { LS } from './storage';

describe('store: productos', () => {
  beforeEach(() => localStorage.clear());
  afterAll(() => localStorage.clear());

  it('carga la semilla de 12 productos y la guarda en localStorage', () => {
    expect(getProductos().length).toBe(PRODUCTOS_INICIALES.length);
    expect(PRODUCTOS_INICIALES.length).toBe(12);
    expect(LS.get(CLAVE_PRODUCTOS, []).length).toBe(12);
  });
  it('buscarProducto devuelve el producto o null', () => {
    expect(buscarProducto('CO001').nombre).toBe('PlayStation 5');
    expect(buscarProducto('XXX')).toBeNull();
  });
  it('estadoStock distingue agotado, crítico y ok', () => {
    expect(estadoStock({ stock: 0, stockCritico: 5 })).toBe('agotado');
    expect(estadoStock({ stock: 5, stockCritico: 5 })).toBe('critico');
    expect(estadoStock({ stock: 6, stockCritico: 5 })).toBe('ok');
    expect(estadoStock({ stock: 3, stockCritico: '' })).toBe('ok');
    expect(estadoStock({ stock: 3 })).toBe('ok');
  });
  it('la PlayStation 5 de la semilla ya está en stock crítico (4 de 5)', () => {
    expect(estadoStock(buscarProducto('CO001'))).toBe('critico');
  });
  it('filtrarProductos filtra por texto, categoría y precio máximo', () => {
    const ps = getProductos();
    expect(filtrarProductos(ps, { q: 'catan' }).map((p) => p.codigo)).toEqual(['JM001']);
    expect(filtrarProductos(ps, { categoria: 'Accesorios' }).length).toBe(2);
    expect(filtrarProductos(ps, { precioMax: '30000' }).every((p) => p.precio <= 30000)).toBe(true);
    expect(filtrarProductos(ps, { q: 'logitech' })[0].codigo).toBe('MS001');
    expect(filtrarProductos(ps, { q: 'zzzz' })).toEqual([]);
  });
  it('filtrarProductos ordena por precio y nombre, e ignora un precio máximo inválido', () => {
    const ps = getProductos();
    const asc = filtrarProductos(ps, { orden: 'precio-asc' }).map((p) => p.precio);
    expect(asc).toEqual(asc.slice().sort((a, b) => a - b));
    const desc = filtrarProductos(ps, { orden: 'precio-desc' }).map((p) => p.precio);
    expect(desc[0]).toBe(1299990);
    const nombres = filtrarProductos(ps, { orden: 'nombre' }).map((p) => p.nombre);
    expect(nombres[0].localeCompare(nombres[1], 'es')).toBeLessThan(1);
    expect(filtrarProductos(ps, { precioMax: '-5' }).length).toBe(12);
  });
  it('guardarProducto crea un producto nuevo con distribuidor por defecto', () => {
    const p = guardarProducto({ codigo: 'JM003', nombre: ' Azul ', descripcion: '', precio: '19990,5', stock: '10', stockCritico: '', categoria: 'Juegos de Mesa', fabricante: '', distribuidor: '' }, null, 'img/x.svg');
    expect(p).toEqual(jasmine.objectContaining({ codigo: 'JM003', nombre: 'Azul', precio: 19990.5, stock: 10, stockCritico: '', distribuidor: 'Level-Up Gamer', imagen: 'img/x.svg' }));
    expect(getProductos().length).toBe(13);
  });
  it('guardarProducto edita un producto existente sin cambiar su código', () => {
    const editado = buscarProducto('MS001');
    guardarProducto({ nombre: 'Mouse nuevo', descripcion: 'd', precio: '0', stock: '2', stockCritico: '3', categoria: 'Mouse', fabricante: 'F', distribuidor: 'D' }, editado, editado.imagen);
    const p = buscarProducto('MS001');
    expect(p.nombre).toBe('Mouse nuevo');
    expect(p.precio).toBe(0);
    expect(estadoStock(p)).toBe('critico');
    expect(getProductos().length).toBe(12);
  });
  it('eliminarProducto lo quita del catálogo', () => {
    eliminarProducto('MS001');
    expect(buscarProducto('MS001')).toBeNull();
  });
});

describe('store: órdenes, mensajes, newsletter y reinicio', () => {
  beforeEach(() => localStorage.clear());
  afterAll(() => localStorage.clear());

  it('guarda y lee órdenes', () => {
    expect(getOrdenes()).toEqual([]);
    guardarOrdenes([{ id: 'LUG-0001' }]);
    expect(getOrdenes()).toEqual([{ id: 'LUG-0001' }]);
  });
  it('getOrdenesDeUsuario devuelve solo las órdenes de ese correo, la más reciente primero', () => {
    guardarOrdenes([
      { id: 'LUG-0001', correo: 'cliente@gmail.com' },
      { id: 'LUG-0002', correo: 'otro@duoc.cl' },
      { id: 'LUG-0003', correo: 'cliente@gmail.com' },
      { id: 'LUG-0004' },
    ]);
    expect(getOrdenesDeUsuario(' Cliente@Gmail.com ').map((o) => o.id)).toEqual(['LUG-0003', 'LUG-0001']);
    expect(getOrdenesDeUsuario('nadie@duoc.cl')).toEqual([]);
    expect(getOrdenesDeUsuario('')).toEqual([]);
    expect(getOrdenes().map((o) => o.id)).toEqual(['LUG-0001', 'LUG-0002', 'LUG-0003', 'LUG-0004']);
  });
  it('guarda mensajes de contacto normalizados', () => {
    guardarMensaje({ nombre: ' Ana ', correo: 'ANA@Duoc.cl ', comentario: ' Hola ' });
    const m = getMensajes();
    expect(m.length).toBe(1);
    expect(m[0]).toEqual(jasmine.objectContaining({ nombre: 'Ana', correo: 'ana@duoc.cl', comentario: 'Hola' }));
  });
  it('el newsletter no duplica correos', () => {
    suscribirNewsletter('A@duoc.cl');
    suscribirNewsletter('a@duoc.cl');
    expect(LS.get('lug_newsletter', [])).toEqual(['a@duoc.cl']);
  });
  it('restablecerDatosDemo borra todas las claves lug_*', () => {
    getProductos();
    guardarOrdenes([{ id: 'x' }]);
    localStorage.setItem('lug_sesion', '"a"');
    restablecerDatosDemo();
    ['lug_productos', 'lug_ordenes', 'lug_sesion', 'lug_usuarios', 'lug_mensajes', 'lug_carrito', 'lug_cupon', 'lug_newsletter'].forEach((k) =>
      expect(localStorage.getItem(k)).toBeNull()
    );
  });
});
