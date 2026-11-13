import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import CampoForm from '../components/CampoForm';
import ResumenErrores from '../components/ResumenErrores';
import useFormValidation from '../hooks/useFormValidation';
import { useAuth } from '../context/AuthContext';
import { esPersonalInterno } from '../lib/auth';
import { sugerirCorreo, validarCorreo, validarPassword } from '../lib/validators';

const AVISOS = {
  acceso: 'Para entrar al panel necesitas iniciar sesión con una cuenta de Administrador o Vendedor.',
  pago: 'Inicia sesión para terminar tu compra. Tu carrito se mantiene guardado.',
  pedidos: 'Inicia sesión para ver el historial de tus pedidos.',
};

const REGLAS = { correo: (v) => validarCorreo(v), password: (v) => validarPassword(v) };
const AYUDAS = { correo: sugerirCorreo };

// Inicio de sesión: Administrador/Vendedor → panel; Cliente → tienda (o la página a la que volver)
export default function Login() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorGeneral, setErrorGeneral] = useState('');
  const form = useFormValidation({ initial: { correo: '', password: '' }, reglas: REGLAS, ayudas: AYUDAS, contadores: { correo: 100 } });
  const aviso = AVISOS[params.get('aviso')];

  const enviar = (v) => {
    setErrorGeneral('');
    const r = login(v.correo, v.password);
    if (!r.ok) {
      setErrorGeneral(r.mensaje);
      document.getElementById(r.campo)?.focus();
      return;
    }
    const volver = params.get('volver');
    const destino = esPersonalInterno(r.usuario) ? '/admin' : volver && /^[a-z-]+$/.test(volver) ? `/${volver}` : '/';
    navigate(destino);
  };

  return (
    <div className="container py-4">
      <div className="text-center pt-3">
        <img src="img/logo.png" alt="Logo de Level-Up Gamer" width="110" height="115" />
        <p className="lug-titulo fs-5 mt-2">Level-Up Gamer</p>
      </div>
      <section className="lug-tarjeta-form mx-auto my-3 lug-tarjeta-form--angosta" aria-labelledby="titulo-login">
        <h1 className="h5 lug-tarjeta-form__titulo" id="titulo-login">
          Inicio de sesión
        </h1>
        <div className="p-4">
          {aviso && (
            <p className="alert alert-info" role="status">
              {aviso}
            </p>
          )}
          <form onSubmit={form.handleSubmit(enviar)} noValidate aria-label="Iniciar sesión">
            <ResumenErrores mensaje={form.resumenErrores} />
            {errorGeneral && (
              <p className="alert alert-danger" role="alert">
                {errorGeneral}
              </p>
            )}
            <CampoForm {...form.campo('correo', { ayuda: 'Usa tu correo @duoc.cl, @profesor.duoc.cl o @gmail.com.' })} label="Correo" type="email" placeholder="nombre@duoc.cl" autoComplete="email" />
            <CampoForm {...form.campo('password', { ayuda: 'Entre 4 y 10 caracteres.' })} label="Contraseña" type="password" autoComplete="current-password" />
            <button type="submit" className="btn btn-primary w-100">
              Iniciar sesión
            </button>
          </form>
          <p className="text-center text-body-secondary mt-3 mb-0">
            ¿Aún no tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
