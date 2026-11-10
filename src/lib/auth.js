// Usuarios, sesión, roles y niveles LevelUp (auth.js del Parcial 1). Todo en localStorage, sin backend.
// Las contraseñas se guardan en texto plano solo porque esta entrega es un frontend sin servidor.
import { LS } from './storage';

export const CLAVE_USUARIOS = 'lug_usuarios';
export const CLAVE_SESION = 'lug_sesion';
export const ROLES = ['Administrador', 'Cliente', 'Vendedor'];
export const PUNTOS_POR_REFERIDO = 100;
export const NIVELES = [
  { nivel: 1, desde: 0, nombre: 'Novato' },
  { nivel: 2, desde: 200, nombre: 'Jugador' },
  { nivel: 3, desde: 500, nombre: 'Veterano' },
  { nivel: 4, desde: 1000, nombre: 'Leyenda' },
];

export function usuariosIniciales() {
  const base = {
    telefono: '',
    puntos: 0,
    referidoPor: '',
    region: 'Región Metropolitana de Santiago',
    comuna: 'Santiago',
    direccion: "Av. Libertador Bernardo O'Higgins 1234",
  };
  return [
    { ...base, run: '111111111', nombre: 'Ana', apellidos: 'Administradora Level-Up', correo: 'admin@duoc.cl', password: 'admin123', fechaNacimiento: '1990-05-10', tipo: 'Administrador', codigoReferido: 'LUPADMIN', descuentoDuoc: true },
    { ...base, run: '222222222', nombre: 'Vicente', apellidos: 'Vendedor Level-Up', correo: 'vendedor@duoc.cl', password: 'vend123', fechaNacimiento: '1995-08-22', tipo: 'Vendedor', codigoReferido: 'LUPVENDE', descuentoDuoc: true },
    { ...base, run: '123456785', nombre: 'Camila', apellidos: 'Cliente Demo', correo: 'cliente@gmail.com', password: 'cliente1', fechaNacimiento: '2000-03-14', tipo: 'Cliente', codigoReferido: 'LUPCAMIL', descuentoDuoc: false },
    { ...base, run: '201234565', nombre: 'Diego', apellidos: 'Alumno Duoc', correo: 'alumno@duoc.cl', password: 'duoc1234', fechaNacimiento: '2003-11-02', tipo: 'Cliente', codigoReferido: 'LUPDIEGO', descuentoDuoc: true },
  ];
}

export function getUsuarios() {
  let usuarios = LS.get(CLAVE_USUARIOS, null);
  if (!Array.isArray(usuarios) || usuarios.length === 0) {
    usuarios = usuariosIniciales();
    LS.set(CLAVE_USUARIOS, usuarios);
  }
  return usuarios;
}

export function guardarUsuarios(usuarios) {
  return LS.set(CLAVE_USUARIOS, usuarios);
}

export function buscarUsuarioPorCorreo(correo) {
  const c = String(correo || '').trim().toLowerCase();
  return getUsuarios().find((u) => u.correo.toLowerCase() === c) || null;
}

export function esCorreoDuoc(correo) {
  const c = String(correo || '').trim().toLowerCase();
  return c.endsWith('@duoc.cl') || c.endsWith('@profesor.duoc.cl');
}

export function generarCodigoReferido(aleatorio = Math.random) {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let codigo = 'LUP';
  for (let i = 0; i < 5; i++) codigo += letras[Math.floor(aleatorio() * letras.length)];
  return codigo;
}

/* ---------- Sesión ---------- */
export function getSesion() {
  const correo = LS.get(CLAVE_SESION, null);
  return correo ? buscarUsuarioPorCorreo(correo) : null;
}

export function iniciarSesion(correo, password) {
  const usuario = buscarUsuarioPorCorreo(correo);
  if (!usuario) {
    return { ok: false, campo: 'correo', mensaje: 'No encontramos una cuenta con ese correo. Revisa que esté bien escrito o regístrate.' };
  }
  if (usuario.password !== password) return { ok: false, campo: 'password', mensaje: 'La contraseña no coincide con la de esta cuenta.' };
  LS.set(CLAVE_SESION, usuario.correo);
  return { ok: true, usuario };
}

export function cerrarSesion() {
  LS.remove(CLAVE_SESION);
}

export function calcularNivel(puntos) {
  let actual = NIVELES[0];
  NIVELES.forEach((n) => {
    if (puntos >= n.desde) actual = n;
  });
  return actual;
}

/* Descuento de por vida del 20 % para correos Duoc */
export function descuentoDeUsuario(usuario) {
  return usuario && usuario.descuentoDuoc ? 0.2 : 0;
}

export function esPersonalInterno(usuario) {
  return Boolean(usuario) && (usuario.tipo === 'Administrador' || usuario.tipo === 'Vendedor');
}

/* Crea un cliente nuevo y, si trae código de referido válido, suma puntos al referente */
export function registrarUsuario(datos, { tipoForzado = null, generar = generarCodigoReferido } = {}) {
  const usuarios = getUsuarios();
  const nuevo = {
    run: datos.run.trim().toUpperCase(),
    nombre: datos.nombre.trim(),
    apellidos: datos.apellidos.trim(),
    correo: datos.correo.trim().toLowerCase(),
    password: datos.password,
    fechaNacimiento: datos.fechaNacimiento || '',
    telefono: (datos.telefono || '').trim(),
    tipo: tipoForzado || datos.tipo,
    region: datos.region,
    comuna: datos.comuna,
    direccion: datos.direccion.trim(),
    puntos: 0,
    codigoReferido: generar(),
    referidoPor: '',
    descuentoDuoc: esCorreoDuoc(datos.correo),
  };
  let mensajeReferido = '';
  const codigoRef = (datos.referido || '').trim().toUpperCase();
  if (tipoForzado && codigoRef) {
    const referente = usuarios.find((u) => u.codigoReferido === codigoRef);
    if (referente) {
      referente.puntos = (referente.puntos || 0) + PUNTOS_POR_REFERIDO;
      nuevo.referidoPor = codigoRef;
      mensajeReferido = `Tu referente ganó ${PUNTOS_POR_REFERIDO} puntos LevelUp gracias a ti.`;
    }
  }
  usuarios.push(nuevo);
  guardarUsuarios(usuarios);
  return { usuario: nuevo, mensajeReferido };
}

export function actualizarUsuario(run, datos) {
  const usuarios = getUsuarios();
  const u = usuarios.find((x) => x.run === run);
  if (!u) return null;
  Object.assign(u, {
    nombre: datos.nombre.trim(),
    apellidos: datos.apellidos.trim(),
    correo: datos.correo.trim().toLowerCase(),
    fechaNacimiento: datos.fechaNacimiento || '',
    telefono: (datos.telefono || '').trim(),
    tipo: datos.tipo,
    region: datos.region,
    comuna: datos.comuna,
    direccion: datos.direccion.trim(),
    descuentoDuoc: esCorreoDuoc(datos.correo),
  });
  if (datos.password) u.password = datos.password;
  guardarUsuarios(usuarios);
  return u;
}

/* Reglas para eliminar: no a sí mismo ni al último administrador. Devuelve "" si se puede */
export function motivoNoEliminar(usuarios, usuario, actual) {
  if (usuario.correo === actual.correo) return 'No puedes eliminar tu propia cuenta mientras tienes la sesión abierta.';
  if (usuario.tipo === 'Administrador' && usuarios.filter((x) => x.tipo === 'Administrador').length === 1) {
    return 'Debe existir al menos un Administrador.';
  }
  return '';
}
