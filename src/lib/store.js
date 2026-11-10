// Productos, órdenes y mensajes en localStorage (almacen.js del Parcial 1)
import { LS } from './storage';
import { PRODUCTOS_INICIALES } from '../data/productos';
import { CLAVE_USUARIOS, CLAVE_SESION } from './auth';

export const CLAVE_PRODUCTOS = 'lug_productos';
export const CLAVE_ORDENES = 'lug_ordenes';
export const CLAVE_MENSAJES = 'lug_mensajes';
export const CLAVE_CARRITO = 'lug_carrito';
export const CLAVE_CUPON = 'lug_cupon';
export const CLAVE_NEWSLETTER = 'lug_newsletter';

export function getProductos() {
  let productos = LS.get(CLAVE_PRODUCTOS, null);
  if (!Array.isArray(productos) || productos.length === 0) {
    productos = PRODUCTOS_INICIALES.map((p) => ({ ...p }));
    LS.set(CLAVE_PRODUCTOS, productos);
  }
  return productos;
}

export function guardarProductos(productos) {
  return LS.set(CLAVE_PRODUCTOS, productos);
}

export function buscarProducto(codigo) {
  return getProductos().find((p) => p.codigo === codigo) || null;
}

/* Estado del stock: agotado, crítico (stock <= stock crítico) u ok */
export function estadoStock(producto) {
  if (producto.stock <= 0) return 'agotado';
  const critico = producto.stockCritico;
  if (critico !== undefined && critico !== null && critico !== '' && producto.stock <= Number(critico)) return 'critico';
  return 'ok';
}

/* Filtra y ordena el catálogo (usado por la página de productos) */
export function filtrarProductos(productos, { q = '', categoria = '', precioMax = '', orden = '' } = {}) {
  const texto = q.trim().toLowerCase();
  const max = Number(precioMax);
  const maxValido = precioMax !== '' && Number.isFinite(max) && max >= 0;
  const lista = productos.filter((p) => {
    if (categoria && p.categoria !== categoria) return false;
    if (texto && !`${p.nombre} ${p.codigo} ${p.categoria} ${p.fabricante || ''}`.toLowerCase().includes(texto)) return false;
    if (maxValido && p.precio > max) return false;
    return true;
  });
  if (orden === 'precio-asc') lista.sort((a, b) => a.precio - b.precio);
  if (orden === 'precio-desc') lista.sort((a, b) => b.precio - a.precio);
  if (orden === 'nombre') lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  return lista;
}

export function getOrdenes() {
  return LS.get(CLAVE_ORDENES, []);
}

export function guardarOrdenes(ordenes) {
  return LS.set(CLAVE_ORDENES, ordenes);
}

export function getMensajes() {
  return LS.get(CLAVE_MENSAJES, []);
}

export function guardarMensaje({ nombre, correo, comentario }) {
  const mensajes = getMensajes();
  mensajes.push({
    fecha: new Date().toISOString(),
    nombre: nombre.trim(),
    correo: correo.trim().toLowerCase(),
    comentario: comentario.trim(),
  });
  return LS.set(CLAVE_MENSAJES, mensajes);
}

export function suscribirNewsletter(correo) {
  const lista = LS.get(CLAVE_NEWSLETTER, []);
  const c = correo.trim().toLowerCase();
  if (!lista.includes(c)) lista.push(c);
  return LS.set(CLAVE_NEWSLETTER, lista);
}

/* Borra todos los datos de demostración y vuelve a la semilla inicial */
export function restablecerDatosDemo() {
  [CLAVE_PRODUCTOS, CLAVE_ORDENES, CLAVE_MENSAJES, CLAVE_USUARIOS, CLAVE_SESION, CLAVE_CARRITO, CLAVE_CUPON, CLAVE_NEWSLETTER].forEach((k) =>
    LS.remove(k)
  );
}

export const IMAGEN_POR_CATEGORIA = {
  'Juegos de Mesa': 'img/productos/catan.svg',
  Accesorios: 'img/productos/controlador.svg',
  Consolas: 'img/productos/ps5.svg',
  'Computadores Gamers': 'img/productos/pc.svg',
  'Sillas Gamers': 'img/productos/silla.svg',
  Mouse: 'img/productos/mouse.svg',
  Mousepad: 'img/productos/mousepad.svg',
  'Poleras Personalizadas': 'img/productos/polera.svg',
  'Polerones Gamers Personalizados': 'img/productos/poleron.svg',
  'Servicio Técnico': 'img/productos/servicio.svg',
};
export const MAX_IMAGEN_BYTES = 300 * 1024;

/* Crea o actualiza un producto desde los datos del formulario del mantenedor */
export function guardarProducto(datos, editado, imagenFinal) {
  const productos = getProductos();
  const base = {
    nombre: datos.nombre.trim(),
    descripcion: (datos.descripcion || '').trim(),
    precio: Number(String(datos.precio).replace(',', '.')),
    stock: Number(datos.stock),
    stockCritico: String(datos.stockCritico ?? '').trim() === '' ? '' : Number(datos.stockCritico),
    categoria: datos.categoria,
    fabricante: (datos.fabricante || '').trim(),
    distribuidor: (datos.distribuidor || '').trim() || 'Level-Up Gamer',
    imagen: imagenFinal,
  };
  let producto;
  if (editado) {
    producto = productos.find((p) => p.codigo === editado.codigo);
    Object.assign(producto, base);
  } else {
    producto = { codigo: datos.codigo.trim(), ...base };
    productos.push(producto);
  }
  guardarProductos(productos);
  return producto;
}

export function eliminarProducto(codigo) {
  guardarProductos(getProductos().filter((p) => p.codigo !== codigo));
}
