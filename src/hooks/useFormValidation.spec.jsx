import { fireEvent, render, within } from '@testing-library/react';
import useFormValidation from './useFormValidation';
import '../test/helpers';

const REGLAS = {
  nombre: (v) => (v.trim() ? '' : 'Nombre obligatorio'),
  clave: (v) => (v.length >= 4 ? '' : 'Mínimo 4'),
  repite: (v, vals) => (v === vals.clave ? '' : 'No coincide'),
};

function Probe({ alEnviar, ayudas = {}, contadores = {} }) {
  const f = useFormValidation({ initial: { nombre: '', clave: '', repite: '' }, reglas: REGLAS, ayudas, contadores });
  const c = f.campo('nombre', { ayuda: 'Tu nombre' });
  return (
    <form onSubmit={f.handleSubmit(alEnviar)} noValidate>
      <input aria-label="nombre" id={c.id} name={c.name} value={c.value} onChange={c.onChange} onBlur={c.onBlur} />
      <p data-testid="ayuda">{c.ayuda}</p>
      <p data-testid="tipo">{c.ayudaTipo}</p>
      <p data-testid="error">{c.error}</p>
      <p data-testid="valido">{String(c.valido)}</p>
      <input aria-label="clave" name="clave" value={f.values.clave} onChange={f.handleChange} onBlur={f.handleBlur} />
      <input aria-label="repite" name="repite" value={f.values.repite} onChange={f.handleChange} />
      <p data-testid="resumen">{f.resumenErrores}</p>
      <p data-testid="errores-repite">{f.errors.repite}</p>
      <button type="submit">Enviar</button>
      <button type="button" onClick={() => f.reset()}>Reiniciar</button>
    </form>
  );
}

const montar = (props = {}) => {
  const r = render(<Probe alEnviar={jasmine.createSpy('alEnviar')} {...props} />);
  return { ...r, ui: within(r.container), alEnviar: r.container && props.alEnviar };
};

describe('useFormValidation', () => {
  it('no muestra errores hasta que el campo se toca (blur)', () => {
    const { ui } = montar();
    expect(ui.getByTestId('error').textContent).toBe('');
    fireEvent.blur(ui.getByLabelText('nombre'));
    expect(ui.getByTestId('error').textContent).toBe('Nombre obligatorio');
  });

  it('valida en tiempo real apenas el usuario escribe', () => {
    const { ui } = montar();
    fireEvent.change(ui.getByLabelText('nombre'), { target: { name: 'nombre', value: '   ' } });
    expect(ui.getByTestId('error').textContent).toBe('Nombre obligatorio');
    fireEvent.change(ui.getByLabelText('nombre'), { target: { name: 'nombre', value: 'Ana' } });
    expect(ui.getByTestId('error').textContent).toBe('');
    expect(ui.getByTestId('valido').textContent).toBe('true');
  });

  it('un campo dependiente se revalida solo cuando cambia el otro (confirmación)', () => {
    const { ui } = montar();
    fireEvent.change(ui.getByLabelText('clave'), { target: { name: 'clave', value: 'abcd' } });
    fireEvent.change(ui.getByLabelText('repite'), { target: { name: 'repite', value: 'abcd' } });
    expect(ui.getByTestId('errores-repite').textContent).toBe('');
    fireEvent.change(ui.getByLabelText('clave'), { target: { name: 'clave', value: 'abcde' } });
    expect(ui.getByTestId('errores-repite').textContent).toBe('No coincide');
  });

  it('al enviar con errores no llama al callback, muestra el resumen y enfoca el primer campo inválido', () => {
    const alEnviar = jasmine.createSpy('alEnviar');
    const { ui } = montar({ alEnviar });
    fireEvent.click(ui.getByText('Enviar'));
    expect(alEnviar).not.toHaveBeenCalled();
    expect(ui.getByTestId('resumen').textContent).toBe('Revisa 2 campos antes de continuar.');
    expect(document.activeElement).toBe(ui.getByLabelText('nombre'));
    expect(ui.getByTestId('error').textContent).toBe('Nombre obligatorio');
  });

  it('el resumen usa singular cuando falta un solo campo', () => {
    const { ui } = montar();
    fireEvent.change(ui.getByLabelText('nombre'), { target: { name: 'nombre', value: 'Ana' } });
    fireEvent.change(ui.getByLabelText('clave'), { target: { name: 'clave', value: 'abcd' } });
    fireEvent.click(ui.getByText('Enviar'));
    expect(ui.getByTestId('resumen').textContent).toBe('Revisa 1 campo antes de continuar.');
  });

  it('al enviar un formulario válido entrega los valores al callback', () => {
    const alEnviar = jasmine.createSpy('alEnviar');
    const { ui } = montar({ alEnviar });
    fireEvent.change(ui.getByLabelText('nombre'), { target: { name: 'nombre', value: 'Ana' } });
    fireEvent.change(ui.getByLabelText('clave'), { target: { name: 'clave', value: 'abcd' } });
    fireEvent.change(ui.getByLabelText('repite'), { target: { name: 'repite', value: 'abcd' } });
    fireEvent.click(ui.getByText('Enviar'));
    expect(alEnviar).toHaveBeenCalledOnceWith({ nombre: 'Ana', clave: 'abcd', repite: 'abcd' });
  });

  it('muestra la ayuda dinámica (aviso) y el contador de caracteres', () => {
    const { ui } = montar({ ayudas: { nombre: (v) => (v === 'x' ? '⚠ cuidado' : '') }, contadores: { nombre: 10 } });
    expect(ui.getByTestId('ayuda').textContent).toBe('Tu nombre');
    fireEvent.change(ui.getByLabelText('nombre'), { target: { name: 'nombre', value: 'Ana' } });
    expect(ui.getByTestId('ayuda').textContent).toBe('Tu nombre (3/10)');
    fireEvent.change(ui.getByLabelText('nombre'), { target: { name: 'nombre', value: 'x' } });
    expect(ui.getByTestId('tipo').textContent).toBe('alerta');
    expect(ui.getByTestId('ayuda').textContent).toContain('⚠ cuidado');
  });

  it('una ayuda dinámica sin ⚠ se marca como aviso', () => {
    const { ui } = montar({ ayudas: { nombre: () => 'sugerencia' } });
    expect(ui.getByTestId('tipo').textContent).toBe('aviso');
  });

  it('reset limpia valores, errores y resumen', () => {
    const { ui } = montar();
    fireEvent.click(ui.getByText('Enviar'));
    fireEvent.click(ui.getByText('Reiniciar'));
    expect(ui.getByTestId('resumen').textContent).toBe('');
    expect(ui.getByTestId('error').textContent).toBe('');
    expect(ui.getByLabelText('nombre').value).toBe('');
  });
});
