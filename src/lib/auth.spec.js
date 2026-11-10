import {
  CLAVE_SESION, CLAVE_USUARIOS, NIVELES, actualizarUsuario, buscarUsuarioPorCorreo, calcularNivel, cerrarSesion,
  descuentoDeUsuario, esCorreoDuoc, esPersonalInterno, generarCodigoReferido, getSesion, getUsuarios,
  guardarUsuarios, iniciarSesion, motivoNoEliminar, registrarUsuario, usuariosIniciales,
} from './auth';

const datosRegistro = (extra = {}) => ({
  run: '123456785', nombre: ' Julian ', apellidos: 'Meneses', correo: 'Julian@Duoc.cl', password: 'clave1',
  fechaNacimiento: '2000-01-01', telefono: '', region: 'Región Metropolitana de Santiago', comuna: 'Santiago',
  direccion: 'Calle 1', referido: '', ...extra,
});

describe('auth: usuarios y sesión', () => {
  beforeEach(() => localStorage.clear());
  afterAll(() => localStorage.clear());

  it('carga las 4 cuentas de prueba (semilla) la primera vez', () => {
    const us = getUsuarios();
    expect(us.length).toBe(4);
    expect(us.map((u) => u.tipo).sort()).toEqual(['Administrador', 'Cliente', 'Cliente', 'Vendedor']);
    expect(JSON.parse(localStorage.getItem(CLAVE_USUARIOS)).length).toBe(4);
  });
  it('vuelve a la semilla si el almacenamiento está vacío o dañado', () => {
    localStorage.setItem(CLAVE_USUARIOS, '[]');
    expect(getUsuarios().length).toBe(4);
  });
  it('busca usuarios por correo sin distinguir mayúsculas', () => {
    expect(buscarUsuarioPorCorreo(' ADMIN@duoc.cl ').nombre).toBe('Ana');
    expect(buscarUsuarioPorCorreo('nadie@duoc.cl')).toBeNull();
    expect(buscarUsuarioPorCorreo(undefined)).toBeNull();
  });
  it('inicia sesión con credenciales correctas y guarda la sesión', () => {
    const r = iniciarSesion('admin@duoc.cl', 'admin123');
    expect(r.ok).toBe(true);
    expect(r.usuario.tipo).toBe('Administrador');
    expect(getSesion().correo).toBe('admin@duoc.cl');
  });
  it('informa si el correo no existe o la contraseña no coincide', () => {
    expect(iniciarSesion('no@duoc.cl', 'x')).toEqual(jasmine.objectContaining({ ok: false, campo: 'correo' }));
    const r = iniciarSesion('admin@duoc.cl', 'mala');
    expect(r.ok).toBe(false);
    expect(r.campo).toBe('password');
    expect(getSesion()).toBeNull();
  });
  it('cerrarSesion elimina la sesión', () => {
    iniciarSesion('cliente@gmail.com', 'cliente1');
    cerrarSesion();
    expect(localStorage.getItem(CLAVE_SESION)).toBeNull();
    expect(getSesion()).toBeNull();
  });
});

describe('auth: reglas de negocio', () => {
  beforeEach(() => localStorage.clear());
  afterAll(() => localStorage.clear());

  it('calcularNivel: Novato, Jugador, Veterano y Leyenda según los puntos', () => {
    expect(calcularNivel(0).nombre).toBe('Novato');
    expect(calcularNivel(199).nombre).toBe('Novato');
    expect(calcularNivel(200).nombre).toBe('Jugador');
    expect(calcularNivel(500).nombre).toBe('Veterano');
    expect(calcularNivel(1000).nombre).toBe('Leyenda');
    expect(NIVELES.length).toBe(4);
  });
  it('el correo Duoc da 20 % de descuento de por vida', () => {
    expect(esCorreoDuoc('a@duoc.cl')).toBe(true);
    expect(esCorreoDuoc('a@profesor.duoc.cl')).toBe(true);
    expect(esCorreoDuoc('a@gmail.com')).toBe(false);
    expect(descuentoDeUsuario({ descuentoDuoc: true })).toBe(0.2);
    expect(descuentoDeUsuario({ descuentoDuoc: false })).toBe(0);
    expect(descuentoDeUsuario(null)).toBe(0);
  });
  it('esPersonalInterno: solo Administrador y Vendedor', () => {
    expect(esPersonalInterno({ tipo: 'Administrador' })).toBe(true);
    expect(esPersonalInterno({ tipo: 'Vendedor' })).toBe(true);
    expect(esPersonalInterno({ tipo: 'Cliente' })).toBe(false);
    expect(esPersonalInterno(null)).toBe(false);
  });
  it('generarCodigoReferido crea códigos LUP + 5 caracteres (usa un generador simulado)', () => {
    const falso = jasmine.createSpy('aleatorio').and.returnValue(0);
    expect(generarCodigoReferido(falso)).toBe('LUPAAAAA');
    expect(falso).toHaveBeenCalledTimes(5);
    expect(generarCodigoReferido()).toMatch(/^LUP[A-Z2-9]{5}$/);
  });
  it('registrarUsuario crea un Cliente con descuento Duoc y código de referido', () => {
    const { usuario, mensajeReferido } = registrarUsuario(datosRegistro(), { tipoForzado: 'Cliente', generar: () => 'LUPJULIA' });
    expect(usuario).toEqual(jasmine.objectContaining({ nombre: 'Julian', correo: 'julian@duoc.cl', tipo: 'Cliente', descuentoDuoc: true, codigoReferido: 'LUPJULIA', puntos: 0 }));
    expect(mensajeReferido).toBe('');
    expect(getUsuarios().length).toBe(5);
  });
  it('el código de referido válido suma 100 puntos al referente', () => {
    const { usuario, mensajeReferido } = registrarUsuario(datosRegistro({ referido: 'lupcamil' }), { tipoForzado: 'Cliente' });
    expect(usuario.referidoPor).toBe('LUPCAMIL');
    expect(mensajeReferido).toContain('100 puntos');
    expect(buscarUsuarioPorCorreo('cliente@gmail.com').puntos).toBe(100);
  });
  it('un código de referido inexistente no suma puntos', () => {
    registrarUsuario(datosRegistro({ referido: 'NOEXISTE' }), { tipoForzado: 'Cliente' });
    expect(getUsuarios().every((u) => u.puntos === 0)).toBe(true);
  });
  it('el administrador puede elegir el tipo de usuario y no genera referidos', () => {
    const { usuario } = registrarUsuario(datosRegistro({ tipo: 'Vendedor', correo: 'v@gmail.com', referido: 'LUPCAMIL' }));
    expect(usuario.tipo).toBe('Vendedor');
    expect(usuario.descuentoDuoc).toBe(false);
    expect(buscarUsuarioPorCorreo('cliente@gmail.com').puntos).toBe(0);
  });
  it('actualizarUsuario cambia datos, mantiene la clave si viene vacía y recalcula el descuento', () => {
    const u = actualizarUsuario('123456785', { ...datosRegistro({ correo: 'camila@duoc.cl', tipo: 'Cliente' }), password: '' });
    expect(u.correo).toBe('camila@duoc.cl');
    expect(u.descuentoDuoc).toBe(true);
    expect(u.password).toBe('cliente1');
    expect(actualizarUsuario('123456785', { ...datosRegistro({ tipo: 'Cliente' }), password: 'nueva1' }).password).toBe('nueva1');
    expect(actualizarUsuario('000', datosRegistro({ tipo: 'Cliente' }))).toBeNull();
  });
  it('motivoNoEliminar protege la cuenta propia y al último administrador', () => {
    const us = usuariosIniciales();
    const admin = us[0];
    const cliente = us[2];
    expect(motivoNoEliminar(us, admin, admin)).toContain('tu propia cuenta');
    expect(motivoNoEliminar(us, admin, cliente)).toBe('Debe existir al menos un Administrador.');
    expect(motivoNoEliminar(us, cliente, admin)).toBe('');
    guardarUsuarios(us);
  });
});
