import { useState } from 'react';

// Hook de formularios con validación en tiempo real (reemplaza a activarValidacion del Parcial 1).
//  - reglas:     { campo: (valor, valores) => "mensaje de error" | "" }
//  - ayudas:     { campo: (valor, valores) => "sugerencia dinámica" | "" }
//  - contadores: { campo: máximo } → muestra "12/100" mientras se escribe
// Los errores se recalculan en cada render, así los campos dependientes (confirmaciones) se revalidan solos.
export default function useFormValidation({ initial, reglas, ayudas = {}, contadores = {} }) {
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const errors = {};
  Object.keys(reglas).forEach((n) => {
    errors[n] = reglas[n](values[n] ?? '', values) || '';
  });
  const cantidadErrores = Object.values(errors).filter(Boolean).length;

  const setValue = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (value !== '') setTouched((t) => ({ ...t, [name]: true }));
  };

  const handleChange = (e) => setValue(e.target.name, e.target.value);
  const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  // Props listas para <CampoForm>
  const campo = (name, { ayuda = '' } = {}) => {
    const valor = values[name] ?? '';
    const visible = (touched[name] || submitted) && errors[name] ? errors[name] : '';
    const dinamica = ayudas[name] ? ayudas[name](valor, values) || '' : '';
    let texto = dinamica || ayuda;
    if (contadores[name] && valor) texto = `${texto} (${String(valor).trim().length}/${contadores[name]})`.trim();
    return {
      id: name,
      name,
      value: valor,
      onChange: handleChange,
      onBlur: handleBlur,
      error: visible,
      valido: Boolean(touched[name] || submitted) && !errors[name] && valor !== '',
      ayuda: texto,
      ayudaTipo: dinamica ? (dinamica.startsWith('⚠') ? 'alerta' : 'aviso') : '',
    };
  };

  const handleSubmit = (alEnviar) => (e) => {
    e.preventDefault();
    setSubmitted(true);
    const primero = Object.keys(reglas).find((n) => errors[n]);
    if (primero) {
      const el = e.currentTarget && e.currentTarget.elements ? e.currentTarget.elements[primero] : null;
      if (el) el.focus();
      return;
    }
    alEnviar(values);
  };

  const reset = (nuevos = initial) => {
    setValues(nuevos);
    setTouched({});
    setSubmitted(false);
  };

  const resumenErrores =
    submitted && cantidadErrores > 0 ? `Revisa ${cantidadErrores} ${cantidadErrores === 1 ? 'campo' : 'campos'} antes de continuar.` : '';

  return { values, errors, setValue, handleChange, handleBlur, handleSubmit, campo, reset, resumenErrores, cantidadErrores };
}
