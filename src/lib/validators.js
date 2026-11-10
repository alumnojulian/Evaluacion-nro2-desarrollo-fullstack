// Validadores del Parcial 1 (utils.js). Cada uno devuelve "" si es correcto o el mensaje de error.
export const DOMINIOS_PERMITIDOS = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];

const CONCORDANCIA = {
  m: ['es', 'obligatorio', 'puede'],
  f: ['es', 'obligatoria', 'puede'],
  mp: ['son', 'obligatorios', 'pueden'],
  fp: ['son', 'obligatorias', 'pueden'],
};

export function validarTextoLargo(valor, etiqueta, { requerido = true, max = 100, min = 0, genero = 'm' } = {}) {
  const [verbo, adjetivo, poder] = CONCORDANCIA[genero];
  const v = (valor ?? '').trim();
  if (!v) return requerido ? `${etiqueta} ${verbo} ${adjetivo}.` : '';
  if (min && v.length < min) return `${etiqueta} debe tener al menos ${min} caracteres.`;
  if (v.length > max) return `${etiqueta} no ${poder} superar los ${max} caracteres (tienes ${v.length}).`;
  return '';
}

export function validarCorreo(valor, { requerido = true, max = 100 } = {}) {
  const v = (valor ?? '').trim();
  if (!v) return requerido ? 'El correo es obligatorio.' : '';
  if (v.length > max) return `El correo no puede superar los ${max} caracteres (tienes ${v.length}).`;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Escribe un correo con formato válido, por ejemplo nombre@duoc.cl.';
  if (!DOMINIOS_PERMITIDOS.some((d) => v.toLowerCase().endsWith(d))) {
    return 'Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.';
  }
  return '';
}

export function distanciaEdicion(a, b) {
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return m[a.length][b.length];
}

/* Sugerencia dinámica: detecta errores de tipeo en el dominio (gmial.com → gmail.com) */
export function sugerirCorreo(valor) {
  const v = (valor ?? '').trim().toLowerCase();
  const pos = v.indexOf('@');
  if (pos < 1 || pos === v.length - 1) return '';
  const local = v.slice(0, pos);
  const dominio = v.slice(pos + 1);
  if (DOMINIOS_PERMITIDOS.some((d) => d === '@' + dominio)) return '';
  for (const permitido of DOMINIOS_PERMITIDOS) {
    const d = permitido.slice(1);
    const dist = distanciaEdicion(dominio, d);
    if (dist > 0 && dist <= 2) return `¿Quisiste escribir ${local}@${d}?`;
  }
  return '';
}

/* Dígito verificador del RUN (módulo 11) */
export function calcularDV(cuerpo) {
  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';
  if (resto === 10) return 'K';
  return String(resto);
}

export function validarRun(valor) {
  const v = (valor ?? '').trim().toUpperCase();
  if (!v) return 'El RUN es obligatorio.';
  if (!/^\d+[\dK]$/.test(v)) return 'Escribe el RUN sin puntos ni guion, por ejemplo 123456785 (si termina en K, escríbela igual).';
  if (v.length < 7) return `El RUN debe tener al menos 7 caracteres (tienes ${v.length}).`;
  if (v.length > 9) return `El RUN no puede superar los 9 caracteres (tienes ${v.length}).`;
  const cuerpo = v.slice(0, -1);
  const dv = v.slice(-1);
  if (dv !== calcularDV(cuerpo)) return 'El RUN no es válido: el dígito verificador no coincide.';
  return '';
}

export function validarPassword(valor) {
  if (!valor) return 'La contraseña es obligatoria.';
  if (valor.length < 4 || valor.length > 10) return `La contraseña debe tener entre 4 y 10 caracteres (tienes ${valor.length}).`;
  return '';
}

export function calcularEdad(fechaISO, hoy = new Date()) {
  const nac = new Date(fechaISO + 'T00:00:00');
  let edad = hoy.getFullYear() - nac.getFullYear();
  const cumple = new Date(hoy.getFullYear(), nac.getMonth(), nac.getDate());
  if (hoy < cumple) edad--;
  return edad;
}

export function validarFechaNacimiento(valor, { requerida = false, minEdad = 0 } = {}) {
  if (!valor) return requerida ? 'La fecha de nacimiento es obligatoria.' : '';
  const fecha = new Date(valor + 'T00:00:00');
  if (Number.isNaN(fecha.getTime())) return 'Ingresa una fecha válida.';
  if (fecha > new Date()) return 'La fecha de nacimiento no puede estar en el futuro.';
  if (fecha.getFullYear() < 1900) return 'Ingresa una fecha posterior a 1900.';
  if (minEdad && calcularEdad(valor) < minEdad) return `Debes tener al menos ${minEdad} años para registrarte.`;
  return '';
}

export function validarTelefono(valor) {
  const v = (valor ?? '').replace(/[\s-]/g, '');
  if (!v) return '';
  if (!/^(\+?56)?9\d{8}$/.test(v)) return 'Ingresa un móvil chileno, por ejemplo +56 9 1234 5678.';
  return '';
}

/* Número con reglas: entero o decimal, con mínimo */
export function validarNumero(valor, etiqueta, { requerido = true, min = 0, entero = false } = {}) {
  const v = String(valor ?? '').trim().replace(',', '.');
  if (v === '') return requerido ? `${etiqueta} es obligatorio.` : '';
  if (!/^-?\d+(\.\d+)?$/.test(v)) return `${etiqueta} debe ser un número.`;
  const n = Number(v);
  if (entero && !Number.isInteger(n)) return `${etiqueta} debe ser un número entero (sin decimales).`;
  if (n < min) return `${etiqueta} no puede ser menor que ${min}.`;
  return '';
}
