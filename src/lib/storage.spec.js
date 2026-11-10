import { LS } from './storage';

describe('LS (localStorage seguro)', () => {
  beforeEach(() => localStorage.clear());
  afterAll(() => localStorage.clear());

  it('guarda y lee valores JSON', () => {
    expect(LS.set('x', { a: 1 })).toBe(true);
    expect(LS.get('x', null)).toEqual({ a: 1 });
  });
  it('devuelve el valor por defecto cuando no existe la clave', () => {
    expect(LS.get('inexistente', 'defecto')).toBe('defecto');
  });
  it('devuelve el valor por defecto si el JSON está corrupto', () => {
    localStorage.setItem('roto', '{no-es-json');
    expect(LS.get('roto', [])).toEqual([]);
  });
  it('remove elimina la clave', () => {
    LS.set('y', 1);
    LS.remove('y');
    expect(LS.get('y', 'vacío')).toBe('vacío');
  });
  it('set devuelve false (sin lanzar error) si localStorage falla', () => {
    spyOn(Storage.prototype, 'setItem').and.throwError('cuota excedida');
    expect(LS.set('z', 1)).toBe(false);
  });
  it('get y remove toleran errores del navegador (mock de localStorage)', () => {
    spyOn(Storage.prototype, 'getItem').and.throwError('bloqueado');
    spyOn(Storage.prototype, 'removeItem').and.throwError('bloqueado');
    expect(LS.get('k', 'por defecto')).toBe('por defecto');
    expect(() => LS.remove('k')).not.toThrow();
  });
});
