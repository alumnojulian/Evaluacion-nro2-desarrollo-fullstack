import { fireEvent } from '@testing-library/react';
import FormUsuario from './FormUsuario';
import FormProducto, { alertaStockCritico, validarImagen } from './FormProducto';
import { esperarLlamada, renderApp } from '../test/helpers';
import { buscarUsuarioPorCorreo, getUsuarios } from '../lib/auth';
import { buscarProducto, getProductos } from '../lib/store';

const llenar = (ui, etiqueta, valor) => fireEvent.change(ui.getByLabelText(etiqueta), { target: { value: valor } });
const enviar = (ui, texto) => fireEvent.click(ui.getByText(texto));

const completarRegistro = (ui, extra = {}) => {
  const d = {
    RUN: '100000040', Nombre: 'Julian', Apellidos: 'Meneses', Correo: 'julian@gmail.com', 'Confirmar correo': 'julian@gmail.com',
    Contraseña: 'clave1', 'Confirmar contraseña': 'clave1', 'Fecha de nacimiento': '2000-01-01', Dirección: 'Calle 123', ...extra,
  };
  Object.entries(d).forEach(([k, v]) => v !== undefined && llenar(ui, k, v));
  llenar(ui, 'Región', 'Región Metropolitana de Santiago');
  llenar(ui, 'Comuna', 'Santiago');
};

describe('FormUsuario (modo registro)', () => {
  it('muestra todos los campos obligatorios y el código de referido', () => {
    const { ui } = renderApp(<FormUsuario modo="registro" />);
    ['RUN', 'Nombre', 'Apellidos', 'Correo', 'Confirmar correo', 'Contraseña', 'Confirmar contraseña', 'Fecha de nacimiento', 'Región', 'Comuna', 'Dirección', 'Código de referido (opcional)'].forEach((l) =>
      expect(ui.getByLabelText(l)).toBeTruthy()
    );
    expect(ui.queryByLabelText('Tipo de usuario')).toBeNull();
  });
  it('al enviar vacío muestra errores de todos los campos y el resumen', () => {
    const { ui } = renderApp(<FormUsuario modo="registro" />);
    enviar(ui, 'Registrar');
    expect(ui.getByText('El RUN es obligatorio.')).toBeTruthy();
    expect(ui.getByText('El nombre es obligatorio.')).toBeTruthy();
    expect(ui.getByText('Los apellidos son obligatorios.')).toBeTruthy();
    expect(ui.getByText('Selecciona una región.')).toBeTruthy();
    expect(ui.getByText(/Revisa \d+ campos antes de continuar/)).toBeTruthy();
    expect(document.activeElement.id).toBe('run');
  });
  it('rechaza un RUN con dígito verificador incorrecto y uno ya registrado', () => {
    const { ui } = renderApp(<FormUsuario modo="registro" />);
    llenar(ui, 'RUN', '123456784');
    expect(ui.getByText('El RUN no es válido: el dígito verificador no coincide.')).toBeTruthy();
    llenar(ui, 'RUN', '123456785');
    expect(ui.getByText('Ya existe un usuario con ese RUN.')).toBeTruthy();
  });
  it('avisa si el RUN trae puntos o guion', () => {
    const { ui } = renderApp(<FormUsuario modo="registro" />);
    llenar(ui, 'RUN', '12.345.678-5');
    expect(ui.getAllByText('Escribe el RUN sin puntos ni guion.').length).toBeGreaterThan(0);
  });
  it('rechaza correo ya existente, dominio no permitido y confirmación distinta', () => {
    const { ui } = renderApp(<FormUsuario modo="registro" />);
    llenar(ui, 'Correo', 'admin@duoc.cl');
    expect(ui.getByText('Ya existe un usuario registrado con ese correo.')).toBeTruthy();
    llenar(ui, 'Correo', 'x@hotmail.com');
    expect(ui.getByText(/Solo se aceptan correos/)).toBeTruthy();
    llenar(ui, 'Correo', 'ana@gmail.com');
    llenar(ui, 'Confirmar correo', 'otra@gmail.com');
    expect(ui.getByText('Los correos no coinciden.')).toBeTruthy();
  });
  it('revalida la confirmación de contraseña cuando cambia la contraseña', () => {
    const { ui } = renderApp(<FormUsuario modo="registro" />);
    llenar(ui, 'Contraseña', 'abcd');
    llenar(ui, 'Confirmar contraseña', 'abcd');
    expect(ui.queryByText('Las contraseñas no coinciden.')).toBeNull();
    llenar(ui, 'Contraseña', 'abcde');
    expect(ui.getByText('Las contraseñas no coinciden.')).toBeTruthy();
  });
  it('guía la contraseña con ayudas dinámicas (faltan, longitud correcta, exceso)', () => {
    const { ui } = renderApp(<FormUsuario modo="registro" />);
    llenar(ui, 'Contraseña', 'ab');
    expect(ui.getByText('Te faltan 2 caracteres para llegar al mínimo de 4.')).toBeTruthy();
    llenar(ui, 'Contraseña', 'abc');
    expect(ui.getByText('Te faltan 1 carácter para llegar al mínimo de 4.')).toBeTruthy();
    llenar(ui, 'Contraseña', 'abcd');
    expect(ui.getByText('Longitud correcta.')).toBeTruthy();
    llenar(ui, 'Contraseña', 'a'.repeat(12));
    expect(ui.getByText('Te pasaste por 2: el máximo es 10 caracteres.')).toBeTruthy();
  });
  it('exige ser mayor de 18 años y lo explica', () => {
    const { ui } = renderApp(<FormUsuario modo="registro" />);
    const hoy = new Date();
    const joven = `${hoy.getFullYear() - 15}-01-01`;
    llenar(ui, 'Fecha de nacimiento', joven);
    expect(ui.getAllByText(/Debes tener al menos 18 años|para registrarte necesitas ser mayor de 18/).length).toBeGreaterThan(0);
  });
  it('felicita por el correo Duoc con el descuento del 20 %', () => {
    const { ui } = renderApp(<FormUsuario modo="registro" />);
    llenar(ui, 'Correo', 'ana@duoc.cl');
    expect(ui.getByText(/¡Con tu correo Duoc tendrás 20 % de descuento de por vida!/)).toBeTruthy();
  });
  it('comuna depende de la región: se habilita y lista las comunas ordenadas', () => {
    const { ui } = renderApp(<FormUsuario modo="registro" />);
    expect(ui.getByLabelText('Comuna').disabled).toBe(true);
    llenar(ui, 'Región', 'Región Metropolitana de Santiago');
    const comuna = ui.getByLabelText('Comuna');
    expect(comuna.disabled).toBe(false);
    expect(comuna.options.length).toBe(53); // 52 comunas + opción vacía
    llenar(ui, 'Comuna', 'Providencia');
    llenar(ui, 'Región', 'Región de Valparaíso');
    expect(ui.getByLabelText('Comuna').value).toBe('');
  });
  it('valida el código de referido (formato y existencia)', () => {
    const { ui } = renderApp(<FormUsuario modo="registro" />);
    llenar(ui, 'Código de referido (opcional)', 'ab');
    expect(ui.getByText('El código de referido lleva entre 6 y 10 letras o números.')).toBeTruthy();
    llenar(ui, 'Código de referido (opcional)', 'LUPNADA1');
    expect(ui.getByText(/No encontramos ese código de referido/)).toBeTruthy();
    llenar(ui, 'Código de referido (opcional)', 'lupcamil');
    expect(ui.queryByText(/No encontramos ese código/)).toBeNull();
  });
  it('registra un cliente válido y entrega el resultado al callback', () => {
    const creado = jasmine.createSpy('onCreado');
    const { ui } = renderApp(<FormUsuario modo="registro" onCreado={creado} />);
    completarRegistro(ui, { 'Código de referido (opcional)': 'LUPCAMIL' });
    enviar(ui, 'Registrar');
    expect(creado).toHaveBeenCalledTimes(1);
    const { usuario, mensajeReferido } = creado.calls.mostRecent().args[0];
    expect(usuario.tipo).toBe('Cliente');
    expect(usuario.codigoReferido).toMatch(/^LUP/);
    expect(mensajeReferido).toContain('100 puntos');
    expect(getUsuarios().length).toBe(5);
    expect(buscarUsuarioPorCorreo('cliente@gmail.com').puntos).toBe(100);
  });
});

describe('FormUsuario (modos del administrador)', () => {
  it('admin-nuevo pide el tipo de usuario y no tiene código de referido', () => {
    const creado = jasmine.createSpy('onCreado');
    const { ui } = renderApp(<FormUsuario modo="admin-nuevo" onCreado={creado} />);
    expect(ui.queryByLabelText('Código de referido (opcional)')).toBeNull();
    enviar(ui, 'Crear usuario');
    expect(ui.getByText('Selecciona el tipo de usuario.')).toBeTruthy();
    completarRegistro(ui, { 'Fecha de nacimiento': undefined }); // en admin la fecha es opcional
    llenar(ui, 'Tipo de usuario', 'Vendedor');
    enviar(ui, 'Crear usuario');
    expect(creado).toHaveBeenCalledTimes(1);
    expect(buscarUsuarioPorCorreo('julian@gmail.com').tipo).toBe('Vendedor');
  });
  it('admin-editar precarga los datos, bloquea el RUN y deja la clave opcional', () => {
    const actualizado = jasmine.createSpy('onActualizado');
    const camila = getUsuarios().find((u) => u.correo === 'cliente@gmail.com');
    const { ui } = renderApp(<FormUsuario modo="admin-editar" usuarioEditado={camila} onActualizado={actualizado} />);
    expect(ui.getByLabelText('RUN').disabled).toBe(true);
    expect(ui.getByLabelText('RUN').value).toBe('123456785');
    expect(ui.getByLabelText('Nombre').value).toBe('Camila');
    expect(ui.getByLabelText('Contraseña (opcional)')).toBeTruthy();
    llenar(ui, 'Nombre', 'Camila Andrea');
    enviar(ui, 'Guardar cambios');
    expect(actualizado).toHaveBeenCalledTimes(1);
    const u = buscarUsuarioPorCorreo('cliente@gmail.com');
    expect(u.nombre).toBe('Camila Andrea');
    expect(u.password).toBe('cliente1');
  });
  it('en edición permite cambiar la contraseña y exige confirmarla', () => {
    const camila = getUsuarios().find((u) => u.correo === 'cliente@gmail.com');
    const { ui } = renderApp(<FormUsuario modo="admin-editar" usuarioEditado={camila} />);
    llenar(ui, 'Contraseña (opcional)', 'nueva1');
    enviar(ui, 'Guardar cambios');
    expect(ui.getByText('Confirma tu contraseña escribiéndola otra vez.')).toBeTruthy();
  });
  it('en edición el mismo correo del usuario no cuenta como duplicado', () => {
    const camila = getUsuarios().find((u) => u.correo === 'cliente@gmail.com');
    const { ui } = renderApp(<FormUsuario modo="admin-editar" usuarioEditado={camila} />);
    llenar(ui, 'Correo', 'cliente@gmail.com');
    expect(ui.queryByText('Ya existe un usuario registrado con ese correo.')).toBeNull();
  });
});

describe('FormProducto', () => {
  const llenarProducto = (ui, extra = {}) => {
    const d = { 'Código del producto': 'JM003', Nombre: 'Azul', 'Precio (CLP)': '19990', Stock: '10', ...extra };
    Object.entries(d).forEach(([k, v]) => llenar(ui, k, v));
    llenar(ui, 'Categoría', 'Juegos de Mesa');
  };
  it('validarImagen exige tipo imagen y máximo 300 KB', () => {
    expect(validarImagen(null)).toBe('');
    expect(validarImagen({ type: 'text/plain', size: 1 })).toContain('debe ser una imagen');
    expect(validarImagen({ type: 'image/png', size: 400 * 1024 })).toBe('La imagen pesa 400 KB y el máximo es 300 KB.');
    expect(validarImagen({ type: 'image/svg+xml', size: 1000 })).toBe('');
  });
  it('alertaStockCritico avisa cuando el stock es igual o menor al crítico', () => {
    expect(alertaStockCritico('3', '5')).toContain('nivel crítico');
    expect(alertaStockCritico('5', '5')).toContain('nivel crítico');
    expect(alertaStockCritico('6', '5')).toBe('');
    expect(alertaStockCritico('', '5')).toBe('');
    expect(alertaStockCritico('x', '5')).toBe('');
  });
  it('valida código, nombre, precio, stock y categoría al enviar vacío', () => {
    const { ui } = renderApp(<FormProducto />);
    enviar(ui, 'Guardar producto');
    expect(ui.getByText('El código del producto es obligatorio.')).toBeTruthy();
    expect(ui.getByText('El nombre es obligatorio.')).toBeTruthy();
    expect(ui.getByText('El precio es obligatorio.')).toBeTruthy();
    expect(ui.getByText('El stock es obligatorio.')).toBeTruthy();
    expect(ui.getByText('Selecciona una categoría.')).toBeTruthy();
  });
  it('rechaza código corto o repetido, stock decimal y precio negativo', () => {
    const { ui } = renderApp(<FormProducto />);
    llenar(ui, 'Código del producto', 'AB');
    expect(ui.getByText(/al menos 3 caracteres \(tiene 2\)/)).toBeTruthy();
    llenar(ui, 'Código del producto', 'co001');
    expect(ui.getByText('Ya existe un producto con ese código.')).toBeTruthy();
    llenar(ui, 'Stock', '2.5');
    expect(ui.getByText(/número entero/)).toBeTruthy();
    llenar(ui, 'Precio (CLP)', '-1');
    expect(ui.getByText('El precio no puede ser menor que 0.')).toBeTruthy();
  });
  it('precio 0 se anuncia como FREE y el stock crítico alerta en vivo', () => {
    const { ui } = renderApp(<FormProducto />);
    llenar(ui, 'Precio (CLP)', '0');
    expect(ui.getByText('Con precio 0 el producto se mostrará como FREE.')).toBeTruthy();
    llenar(ui, 'Stock', '2');
    llenar(ui, 'Stock crítico (opcional)', '5');
    expect(ui.getAllByText(/Alerta: con este stock el producto queda en nivel crítico/).length).toBeGreaterThan(0);
  });
  it('crea un producto válido con la imagen de su categoría', async () => {
    const guardado = jasmine.createSpy('onGuardado');
    const { ui } = renderApp(<FormProducto onGuardado={guardado} />);
    llenarProducto(ui);
    enviar(ui, 'Guardar producto');
    await esperarLlamada(guardado);
    const p = buscarProducto('JM003');
    expect(p.imagen).toBe('img/productos/catan.svg');
    expect(p.distribuidor).toBe('Level-Up Gamer');
    expect(getProductos().length).toBe(13);
  });
  it('sube una imagen propia y la guarda como data URL', async () => {
    const guardado = jasmine.createSpy('onGuardado');
    const { ui } = renderApp(<FormProducto onGuardado={guardado} />);
    llenarProducto(ui);
    const archivo = new File(['<svg xmlns="http://www.w3.org/2000/svg"/>'], 'x.svg', { type: 'image/svg+xml' });
    fireEvent.change(ui.getByLabelText('Imagen (opcional)'), { target: { files: [archivo] } });
    enviar(ui, 'Guardar producto');
    await esperarLlamada(guardado);
    expect(buscarProducto('JM003').imagen).toMatch(/^data:image\/svg\+xml/);
  });
  it('rechaza un archivo que no es imagen', () => {
    const { ui } = renderApp(<FormProducto />);
    const archivo = new File(['hola'], 'x.txt', { type: 'text/plain' });
    fireEvent.change(ui.getByLabelText('Imagen (opcional)'), { target: { files: [archivo] } });
    expect(ui.getByText(/debe ser una imagen/)).toBeTruthy();
  });
  it('edición: precarga, bloquea el código y guarda cambios', async () => {
    const guardado = jasmine.createSpy('onGuardado');
    const { ui } = renderApp(<FormProducto productoEditado={buscarProducto('MS001')} onGuardado={guardado} />);
    expect(ui.getByLabelText('Código del producto').disabled).toBe(true);
    expect(ui.getByLabelText('Nombre').value).toContain('Logitech');
    llenar(ui, 'Precio (CLP)', '45990');
    enviar(ui, 'Guardar producto');
    await esperarLlamada(guardado);
    expect(buscarProducto('MS001').precio).toBe(45990);
    expect(buscarProducto('MS001').imagen).toBe('img/productos/mouse.svg');
  });
  it('solo lectura (Vendedor): campos deshabilitados y sin botón de guardar', () => {
    const { ui } = renderApp(<FormProducto productoEditado={buscarProducto('MS001')} soloLectura />);
    expect(ui.getByLabelText('Nombre').disabled).toBe(true);
    expect(ui.queryByText('Guardar producto')).toBeNull();
    expect(ui.getByText('Volver al listado')).toBeTruthy();
  });
});
