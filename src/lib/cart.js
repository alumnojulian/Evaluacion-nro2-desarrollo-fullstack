// Reglas del carrito (carrito.js del Parcial 1), escritas como funciones puras para poder probarlas:
// 1. No se agrega un producto sin stock.  2. La cantidad nunca supera el stock.
// 3. La cantidad mínima es 1.  4. Los descuentos no se acumulan: se aplica el mayor entre Duoc 20 % y el cupón.
// 5. Pagar crea la orden, descuenta el stock y vacía el carrito.
import { descuentoDeUsuario } from './auth';
import { formatoCLP } from './format';

export const CUPONES = {
  LEVELUP10: { tipo: 'porcentaje', valor: 10, texto: '10 % de descuento' },
  GAMER5000: { tipo: 'monto', valor: 5000, minimo: 50000, texto: '$5.000 de descuento en compras desde $50.000' },
};

export function contarItems(carrito) {
  return carrito.reduce((total, linea) => total + linea.cantidad, 0);
}

export function agregarLinea(carrito, producto, cantidad = 1) {
  if (!producto) return { ok: false, mensaje: 'Este producto ya no está disponible.', carrito };
  if (producto.stock <= 0) return { ok: false, mensaje: `${producto.nombre} está sin stock por ahora.`, carrito };
  const linea = carrito.find((l) => l.codigo === producto.codigo);
  const yaAgregadas = linea ? linea.cantidad : 0;
  if (yaAgregadas + cantidad > producto.stock) {
    return {
      ok: false,
      mensaje: `Solo quedan ${producto.stock} unidades de ${producto.nombre} y ya tienes ${yaAgregadas} en el carrito.`,
      carrito,
    };
  }
  const nuevo = linea
    ? carrito.map((l) => (l.codigo === producto.codigo ? { ...l, cantidad: l.cantidad + cantidad } : l))
    : [...carrito, { codigo: producto.codigo, cantidad }];
  return { ok: true, mensaje: `Agregaste ${producto.nombre} al carrito.`, carrito: nuevo };
}

export function cambiarCantidad(carrito, producto, cantidad) {
  const linea = producto && carrito.find((l) => l.codigo === producto.codigo);
  if (!producto || !linea) return { ok: false, mensaje: 'Ese producto no está en tu carrito.', carrito };
  const n = Math.floor(Number(cantidad));
  if (!Number.isFinite(n) || n < 1) {
    return { ok: false, mensaje: 'La cantidad mínima es 1. Usa Eliminar para quitar el producto.', carrito };
  }
  if (n > producto.stock) {
    return {
      ok: false,
      mensaje: `Solo quedan ${producto.stock} unidades de ${producto.nombre}.`,
      carrito: carrito.map((l) => (l.codigo === producto.codigo ? { ...l, cantidad: producto.stock } : l)),
    };
  }
  return { ok: true, mensaje: '', carrito: carrito.map((l) => (l.codigo === producto.codigo ? { ...l, cantidad: n } : l)) };
}

export function quitarLinea(carrito, codigo) {
  return carrito.filter((l) => l.codigo !== codigo);
}

/* Calcula líneas, subtotal, descuento aplicado y total */
export function calcularResumen({ carrito, productos, usuario = null, cupon = '' }) {
  const lineas = carrito
    .map((l) => {
      const producto = productos.find((p) => p.codigo === l.codigo);
      return producto ? { producto, cantidad: l.cantidad } : null;
    })
    .filter(Boolean);
  const subtotal = lineas.reduce((t, l) => t + l.producto.precio * l.cantidad, 0);

  const descuentoDuoc = Math.round(subtotal * descuentoDeUsuario(usuario));

  const def = CUPONES[cupon];
  let descuentoCupon = 0;
  if (def && (!def.minimo || subtotal >= def.minimo)) {
    descuentoCupon = def.tipo === 'porcentaje' ? Math.round((subtotal * def.valor) / 100) : Math.min(def.valor, subtotal);
  }

  let descuento = 0;
  let origen = '';
  if (descuentoDuoc >= descuentoCupon && descuentoDuoc > 0) {
    descuento = descuentoDuoc;
    origen = 'Descuento Duoc 20 %';
  } else if (descuentoCupon > 0) {
    descuento = descuentoCupon;
    origen = `Cupón ${cupon}`;
  }
  return { lineas, subtotal, descuento, origen, total: subtotal - descuento, codigoCupon: cupon };
}

export function validarCupon(valor, subtotal) {
  const v = (valor ?? '').trim().toUpperCase();
  if (!v) return 'Escribe un cupón para aplicarlo.';
  if (!/^[A-Z0-9]{4,15}$/.test(v)) return 'El cupón solo lleva letras y números (entre 4 y 15 caracteres).';
  const cupon = CUPONES[v];
  if (!cupon) return 'Ese cupón no existe o ya expiró.';
  if (cupon.minimo && subtotal < cupon.minimo) return `Este cupón requiere una compra mínima de ${formatoCLP(cupon.minimo)}.`;
  return '';
}

/* Arma la orden con numeración LUG-0001 */
export function crearOrden(resumen, usuario, ordenesPrevias, ahora = new Date()) {
  return {
    id: 'LUG-' + String(ordenesPrevias.length + 1).padStart(4, '0'),
    fecha: ahora.toISOString(),
    correo: usuario.correo,
    cliente: `${usuario.nombre} ${usuario.apellidos}`,
    items: resumen.lineas.map((l) => ({
      codigo: l.producto.codigo,
      nombre: l.producto.nombre,
      precio: l.producto.precio,
      cantidad: l.cantidad,
    })),
    subtotal: resumen.subtotal,
    descuento: resumen.descuento,
    total: resumen.total,
    estado: 'Pendiente',
  };
}

export function descontarStock(productos, lineas) {
  return productos.map((p) => {
    const l = lineas.find((x) => x.producto.codigo === p.codigo);
    return l ? { ...p, stock: Math.max(0, p.stock - l.cantidad) } : p;
  });
}

export function lineaSinStock(lineas) {
  return lineas.find((l) => l.cantidad > l.producto.stock) || null;
}
