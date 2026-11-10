// Diálogo de confirmación (modal Bootstrap controlado por estado). Reemplaza a confirmarAccion() del Parcial 1.
export default function ConfirmModal({ abierto, mensaje, textoBoton = 'Confirmar', onConfirmar, onCancelar }) {
  if (!abierto) return null;
  return (
    <>
      <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="confirm-mensaje">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <p id="confirm-mensaje" className="mb-0">
                {mensaje}
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-info" onClick={onCancelar}>
                Cancelar
              </button>
              <button type="button" className="btn btn-outline-danger" onClick={onConfirmar}>
                {textoBoton}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  );
}
