import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormUsuario from '../components/FormUsuario';

export default function Registro() {
  const [creado, setCreado] = useState(null);

  return (
    <div className="container py-4">
      <section className="lug-tarjeta-form mx-auto my-3" aria-labelledby="titulo-registro">
        <h1 className="h5 lug-tarjeta-form__titulo" id="titulo-registro">
          Registro de usuario
        </h1>
        <div className="p-4">
          {creado ? (
            <section className="text-center" tabIndex="-1" aria-label="Registro exitoso">
              <h2 className="text-success">¡Bienvenido/a, {creado.usuario.nombre}!</h2>
              <p>
                Tu cuenta quedó creada. Este es tu código de referido: compártelo y gana 100 puntos LevelUp por cada amigo que se registre con él.
              </p>
              <p>
                <span className="lug-codigo-referido" data-testid="codigo-referido">
                  {creado.usuario.codigoReferido}
                </span>
              </p>
              {creado.usuario.descuentoDuoc && (
                <p className="alert alert-success">Registraste un correo Duoc: tienes 20 % de descuento de por vida en tus compras.</p>
              )}
              {creado.mensajeReferido && <p className="text-body-secondary">{creado.mensajeReferido}</p>}
              <Link className="btn btn-primary" to="/login">
                Iniciar sesión
              </Link>
            </section>
          ) : (
            <>
              <FormUsuario modo="registro" onCreado={setCreado} />
              <p className="text-center text-body-secondary mt-3 mb-0">
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
