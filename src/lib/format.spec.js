import { fechaLegible, formatoCLP, formatoPrecio, pluralizar, rutaImagen } from './format';

describe('format', () => {
  it('formatoCLP usa $ y separador de miles chileno', () => {
    expect(formatoCLP(549990)).toBe('$549.990');
    expect(formatoCLP('abc')).toBe('$0');
  });
  it('formatoPrecio muestra FREE cuando el precio es 0', () => {
    expect(formatoPrecio(0)).toBe('FREE');
    expect(formatoPrecio(14990)).toBe('$14.990');
  });
  it('rutaImagen usa el logo por defecto y respeta la ruta recibida', () => {
    expect(rutaImagen('')).toBe('img/logo.png');
    expect(rutaImagen('img/productos/ps5.svg')).toBe('img/productos/ps5.svg');
    expect(rutaImagen('data:image/png;base64,AAA')).toBe('data:image/png;base64,AAA');
  });
  it('fechaLegible entrega una fecha en español', () => {
    expect(fechaLegible('2026-03-05T15:30:00.000Z')).toMatch(/2026/);
  });
  it('pluralizar elige singular o plural', () => {
    expect(pluralizar(1, 'producto', 'productos')).toBe('1 producto');
    expect(pluralizar(0, 'producto', 'productos')).toBe('0 productos');
    expect(pluralizar(5, 'orden', 'órdenes')).toBe('5 órdenes');
  });
});
