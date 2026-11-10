import {
  CUPONES, agregarLinea, calcularResumen, cambiarCantidad, contarItems, crearOrden, descontarStock, lineaSinStock,
  quitarLinea, validarCupon,
} from './cart';

const mouse = { codigo: 'MS001', nombre: 'Mouse', precio: 49990, stock: 5 };
const pc = { codigo: 'CG001', nombre: 'PC', precio: 1299990, stock: 2 };
const sinStock = { codigo: 'ZZ', nombre: 'Agotado', precio: 1000, stock: 0 };
const productos = [mouse, pc, sinStock];
const duoc = { descuentoDuoc: true, nombre: 'Diego', apellidos: 'Alumno', correo: 'alumno@duoc.cl' };

describe('cart: líneas del carrito', () => {
  it('agrega un producto nuevo y suma cantidades de uno existente', () => {
    let r = agregarLinea([], mouse, 2);
    expect(r.ok).toBe(true);
    expect(r.carrito).toEqual([{ codigo: 'MS001', cantidad: 2 }]);
    r = agregarLinea(r.carrito, mouse, 1);
    expect(r.carrito[0].cantidad).toBe(3);
    expect(r.mensaje).toBe('Agregaste Mouse al carrito.');
  });
  it('no agrega productos inexistentes ni sin stock', () => {
    expect(agregarLinea([], null).ok).toBe(false);
    const r = agregarLinea([], sinStock);
    expect(r.ok).toBe(false);
    expect(r.mensaje).toBe('Agotado está sin stock por ahora.');
    expect(r.carrito).toEqual([]);
  });
  it('la cantidad en el carrito nunca supera el stock', () => {
    const r = agregarLinea([{ codigo: 'MS001', cantidad: 4 }], mouse, 2);
    expect(r.ok).toBe(false);
    expect(r.mensaje).toBe('Solo quedan 5 unidades de Mouse y ya tienes 4 en el carrito.');
  });
  it('cambiarCantidad respeta mínimo 1 y ajusta al stock máximo', () => {
    const base = [{ codigo: 'MS001', cantidad: 1 }];
    expect(cambiarCantidad(base, mouse, 3).carrito[0].cantidad).toBe(3);
    const bajo = cambiarCantidad(base, mouse, 0);
    expect(bajo.ok).toBe(false);
    expect(bajo.mensaje).toContain('cantidad mínima es 1');
    expect(cambiarCantidad(base, mouse, 'abc').ok).toBe(false);
    const alto = cambiarCantidad(base, mouse, 99);
    expect(alto.ok).toBe(false);
    expect(alto.carrito[0].cantidad).toBe(5);
    expect(cambiarCantidad(base, pc, 1).mensaje).toBe('Ese producto no está en tu carrito.');
  });
  it('quitarLinea y contarItems', () => {
    const c = [{ codigo: 'a', cantidad: 2 }, { codigo: 'b', cantidad: 3 }];
    expect(contarItems(c)).toBe(5);
    expect(quitarLinea(c, 'a')).toEqual([{ codigo: 'b', cantidad: 3 }]);
    expect(contarItems([])).toBe(0);
  });
});

describe('cart: resumen y descuentos', () => {
  const carrito = [{ codigo: 'MS001', cantidad: 2 }]; // subtotal 99.980
  it('calcula subtotal y total sin descuentos', () => {
    const r = calcularResumen({ carrito, productos });
    expect(r.subtotal).toBe(99980);
    expect(r.descuento).toBe(0);
    expect(r.total).toBe(99980);
    expect(r.lineas.length).toBe(1);
  });
  it('ignora líneas de productos que ya no existen', () => {
    expect(calcularResumen({ carrito: [{ codigo: 'FANTASMA', cantidad: 1 }], productos }).lineas).toEqual([]);
  });
  it('aplica el 20 % de descuento Duoc', () => {
    const r = calcularResumen({ carrito, productos, usuario: duoc });
    expect(r.descuento).toBe(19996);
    expect(r.origen).toBe('Descuento Duoc 20 %');
    expect(r.total).toBe(79984);
  });
  it('aplica el cupón LEVELUP10 (10 %) a un usuario sin descuento Duoc', () => {
    const r = calcularResumen({ carrito, productos, cupon: 'LEVELUP10' });
    expect(r.descuento).toBe(9998);
    expect(r.origen).toBe('Cupón LEVELUP10');
  });
  it('los descuentos no se acumulan: gana el mayor (Duoc 20 % > cupón 10 %)', () => {
    const r = calcularResumen({ carrito, productos, usuario: duoc, cupon: 'LEVELUP10' });
    expect(r.descuento).toBe(19996);
    expect(r.origen).toBe('Descuento Duoc 20 %');
  });
  it('GAMER5000 descuenta $5.000 solo desde $50.000 de compra', () => {
    expect(calcularResumen({ carrito, productos, cupon: 'GAMER5000' }).descuento).toBe(5000);
    expect(calcularResumen({ carrito: [{ codigo: 'MS001', cantidad: 1 }], productos, cupon: 'GAMER5000' }).descuento).toBe(0);
  });
  it('un cupón desconocido no descuenta', () => {
    expect(calcularResumen({ carrito, productos, cupon: 'FALSO' }).descuento).toBe(0);
  });
  it('definición de cupones del caso', () => {
    expect(Object.keys(CUPONES)).toEqual(['LEVELUP10', 'GAMER5000']);
  });
});

describe('cart: validarCupon', () => {
  it('valida vacío, formato, existencia y compra mínima', () => {
    expect(validarCupon('', 0)).toBe('Escribe un cupón para aplicarlo.');
    expect(validarCupon('ab!', 0)).toContain('letras y números');
    expect(validarCupon('NOEXISTE', 0)).toBe('Ese cupón no existe o ya expiró.');
    expect(validarCupon('gamer5000', 1000)).toBe('Este cupón requiere una compra mínima de $50.000.');
    expect(validarCupon('gamer5000', 60000)).toBe('');
    expect(validarCupon(' levelup10 ', 1000)).toBe('');
  });
});

describe('cart: órdenes y stock', () => {
  const resumen = calcularResumen({ carrito: [{ codigo: 'MS001', cantidad: 2 }], productos, usuario: duoc });
  it('crearOrden numera LUG-0001 y guarda el detalle', () => {
    const o = crearOrden(resumen, duoc, [], new Date('2026-01-02T03:04:05Z'));
    expect(o.id).toBe('LUG-0001');
    expect(o.estado).toBe('Pendiente');
    expect(o.cliente).toBe('Diego Alumno');
    expect(o.items).toEqual([{ codigo: 'MS001', nombre: 'Mouse', precio: 49990, cantidad: 2 }]);
    expect(o.total).toBe(79984);
    expect(crearOrden(resumen, duoc, [{}, {}]).id).toBe('LUG-0003');
  });
  it('descontarStock resta lo comprado sin pasar de 0 y no muta el original', () => {
    const nuevos = descontarStock(productos, resumen.lineas);
    expect(nuevos.find((p) => p.codigo === 'MS001').stock).toBe(3);
    expect(mouse.stock).toBe(5);
    const mucho = descontarStock(productos, [{ producto: mouse, cantidad: 99 }]);
    expect(mucho.find((p) => p.codigo === 'MS001').stock).toBe(0);
  });
  it('lineaSinStock detecta cantidades que superan el stock', () => {
    expect(lineaSinStock([{ producto: mouse, cantidad: 6 }]).producto.codigo).toBe('MS001');
    expect(lineaSinStock([{ producto: mouse, cantidad: 5 }])).toBeNull();
  });
});
