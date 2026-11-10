import { fireEvent, render, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CampoForm from './CampoForm';
import ResumenErrores from './ResumenErrores';
import StockBadge from './StockBadge';
import ProductCard from './ProductCard';
import Breadcrumb from './Breadcrumb';
import LevelSteps from './LevelSteps';
import ConfirmModal from './ConfirmModal';
import CartLine from './CartLine';
import CartSummary from './CartSummary';
import PageTitle from './PageTitle';
import WhatsAppButton from './WhatsAppButton';
import { FUTURO } from '../test/helpers';

const enRouter = (ui) => {
  const r = render(<MemoryRouter future={FUTURO}>{ui}</MemoryRouter>);
  return within(r.container);
};
const ps5 = { codigo: 'CO001', nombre: 'PlayStation 5', categoria: 'Consolas', precio: 549990, stock: 4, stockCritico: 5, imagen: 'img/productos/ps5.svg' };

describe('CampoForm', () => {
  it('asocia la etiqueta con el control y muestra "(opcional)"', () => {
    const r = render(<CampoForm id="tel" name="tel" label="Teléfono" opcional value="" onChange={() => {}} />);
    const ui = within(r.container);
    expect(ui.getByLabelText('Teléfono (opcional)').id).toBe('tel');
  });
  it('marca el campo inválido y vincula el mensaje con aria-describedby', () => {
    const r = render(<CampoForm id="c" name="c" label="Correo" value="x" onChange={() => {}} error="Correo inválido" ayuda="Ayuda" />);
    const input = within(r.container).getByLabelText('Correo');
    expect(input.className).toContain('is-invalid');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('c-ayuda c-error');
    expect(within(r.container).getByText('Correo inválido').className).toContain('invalid-feedback');
  });
  it('marca el campo válido y soporta select con opciones', () => {
    const r = render(
      <CampoForm id="s" name="s" label="Región" as="select" value="a" onChange={() => {}} valido>
        <option value="a">A</option>
      </CampoForm>
    );
    const sel = within(r.container).getByLabelText('Región');
    expect(sel.tagName).toBe('SELECT');
    expect(sel.className).toContain('form-select');
    expect(sel.className).toContain('is-valid');
  });
  it('colorea la ayuda según su tipo y puede ocultar la etiqueta visualmente', () => {
    const r = render(<CampoForm id="a" name="a" label="Aviso" ocultarEtiqueta value="" onChange={() => {}} ayuda="¡ojo!" ayudaTipo="alerta" />);
    const ui = within(r.container);
    expect(ui.getByText('¡ojo!').className).toContain('text-warning');
    expect(ui.getByText('Aviso').className).toContain('visually-hidden');
  });
  it('llama a onChange al escribir', () => {
    const alCambiar = jasmine.createSpy('onChange');
    const r = render(<CampoForm id="n" name="n" label="Nombre" value="" onChange={alCambiar} />);
    fireEvent.change(within(r.container).getByLabelText('Nombre'), { target: { value: 'Ana' } });
    expect(alCambiar).toHaveBeenCalledTimes(1);
  });
});

describe('ResumenErrores, PageTitle y WhatsAppButton', () => {
  it('ResumenErrores no dibuja nada sin mensaje', () => {
    const r = render(<ResumenErrores mensaje="" />);
    expect(r.container.innerHTML).toBe('');
  });
  it('ResumenErrores muestra la alerta', () => {
    const r = render(<ResumenErrores mensaje="Revisa 2 campos antes de continuar." />);
    expect(within(r.container).getByRole('alert').textContent).toContain('Revisa 2 campos');
  });
  it('PageTitle muestra título y subtítulo opcional', () => {
    const ui = within(render(<><PageTitle titulo="Productos" subtitulo="Filtra" /><PageTitle titulo="Solo" /></>).container);
    expect(ui.getByRole('heading', { name: 'Productos' })).toBeTruthy();
    expect(ui.getByText('Filtra')).toBeTruthy();
    expect(ui.getAllByRole('heading').length).toBe(2);
  });
  it('WhatsAppButton abre el soporte en una pestaña nueva', () => {
    const a = within(render(<WhatsAppButton />).container).getByRole('link');
    expect(a.href).toContain('wa.me/56900000000');
    expect(a.target).toBe('_blank');
    expect(a.rel).toContain('noopener');
  });
});

describe('StockBadge', () => {
  it('modo tarjeta: avisa últimas unidades, sin stock o nada si está ok', () => {
    expect(within(render(<StockBadge producto={ps5} />).container).getByText('Últimas 4 unidades')).toBeTruthy();
    expect(within(render(<StockBadge producto={{ ...ps5, stock: 0 }} />).container).getByText('Sin stock')).toBeTruthy();
    expect(render(<StockBadge producto={{ ...ps5, stock: 50 }} />).container.innerHTML).toBe('');
  });
  it('modo admin: Disponible, Stock crítico o Agotado', () => {
    const ver = (p) => within(render(<StockBadge producto={p} modo="admin" />).container);
    expect(ver({ ...ps5, stock: 50 }).getByText('Disponible').className).toContain('text-bg-success');
    expect(ver(ps5).getByText('Stock crítico').className).toContain('text-bg-warning');
    expect(ver({ ...ps5, stock: 0 }).getByText('Agotado').className).toContain('text-bg-danger');
  });
});

describe('ProductCard', () => {
  it('muestra nombre, categoría, precio y enlace al detalle', () => {
    const ui = enRouter(<ProductCard producto={ps5} onAgregar={() => {}} />);
    expect(ui.getByText('PlayStation 5')).toBeTruthy();
    expect(ui.getByText('Consolas')).toBeTruthy();
    expect(ui.getByText('$549.990')).toBeTruthy();
    expect(ui.getAllByRole('link')[0].getAttribute('href')).toBe('/producto/CO001');
    expect(ui.getByAltText('Ilustración de PlayStation 5').getAttribute('src')).toBe('img/productos/ps5.svg');
  });
  it('al pulsar Añadir informa el código del producto (callback simulado)', () => {
    const alAgregar = jasmine.createSpy('onAgregar');
    const ui = enRouter(<ProductCard producto={ps5} onAgregar={alAgregar} />);
    fireEvent.click(ui.getByRole('button', { name: 'Añadir' }));
    expect(alAgregar).toHaveBeenCalledOnceWith('CO001');
  });
  it('deshabilita el botón si no hay stock', () => {
    const ui = enRouter(<ProductCard producto={{ ...ps5, stock: 0 }} onAgregar={() => {}} />);
    expect(ui.getByRole('button', { name: 'Sin stock' }).disabled).toBe(true);
  });
  it('muestra FREE cuando el precio es 0', () => {
    expect(enRouter(<ProductCard producto={{ ...ps5, precio: 0 }} onAgregar={() => {}} />).getByText('FREE')).toBeTruthy();
  });
});

describe('Breadcrumb y LevelSteps', () => {
  it('Breadcrumb enlaza los niveles y marca la página actual', () => {
    const ui = enRouter(<Breadcrumb items={[{ texto: 'Home', to: '/' }, { texto: 'Blogs', to: '/blogs' }, { texto: 'Artículo' }]} />);
    expect(ui.getByText('Home').getAttribute('href')).toBe('/');
    expect(ui.getByText('Artículo').getAttribute('aria-current')).toBe('page');
    expect(ui.getAllByRole('link').length).toBe(2);
  });
  it('LevelSteps muestra los 4 niveles del programa LevelUp', () => {
    const ui = within(render(<LevelSteps />).container);
    ['Novato', 'Jugador', 'Veterano', 'Leyenda'].forEach((n) => expect(ui.getByText(new RegExp(n))).toBeTruthy());
    expect(ui.getAllByRole('listitem').length).toBe(4);
  });
});

describe('ConfirmModal', () => {
  it('no se dibuja cerrado', () => {
    expect(render(<ConfirmModal abierto={false} mensaje="x" />).container.innerHTML).toBe('');
  });
  it('confirma o cancela mediante callbacks simulados', () => {
    const ok = jasmine.createSpy('confirmar');
    const no = jasmine.createSpy('cancelar');
    const ui = within(render(<ConfirmModal abierto mensaje="¿Eliminar?" textoBoton="Eliminar" onConfirmar={ok} onCancelar={no} />).container);
    expect(ui.getByRole('dialog').getAttribute('aria-modal')).toBe('true');
    expect(ui.getByText('¿Eliminar?')).toBeTruthy();
    fireEvent.click(ui.getByText('Eliminar'));
    fireEvent.click(ui.getByText('Cancelar'));
    expect(ok).toHaveBeenCalledTimes(1);
    expect(no).toHaveBeenCalledTimes(1);
  });
});

describe('CartLine y CartSummary', () => {
  it('CartLine permite sumar, restar, escribir y eliminar', () => {
    const cambiar = jasmine.createSpy('onCambiar');
    const quitar = jasmine.createSpy('onQuitar');
    const ui = within(render(<CartLine producto={ps5} cantidad={2} onCambiar={cambiar} onQuitar={quitar} />).container);
    fireEvent.click(ui.getByLabelText('Agregar una unidad'));
    expect(cambiar).toHaveBeenCalledWith('CO001', 3);
    fireEvent.click(ui.getByLabelText('Quitar una unidad'));
    expect(cambiar).toHaveBeenCalledWith('CO001', 1);
    fireEvent.change(ui.getByLabelText('Cantidad'), { target: { value: '4' } });
    expect(cambiar).toHaveBeenCalledWith('CO001', '4');
    fireEvent.click(ui.getByText('Eliminar'));
    expect(quitar).toHaveBeenCalledOnceWith('CO001');
    expect(ui.getByLabelText('Cantidad').max).toBe('4');
  });
  it('CartSummary muestra subtotal, descuento (si hay) y total', () => {
    const base = { subtotal: 100000, descuento: 20000, origen: 'Descuento Duoc 20 %', total: 80000 };
    const ui = within(render(<CartSummary resumen={base} />).container);
    expect(ui.getByText('$100.000')).toBeTruthy();
    expect(ui.getByText('Descuento Duoc 20 %')).toBeTruthy();
    expect(ui.getByText('−$20.000')).toBeTruthy();
    expect(ui.getByText('$80.000')).toBeTruthy();
  });
  it('CartSummary oculta la fila de descuento cuando es 0', () => {
    const ui = within(render(<CartSummary resumen={{ subtotal: 5000, descuento: 0, origen: '', total: 5000 }} />).container);
    expect(ui.queryByText(/Descuento/)).toBeNull();
  });
});
