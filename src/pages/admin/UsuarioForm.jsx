import { Link, useNavigate, useParams } from 'react-router-dom';
import FormUsuario from '../../components/FormUsuario';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getUsuarios } from '../../lib/auth';

// Nuevo usuario (/admin/usuarios/nuevo) o edición (/admin/usuarios/:run)
export default function UsuarioForm() {
  const { run } = useParams();
  const navigate = useNavigate();
  const { mostrarToast } = useToast();
  const { refrescar } = useAuth();
  const editado = run ? getUsuarios().find((u) => u.run === run) || null : null;

  const titulo = run ? 'Editar usuario' : 'Nuevo usuario';
  const terminado = (mensaje) => {
    refrescar();
    mostrarToast(mensaje);
    navigate('/admin/usuarios');
  };

  return (
    <>
      <h1 className="fs-2 mb-4">{titulo}</h1>
      <section className="lug-tarjeta-form lug-tarjeta-form--ancha" aria-label={titulo}>
        <div className="p-4">
          {run && !editado ? (
            <p className="alert alert-danger" role="alert">
              No encontramos ese usuario. <Link to="/admin/usuarios">Volver al listado</Link>
            </p>
          ) : (
            <FormUsuario
              key={run || 'nuevo'}
              modo={run ? 'admin-editar' : 'admin-nuevo'}
              usuarioEditado={editado}
              onCreado={() => terminado('Usuario creado correctamente.')}
              onActualizado={() => terminado('Usuario actualizado correctamente.')}
            />
          )}
        </div>
      </section>
    </>
  );
}
