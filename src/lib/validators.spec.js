import {
  calcularDV, calcularEdad, distanciaEdicion, sugerirCorreo, validarCorreo, validarFechaNacimiento,
  validarNumero, validarPassword, validarRun, validarTelefono, validarTextoLargo,
} from './validators';

describe('validators: validarTextoLargo', () => {
  it('exige el texto cuando es requerido, con concordancia de género', () => {
    expect(validarTextoLargo('  ', 'El nombre')).toBe('El nombre es obligatorio.');
    expect(validarTextoLargo('', 'La dirección', { genero: 'f' })).toBe('La dirección es obligatoria.');
    expect(validarTextoLargo('', 'Los apellidos', { genero: 'mp' })).toBe('Los apellidos son obligatorios.');
  });
  it('acepta vacío si es opcional', () => {
    expect(validarTextoLargo('', 'La descripción', { requerido: false })).toBe('');
  });
  it('valida largo máximo y mínimo', () => {
    expect(validarTextoLargo('a'.repeat(51), 'El nombre', { max: 50 })).toBe('El nombre no puede superar los 50 caracteres (tienes 51).');
    expect(validarTextoLargo('ab', 'El código', { min: 3 })).toBe('El código debe tener al menos 3 caracteres.');
    expect(validarTextoLargo('Julian', 'El nombre', { max: 50 })).toBe('');
  });
});

describe('validators: validarCorreo', () => {
  it('rechaza vacío, formato inválido y largo excesivo', () => {
    expect(validarCorreo('')).toBe('El correo es obligatorio.');
    expect(validarCorreo('', { requerido: false })).toBe('');
    expect(validarCorreo('sin-arroba')).toContain('formato válido');
    expect(validarCorreo('a'.repeat(95) + '@duoc.cl')).toContain('no puede superar los 100');
  });
  it('solo acepta @duoc.cl, @profesor.duoc.cl y @gmail.com', () => {
    expect(validarCorreo('ana@duoc.cl')).toBe('');
    expect(validarCorreo('ana@profesor.duoc.cl')).toBe('');
    expect(validarCorreo('ANA@GMAIL.COM')).toBe('');
    expect(validarCorreo('ana@hotmail.com')).toBe('Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.');
  });
});

describe('validators: sugerirCorreo', () => {
  it('detecta errores de tipeo en el dominio', () => {
    expect(sugerirCorreo('ana@gmial.com')).toBe('¿Quisiste escribir ana@gmail.com?');
    expect(sugerirCorreo('ana@duoc.cll')).toBe('¿Quisiste escribir ana@duoc.cl?');
  });
  it('no sugiere si el dominio es correcto, lejano o falta @', () => {
    expect(sugerirCorreo('ana@gmail.com')).toBe('');
    expect(sugerirCorreo('ana@otrodominio.org')).toBe('');
    expect(sugerirCorreo('ana')).toBe('');
    expect(sugerirCorreo('ana@')).toBe('');
  });
  it('distanciaEdicion calcula el mínimo de cambios', () => {
    expect(distanciaEdicion('gmail', 'gmail')).toBe(0);
    expect(distanciaEdicion('gmial', 'gmail')).toBe(2);
    expect(distanciaEdicion('', 'abc')).toBe(3);
  });
});

describe('validators: RUN (módulo 11)', () => {
  it('calcula el dígito verificador', () => {
    expect(calcularDV('12345678')).toBe('5');
    expect(calcularDV('11111111')).toBe('1');
    expect(calcularDV('20123456')).toBe('5');
    expect(calcularDV('10000013')).toBe('K'); // resto 10 → K
    expect(calcularDV('76354771')).toBe('K');
    expect(calcularDV('10000004')).toBe('0'); // resto 11 → 0
  });
  it('acepta RUN reales de las cuentas de prueba', () => {
    ['123456785', '201234565', '111111111', '222222222'].forEach((r) => expect(validarRun(r)).toBe(''));
  });
  it('rechaza vacío, caracteres inválidos, largo y dígito incorrecto', () => {
    expect(validarRun('')).toBe('El RUN es obligatorio.');
    expect(validarRun('12.345.678-5')).toContain('sin puntos ni guion');
    expect(validarRun('12345')).toContain('al menos 7');
    expect(validarRun('1234567890')).toContain('no puede superar los 9');
    expect(validarRun('123456784')).toBe('El RUN no es válido: el dígito verificador no coincide.');
  });
  it('acepta la K en mayúscula o minúscula', () => {
    expect(validarRun('10000013K')).toBe('');
    expect(validarRun('10000013k')).toBe('');
  });
});

describe('validators: contraseña, teléfono y número', () => {
  it('la contraseña lleva entre 4 y 10 caracteres', () => {
    expect(validarPassword('')).toBe('La contraseña es obligatoria.');
    expect(validarPassword('abc')).toContain('entre 4 y 10');
    expect(validarPassword('a'.repeat(11))).toContain('(tienes 11)');
    expect(validarPassword('abcd')).toBe('');
    expect(validarPassword('a'.repeat(10))).toBe('');
  });
  it('el teléfono es opcional y debe ser móvil chileno', () => {
    expect(validarTelefono('')).toBe('');
    expect(validarTelefono('+56 9 1234 5678')).toBe('');
    expect(validarTelefono('912345678')).toBe('');
    expect(validarTelefono('1234')).toContain('móvil chileno');
  });
  it('validarNumero controla requerido, formato, entero y mínimo', () => {
    expect(validarNumero('', 'El precio')).toBe('El precio es obligatorio.');
    expect(validarNumero('', 'El stock crítico', { requerido: false })).toBe('');
    expect(validarNumero('abc', 'El precio')).toBe('El precio debe ser un número.');
    expect(validarNumero('1,5', 'El precio')).toBe('');
    expect(validarNumero('1.5', 'El stock', { entero: true })).toContain('entero');
    expect(validarNumero('-1', 'El stock', { min: 0 })).toBe('El stock no puede ser menor que 0.');
    expect(validarNumero('0', 'El precio')).toBe('');
  });
});

describe('validators: fecha de nacimiento y edad', () => {
  const hoy = new Date(2026, 5, 15);
  it('calcularEdad considera si ya cumplió años', () => {
    expect(calcularEdad('2000-06-14', hoy)).toBe(26);
    expect(calcularEdad('2000-06-16', hoy)).toBe(25);
  });
  it('valida obligatoriedad, futuro, año mínimo y mayoría de edad', () => {
    expect(validarFechaNacimiento('', { requerida: true })).toBe('La fecha de nacimiento es obligatoria.');
    expect(validarFechaNacimiento('')).toBe('');
    expect(validarFechaNacimiento('2999-01-01')).toContain('futuro');
    expect(validarFechaNacimiento('1850-01-01')).toContain('1900');
    expect(validarFechaNacimiento('abcd-ef-gh')).toBe('Ingresa una fecha válida.');
    const reciente = new Date();
    reciente.setFullYear(reciente.getFullYear() - 10);
    const iso = reciente.toISOString().slice(0, 10);
    expect(validarFechaNacimiento(iso, { requerida: true, minEdad: 18 })).toBe('Debes tener al menos 18 años para registrarte.');
    expect(validarFechaNacimiento('1990-05-10', { requerida: true, minEdad: 18 })).toBe('');
  });
});
