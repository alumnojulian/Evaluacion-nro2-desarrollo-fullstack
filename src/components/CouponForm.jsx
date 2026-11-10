import CampoForm from './CampoForm';
import useFormValidation from '../hooks/useFormValidation';
import { validarCupon } from '../lib/cart';

// Formulario de cupón. Props: subtotal (para validar la compra mínima) y onAplicar(codigo)
export default function CouponForm({ subtotal, onAplicar }) {
  const form = useFormValidation({
    initial: { cupon: '' },
    reglas: { cupon: (v) => validarCupon(v, subtotal) },
  });

  const enviar = (v) => {
    onAplicar(v.cupon.trim().toUpperCase());
    form.reset();
  };

  return (
    <form onSubmit={form.handleSubmit(enviar)} noValidate className="mt-3">
      <CampoForm
        {...form.campo('cupon', { ayuda: 'Cupones de prueba: LEVELUP10 y GAMER5000.' })}
        label="Cupón de descuento"
        ocultarEtiqueta
        autoComplete="off"
        placeholder="Ingrese el cupón de descuento"
      />
      <button type="submit" className="btn btn-outline-info w-100">
        Aplicar
      </button>
    </form>
  );
}
