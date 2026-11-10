import { useState } from 'react';
import CampoForm from '../components/CampoForm';
import ResumenErrores from '../components/ResumenErrores';
import useFormValidation from '../hooks/useFormValidation';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { guardarMensaje } from '../lib/store';
import { sugerirCorreo, validarCorreo, validarTextoLargo } from '../lib/validators';

const REGLAS = {
  nombre: (v) => validarTextoLargo(v, 'El nombre', { max: 100 }),
  correo: (v) => validarCorreo(v),
  comentario: (v) => validarTextoLargo(v, 'El comentario', { max: 500 }),
};

// Formulario de contacto: si hay sesión, precarga el nombre y el correo
export default function Contacto() {
  const { usuario } = useAuth();
  const { mostrarToast } = useToast();
  const [enviado, setEnviado] = useState(false);
  const inicial = {
    nombre: usuario ? `${usuario.nombre} ${usuario.apellidos}`.slice(0, 100) : '',
    correo: usuario ? usuario.correo : '',
    comentario: '',
  };
  const form = useFormValidation({
    initial: inicial,
    reglas: REGLAS,
    ayudas: { correo: sugerirCorreo },
    contadores: { nombre: 100, correo: 100, comentario: 500 },
  });

  const enviar = (v) => {
    guardarMensaje(v);
    form.reset(inicial);
    setEnviado(true);
    mostrarToast('Mensaje enviado. Te responderemos pronto.');
  };

  return (
    <div className="container py-4">
      <div className="text-center pt-3">
        <img src="img/logo.png" alt="Logo de Level-Up Gamer" width="110" height="115" />
        <p className="lug-titulo fs-5 mt-2">Level-Up Gamer</p>
      </div>
      <section className="lug-tarjeta-form mx-auto my-3 lug-tarjeta-form--angosta" aria-labelledby="titulo-contacto">
        <h1 className="h5 lug-tarjeta-form__titulo" id="titulo-contacto">
          Formulario de contacto
        </h1>
        <div className="p-4">
          {enviado && (
            <section className="alert alert-success" tabIndex="-1" aria-label="Mensaje enviado">
              <strong>¡Mensaje enviado!</strong> Lo recibimos y te responderemos al correo que indicaste.
            </section>
          )}
          <form onSubmit={form.handleSubmit(enviar)} noValidate aria-label="Contacto">
            <ResumenErrores mensaje={form.resumenErrores} />
            <CampoForm {...form.campo('nombre', { ayuda: 'Máximo 100 caracteres.' })} label="Nombre completo" autoComplete="name" />
            <CampoForm {...form.campo('correo', { ayuda: 'Usa @duoc.cl, @profesor.duoc.cl o @gmail.com.' })} label="Correo" type="email" placeholder="nombre@duoc.cl" autoComplete="email" />
            <CampoForm {...form.campo('comentario', { ayuda: 'Cuéntanos en qué podemos ayudarte (máximo 500 caracteres).' })} label="Contenido" as="textarea" rows={5} />
            <button type="submit" className="btn btn-primary w-100">
              Enviar mensaje
            </button>
          </form>
          <p className="text-center text-body-secondary mt-3 mb-0">
            ¿Necesitas soporte técnico? Escríbenos por el botón de WhatsApp de la esquina inferior derecha.
          </p>
        </div>
      </section>
    </div>
  );
}
