// Formato de precios, imágenes y fechas (migrado de utils.js del Parcial 1)
export function formatoCLP(numero) {
  const n = Number(numero) || 0;
  return '$' + n.toLocaleString('es-CL', { maximumFractionDigits: 2 });
}

/* Un producto con precio 0 se muestra como FREE */
export function formatoPrecio(numero) {
  return Number(numero) === 0 ? 'FREE' : formatoCLP(numero);
}

/* Las imágenes viven en public/img; se usa ruta relativa para funcionar con HashRouter y GitHub Pages */
export function rutaImagen(ruta) {
  if (!ruta) return 'img/logo.png';
  return ruta;
}

export function fechaLegible(iso) {
  const d = new Date(iso);
  return d.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
}

export function pluralizar(n, singular, plural) {
  return `${n} ${n === 1 ? singular : plural}`;
}
