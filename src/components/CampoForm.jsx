// Campo de formulario Bootstrap con etiqueta, ayuda, contador y mensaje de error accesible
export default function CampoForm({
  id,
  name,
  label,
  opcional = false,
  as = 'input',
  type = 'text',
  value,
  onChange,
  onBlur,
  error = '',
  valido = false,
  ayuda = '',
  ayudaTipo = '',
  ocultarEtiqueta = false,
  children,
  className = '',
  ...resto
}) {
  const Control = as;
  const clase = `${as === 'select' ? 'form-select' : 'form-control'} ${error ? 'is-invalid' : valido ? 'is-valid' : ''} ${className}`.trim();
  const ids = [ayuda ? `${id}-ayuda` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;
  const props = as === 'input' ? { type } : {};
  const claseAyuda = `form-text${ayudaTipo === 'aviso' ? ' text-info' : ''}${ayudaTipo === 'alerta' ? ' text-warning' : ''}`;
  return (
    <div className="mb-3">
      <label htmlFor={id} className={`form-label${ocultarEtiqueta ? ' visually-hidden' : ''}`}>
        {label}
        {opcional && <span className="text-body-secondary"> (opcional)</span>}
      </label>
      <Control
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={clase}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={ids}
        {...props}
        {...resto}
      >
        {children}
      </Control>
      {ayuda && (
        <div id={`${id}-ayuda`} className={claseAyuda}>
          {ayuda}
        </div>
      )}
      {error && (
        <div id={`${id}-error`} className="invalid-feedback d-block">
          {error}
        </div>
      )}
    </div>
  );
}
