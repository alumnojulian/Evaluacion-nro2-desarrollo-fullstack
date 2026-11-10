import { Link } from 'react-router-dom';
import CampoForm from './CampoForm';
import ResumenErrores from './ResumenErrores';
import useFormValidation from '../hooks/useFormValidation';
import { REGIONES } from '../data/regiones';
import {
  ROLES,
  actualizarUsuario,
  esCorreoDuoc,
  getUsuarios,
  registrarUsuario,
} from '../lib/auth';
import {
  calcularEdad,
  sugerirCorreo,
  validarCorreo,
  validarFechaNacimiento,
  validarPassword,
  validarRun,
  validarTelefono,
  validarTextoLargo,
} from '../lib/validators';

const VACIO = {
  run: '', nombre: '', apellidos: '', correo: '', confirmarCorreo: '', password: '', confirmarPassword: '',
  telefono: '', fechaNacimiento: '', tipo: '', region: '', comuna: '', direccion: '', referido: '',
};

// Formulario de usuario con validaciones. El enunciado indica que registrar un usuario es lo mismo
// que crearlo en el administrador, por eso un solo componente sirve para los tres modos:
//   modo="registro" | "admin-nuevo" | "admin-editar"  (en edición se entrega usuarioEditado)
// Props de salida: onCreado({ usuario, mensajeReferido }) y onActualizado(usuario)
export default function FormUsuario({ modo, usuarioEditado = null, onCreado, onActualizado }) {
  const esEdicion = modo === 'admin-editar';
  const esRegistro = modo === 'registro';

  const inicial = esEdicion
    ? { ...VACIO, ...usuarioEditado, password: '', confirmarPassword: '', confirmarCorreo: usuarioEditado.correo }
    : VACIO;

  const correoDuplicado = (correo) => {
    const c = correo.trim().toLowerCase();
    return getUsuarios().some((u) => u.correo.toLowerCase() === c && (!usuarioEditado || u.run !== usuarioEditado.run));
  };

  // El orden de las reglas es el orden del formulario: al enviar con errores se enfoca el primero
  const reglas = {
    ...(!esEdicion && {
      run: (v) => {
        const error = validarRun(v);
        if (error) return error;
        return getUsuarios().some((u) => u.run === v.trim().toUpperCase()) ? 'Ya existe un usuario con ese RUN.' : '';
      },
    }),
    nombre: (v) => validarTextoLargo(v, 'El nombre', { max: 50 }),
    apellidos: (v) => validarTextoLargo(v, 'Los apellidos', { max: 100, genero: 'mp' }),
    correo: (v) => validarCorreo(v) || (correoDuplicado(v) ? 'Ya existe un usuario registrado con ese correo.' : ''),
    confirmarCorreo: (v, vals) => {
      if (!v.trim()) return 'Confirma tu correo escribiéndolo otra vez.';
      return v.trim().toLowerCase() === vals.correo.trim().toLowerCase() ? '' : 'Los correos no coinciden.';
    },
    password: (v) => (esEdicion && v === '' ? '' : validarPassword(v)),
    confirmarPassword: (v, vals) => {
      if (esEdicion && vals.password === '' && v === '') return '';
      if (!v) return 'Confirma tu contraseña escribiéndola otra vez.';
      return v === vals.password ? '' : 'Las contraseñas no coinciden.';
    },
    telefono: (v) => validarTelefono(v),
    fechaNacimiento: (v) => validarFechaNacimiento(v, esRegistro ? { requerida: true, minEdad: 18 } : {}),
    ...(!esRegistro && { tipo: (v) => (ROLES.includes(v) ? '' : 'Selecciona el tipo de usuario.') }),
    region: (v) => (v ? '' : 'Selecciona una región.'),
    comuna: (v) => (v ? '' : 'Selecciona una comuna.'),
    direccion: (v) => validarTextoLargo(v, 'La dirección', { max: 300, genero: 'f' }),
    ...(esRegistro && {
      referido: (v) => {
        const codigo = v.trim().toUpperCase();
        if (!codigo) return '';
        if (!/^[A-Z0-9]{6,10}$/.test(codigo)) return 'El código de referido lleva entre 6 y 10 letras o números.';
        return getUsuarios().some((u) => u.codigoReferido === codigo) ? '' : 'No encontramos ese código de referido. Revísalo o déjalo vacío.';
      },
    }),
  };

  const ayudas = {
    correo: (v) => {
      const sugerencia = sugerirCorreo(v);
      if (sugerencia) return sugerencia;
      if (!validarCorreo(v) && esCorreoDuoc(v) && esRegistro) return '¡Con tu correo Duoc tendrás 20 % de descuento de por vida!';
      return '';
    },
    password: (v) => {
      if (!v) return '';
      if (v.length < 4) return `Te faltan ${4 - v.length} ${4 - v.length === 1 ? 'carácter' : 'caracteres'} para llegar al mínimo de 4.`;
      if (v.length > 10) return `Te pasaste por ${v.length - 10}: el máximo es 10 caracteres.`;
      return 'Longitud correcta.';
    },
    run: (v) => (/[.-]/.test(v.trim()) ? 'Escribe el RUN sin puntos ni guion.' : ''),
    fechaNacimiento: (v) => {
      if (!v || !esRegistro) return '';
      const edad = validarFechaNacimiento(v) ? null : calcularEdad(v);
      return edad !== null && edad < 18 ? `Tienes ${edad} años: para registrarte necesitas ser mayor de 18.` : '';
    },
  };
  const contadores = { nombre: 50, apellidos: 100, correo: 100, direccion: 300 };

  const form = useFormValidation({ initial: inicial, reglas, ayudas, contadores });
  const comunas = REGIONES.find((r) => r.nombre === form.values.region)?.comunas.slice().sort((a, b) => a.localeCompare(b, 'es')) || [];

  const cambiarRegion = (e) => {
    form.setValue('region', e.target.value);
    form.setValue('comuna', '');
  };

  const enviar = (v) => {
    if (esEdicion) {
      onActualizado?.(actualizarUsuario(usuarioEditado.run, v));
      return;
    }
    onCreado?.(registrarUsuario(v, { tipoForzado: esRegistro ? 'Cliente' : null }));
  };

  const etiquetaBoton = esEdicion ? 'Guardar cambios' : esRegistro ? 'Registrar' : 'Crear usuario';

  return (
    <form onSubmit={form.handleSubmit(enviar)} noValidate aria-label="Formulario de usuario">
      <ResumenErrores mensaje={form.resumenErrores} />
      <CampoForm
        {...form.campo('run', { ayuda: 'Sin puntos ni guion, de 7 a 9 caracteres. Ejemplo: 123456785' })}
        label="RUN"
        placeholder="123456785"
        autoComplete="off"
        spellCheck="false"
        disabled={esEdicion}
      />
      <div className="row">
        <div className="col-md-6">
          <CampoForm {...form.campo('nombre')} label="Nombre" autoComplete="given-name" />
        </div>
        <div className="col-md-6">
          <CampoForm {...form.campo('apellidos')} label="Apellidos" autoComplete="family-name" />
        </div>
      </div>
      <CampoForm {...form.campo('correo', { ayuda: 'Usa @duoc.cl, @profesor.duoc.cl o @gmail.com.' })} label="Correo" type="email" placeholder="nombre@duoc.cl" autoComplete="email" />
      <CampoForm {...form.campo('confirmarCorreo')} label="Confirmar correo" type="email" placeholder="Repite tu correo" autoComplete="off" />
      <div className="row">
        <div className="col-md-6">
          <CampoForm
            {...form.campo('password', {
              ayuda: esEdicion ? 'Déjala vacía para mantener la contraseña actual. Si la cambias, usa de 4 a 10 caracteres.' : 'Entre 4 y 10 caracteres.',
            })}
            label="Contraseña"
            opcional={esEdicion}
            type="password"
            autoComplete="new-password"
          />
        </div>
        <div className="col-md-6">
          <CampoForm {...form.campo('confirmarPassword')} label="Confirmar contraseña" opcional={esEdicion} type="password" autoComplete="new-password" />
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <CampoForm {...form.campo('telefono', { ayuda: 'Móvil chileno, por ejemplo +56 9 1234 5678.' })} label="Teléfono" opcional type="tel" placeholder="+56 9 1234 5678" autoComplete="tel" />
        </div>
        <div className="col-md-6">
          <CampoForm
            {...form.campo('fechaNacimiento', { ayuda: esRegistro ? 'Debes ser mayor de 18 años para registrarte.' : 'Dato opcional.' })}
            label="Fecha de nacimiento"
            opcional={!esRegistro}
            type="date"
            autoComplete="bday"
          />
        </div>
      </div>
      {!esRegistro && (
        <CampoForm
          {...form.campo('tipo', { ayuda: 'El administrador accede a todo; el vendedor solo ve productos y órdenes; el cliente solo la tienda.' })}
          label="Tipo de usuario"
          as="select"
        >
          <option value="">Seleccione el tipo</option>
          {ROLES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </CampoForm>
      )}
      <div className="row">
        <div className="col-md-6">
          <CampoForm {...form.campo('region')} onChange={cambiarRegion} label="Región" as="select" autoComplete="address-level1">
            <option value="">-- Seleccione la región --</option>
            {REGIONES.map((r) => (
              <option key={r.id} value={r.nombre}>
                {r.nombre}
              </option>
            ))}
          </CampoForm>
        </div>
        <div className="col-md-6">
          <CampoForm {...form.campo('comuna')} label="Comuna" as="select" disabled={!form.values.region} autoComplete="address-level2">
            <option value="">-- Seleccione la comuna --</option>
            {comunas.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </CampoForm>
        </div>
      </div>
      <CampoForm {...form.campo('direccion', { ayuda: 'Calle y número, con un máximo de 300 caracteres.' })} label="Dirección" autoComplete="street-address" />
      {esRegistro && (
        <CampoForm
          {...form.campo('referido', { ayuda: 'Si un amigo te invitó, escribe su código y él ganará 100 puntos LevelUp.' })}
          label="Código de referido"
          opcional
          placeholder="LUPXXXXX"
          autoComplete="off"
          className="text-uppercase"
        />
      )}
      <div className="d-flex flex-wrap gap-2 mt-4">
        <button type="submit" className="btn btn-primary">
          {etiquetaBoton}
        </button>
        {!esRegistro && (
          <Link className="btn btn-outline-info" to="/admin/usuarios">
            Cancelar
          </Link>
        )}
      </div>
    </form>
  );
}

