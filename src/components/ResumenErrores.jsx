// Aviso general sobre la cantidad de campos con error (se actualiza a medida que se corrigen)
export default function ResumenErrores({ mensaje }) {
  if (!mensaje) return null;
  return (
    <div className="alert alert-danger" role="alert">
      {mensaje}
    </div>
  );
}
