import { useState } from 'react';
import { Link } from 'react-router-dom';
import CampoForm from '../../components/CampoForm';
import ConfirmModal from '../../components/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROLES, getUsuarios, guardarUsuarios, motivoNoEliminar } from '../../lib/auth';
import { pluralizar } from '../../lib/format';

const CLASE_TIPO = { Administrador: 'text-bg-warning', Vendedor: 'text-bg-info', Cliente: 'text-bg-success' };

export default function UsuariosAdmin() {
  const { usuario: actual } = useAuth();
  const { mostrarToast } = useToast();
  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState('');
  const [aEliminar, setAEliminar] = useState(null);
  const [, releer] = useState(0); // fuerza la relectura de los datos tras eliminar

  const lista = getUsuarios().filter((u) => {
    if (tipo && u.tipo !== tipo) return false;
    const t = q.trim().toLowerCase();
    return !t || `${u.run} ${u.nombre} ${u.apellidos} ${u.correo}`.toLowerCase().includes(t);
  });

  const pedirEliminar = (u) => {
    const motivo = motivoNoEliminar(getUsuarios(), u, actual);
    if (motivo) {
      mostrarToast(motivo, 'error');
      return;
    }
    setAEliminar(u);
  };

  const confirmar = () => {
    guardarUsuarios(getUsuarios().filter((x) => x.run !== aEliminar.run));
    setAEliminar(null);
    releer((v) => v + 1);
    mostrarToast('Usuario eliminado.');
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 className="fs-2 mb-0">Usuarios</h1>
        <Link className="btn btn-primary" to="/admin/usuarios/nuevo">
          Nuevo usuario
        </Link>
      </div>
      <div className="row g-3 align-items-end">
        <div className="col-12 col-md-4">
          <CampoForm id="buscar-usuario" name="q" label="Buscar" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="RUN, nombre o correo" autoComplete="off" />
        </div>
        <div className="col-12 col-md-4">
          <CampoForm id="filtro-tipo" name="tipo" label="Tipo de usuario" as="select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </CampoForm>
        </div>
        <div className="col-12 col-md-4">
          <p className="text-body-secondary mb-3" aria-live="polite" data-testid="conteo-usuarios">
            {pluralizar(lista.length, 'usuario', 'usuarios')}
          </p>
        </div>
      </div>
      <div className="table-responsive lug-panel">
        <table className="table table-dark table-hover align-middle mb-0">
          <caption className="visually-hidden">Listado de usuarios</caption>
          <thead>
            <tr>
              <th scope="col">RUN</th>
              <th scope="col">Nombre</th>
              <th scope="col">Correo</th>
              <th scope="col">Tipo</th>
              <th scope="col">Comuna</th>
              <th scope="col" className="text-end">Puntos</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.length ? (
              lista.map((u) => (
                <tr key={u.run}>
                  <td>{u.run}</td>
                  <td>
                    {u.nombre} {u.apellidos}
                  </td>
                  <td>{u.correo}</td>
                  <td>
                    <span className={`badge ${CLASE_TIPO[u.tipo]}`}>{u.tipo}</span>
                  </td>
                  <td>{u.comuna}</td>
                  <td className="text-end">{u.puntos || 0}</td>
                  <td className="text-nowrap">
                    <Link className="btn btn-outline-info btn-sm me-1" to={`/admin/usuarios/${encodeURIComponent(u.run)}`}>
                      Editar
                    </Link>
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => pedirEliminar(u)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-body-secondary">
                  No hay usuarios que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ConfirmModal
        abierto={Boolean(aEliminar)}
        mensaje={aEliminar ? `¿Eliminar al usuario ${aEliminar.nombre} ${aEliminar.apellidos} (${aEliminar.run})?` : ''}
        textoBoton="Eliminar"
        onConfirmar={confirmar}
        onCancelar={() => setAEliminar(null)}
      />
    </div>
  );
}
