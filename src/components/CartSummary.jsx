import { formatoCLP } from '../lib/format';

// Resumen del pedido: subtotal, descuento aplicado y total. Props: resumen (de calcularResumen)
export default function CartSummary({ resumen }) {
  return (
    <div>
      <div className="d-flex justify-content-between py-1">
        <span>Subtotal</span>
        <span>{formatoCLP(resumen.subtotal)}</span>
      </div>
      {resumen.descuento > 0 && (
        <div className="d-flex justify-content-between py-1 text-success">
          <span>{resumen.origen}</span>
          <span>−{formatoCLP(resumen.descuento)}</span>
        </div>
      )}
      <div className="d-flex justify-content-between border-top mt-2 pt-2 fs-5">
        <span>Total</span>
        <strong className="lug-precio">{formatoCLP(resumen.total)}</strong>
      </div>
      <p className="small text-body-secondary mt-2">Precios en pesos chilenos (CLP), IVA incluido.</p>
    </div>
  );
}
