// Título de página con subtítulo opcional
export default function PageTitle({ titulo, subtitulo }) {
  return (
    <header className="pt-4 pb-3">
      <h1 className="mb-2">{titulo}</h1>
      {subtitulo && <p className="text-body-secondary mb-0">{subtitulo}</p>}
    </header>
  );
}
