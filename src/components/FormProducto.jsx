import { useState } from 'react';
import { Link } from 'react-router-dom';
import CampoForm from './CampoForm';
import ResumenErrores from './ResumenErrores';
import useFormValidation from '../hooks/useFormValidation';
import { CATEGORIAS } from '../data/productos';
import { IMAGEN_POR_CATEGORIA, MAX_IMAGEN_BYTES, getProductos, guardarProducto } from '../lib/store';
import { rutaImagen } from '../lib/format';
import { validarNumero, validarTextoLargo } from '../lib/validators';

// Valida el archivo de imagen opcional (máx. 300 KB)
export function validarImagen(archivo) {
  if (!archivo) return '';
  if (!archivo.type.startsWith('image/')) return 'El archivo debe ser una imagen (JPG, PNG, WebP o SVG).';
  if (archivo.size > MAX_IMAGEN_BYTES) return `La imagen pesa ${Math.round(archivo.size / 1024)} KB y el máximo es 300 KB.`;
  return '';
}

export function alertaStockCritico(stock, critico) {
  const s = String(stock).trim();
  const c = String(critico).trim();
  if (s === '' || c === '' || Number.isNaN(Number(s)) || Number.isNaN(Number(c))) return '';
  return Number(s) <= Number(c) ? '⚠ Alerta: con este stock el producto queda en nivel crítico.' : '';
}

const leerArchivo = (archivo) =>
  new Promise((resolve) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.readAsDataURL(archivo);
  });

// Formulario del mantenedor de productos. Props: productoEditado (o null), soloLectura (Vendedor), onGuardado(producto)
export default function FormProducto({ productoEditado = null, soloLectura = false, onGuardado }) {
  const [archivo, setArchivo] = useState(null);
  const [vista, setVista] = useState(productoEditado ? rutaImagen(productoEditado.imagen) : '');

  const inicial = productoEditado
    ? {
        codigo: productoEditado.codigo, nombre: productoEditado.nombre, descripcion: productoEditado.descripcion ?? '',
        precio: String(productoEditado.precio), stock: String(productoEditado.stock), stockCritico: String(productoEditado.stockCritico ?? ''),
        categoria: productoEditado.categoria, fabricante: productoEditado.fabricante ?? '', distribuidor: productoEditado.distribuidor ?? '',
        imagen: '',
      }
    : { codigo: '', nombre: '', descripcion: '', precio: '', stock: '', stockCritico: '', categoria: '', fabricante: '', distribuidor: '', imagen: '' };

  const reglas = {
    codigo: (v) => {
      if (productoEditado) return '';
      const t = v.trim();
      if (!t) return 'El código del producto es obligatorio.';
      if (t.length < 3) return `El código debe tener al menos 3 caracteres (tiene ${t.length}).`;
      return getProductos().some((p) => p.codigo.toLowerCase() === t.toLowerCase()) ? 'Ya existe un producto con ese código.' : '';
    },
    nombre: (v) => validarTextoLargo(v, 'El nombre', { max: 100 }),
    descripcion: (v) => validarTextoLargo(v, 'La descripción', { requerido: false, max: 500, genero: 'f' }),
    precio: (v) => validarNumero(v, 'El precio', { min: 0 }),
    stock: (v) => validarNumero(v, 'El stock', { min: 0, entero: true }),
    stockCritico: (v) => validarNumero(v, 'El stock crítico', { requerido: false, min: 0, entero: true }),
    categoria: (v) => (CATEGORIAS.includes(v) ? '' : 'Selecciona una categoría.'),
    fabricante: (v) => validarTextoLargo(v, 'El fabricante', { requerido: false, max: 100 }),
    distribuidor: (v) => validarTextoLargo(v, 'El distribuidor', { requerido: false, max: 100 }),
    imagen: () => validarImagen(archivo),
  };
  const ayudas = {
    precio: (v) => (v.trim() !== '' && Number(v.replace(',', '.')) === 0 ? 'Con precio 0 el producto se mostrará como FREE.' : ''),
    stock: (_v, vals) => alertaStockCritico(vals.stock, vals.stockCritico),
    stockCritico: (_v, vals) => alertaStockCritico(vals.stock, vals.stockCritico),
  };
  const form = useFormValidation({ initial: inicial, reglas, ayudas, contadores: { nombre: 100, descripcion: 500 } });

  const cambiarImagen = (e) => {
    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setArchivo(f);
    form.setValue('imagen', f ? f.name : '');
    if (f && !validarImagen(f)) leerArchivo(f).then(setVista);
  };

  const enviar = async (datos) => {
    const porDefecto = productoEditado ? productoEditado.imagen : IMAGEN_POR_CATEGORIA[datos.categoria];
    const imagenFinal = archivo ? await leerArchivo(archivo) : porDefecto;
    onGuardado?.(guardarProducto(datos, productoEditado, imagenFinal));
  };

  const ro = soloLectura;
  return (
    <form onSubmit={form.handleSubmit(enviar)} noValidate aria-label="Formulario de producto">
      <ResumenErrores mensaje={form.resumenErrores} />
      <div className="row">
        <div className="col-md-6">
          <CampoForm {...form.campo('codigo', { ayuda: 'Mínimo 3 caracteres. Ejemplo: JM003. No se puede cambiar después.' })} label="Código del producto" placeholder="JM003" autoComplete="off" disabled={ro || Boolean(productoEditado)} />
        </div>
        <div className="col-md-6">
          <CampoForm {...form.campo('nombre', { ayuda: 'Máximo 100 caracteres.' })} label="Nombre" autoComplete="off" disabled={ro} />
        </div>
      </div>
      <CampoForm {...form.campo('descripcion', { ayuda: 'Máximo 500 caracteres.' })} label="Descripción" opcional as="textarea" rows={4} disabled={ro} />
      <div className="row">
        <div className="col-md-4">
          <CampoForm {...form.campo('precio', { ayuda: 'Mínimo 0 (0 = producto FREE). Admite decimales.' })} label="Precio (CLP)" inputMode="decimal" autoComplete="off" disabled={ro} />
        </div>
        <div className="col-md-4">
          <CampoForm {...form.campo('stock', { ayuda: 'Número entero, mínimo 0.' })} label="Stock" inputMode="numeric" autoComplete="off" disabled={ro} />
        </div>
        <div className="col-md-4">
          <CampoForm {...form.campo('stockCritico', { ayuda: 'Entero. Se alerta si el stock es igual o menor.' })} label="Stock crítico" opcional inputMode="numeric" autoComplete="off" disabled={ro} />
        </div>
      </div>
      <CampoForm {...form.campo('categoria', { ayuda: 'Elige la categoría del catálogo.' })} label="Categoría" as="select" disabled={ro}>
        <option value="">-- Seleccione la categoría --</option>
        {CATEGORIAS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </CampoForm>
      <div className="row">
        <div className="col-md-6">
          <CampoForm {...form.campo('fabricante', { ayuda: 'Origen del producto para asegurar autenticidad.' })} label="Fabricante" opcional autoComplete="off" disabled={ro} />
        </div>
        <div className="col-md-6">
          <CampoForm {...form.campo('distribuidor', { ayuda: 'Si lo dejas vacío se usa Level-Up Gamer.' })} label="Distribuidor" opcional autoComplete="off" disabled={ro} />
        </div>
      </div>
      <div className="d-flex gap-3 align-items-start">
        <div className="flex-grow-1">
          <CampoForm
            {...form.campo('imagen', { ayuda: 'JPG, PNG, WebP o SVG de hasta 300 KB. Si no subes una, se usa la imagen de la categoría.' })}
            onChange={cambiarImagen}
            value={undefined}
            label="Imagen"
            opcional
            type="file"
            accept="image/*"
            disabled={ro}
          />
        </div>
        {vista && <img src={vista} alt="Vista previa de la imagen del producto" className="img-thumbnail lug-vista-imagen" />}
      </div>
      <div className="d-flex flex-wrap gap-2 mt-3">
        {!ro && (
          <button type="submit" className="btn btn-primary">
            Guardar producto
          </button>
        )}
        <Link className="btn btn-outline-info" to="/admin/productos">
          Volver al listado
        </Link>
      </div>
    </form>
  );
}
