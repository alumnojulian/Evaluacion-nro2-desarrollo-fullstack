// Botón flotante de soporte técnico por WhatsApp
export default function WhatsAppButton() {
  return (
    <a
      className="lug-whatsapp"
      href="https://wa.me/56900000000?text=Hola%20Level-Up%20Gamer%2C%20necesito%20soporte%20t%C3%A9cnico."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Soporte técnico por WhatsApp (se abre en una pestaña nueva)"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 2C6.48 2 2 6.03 2 11c0 2.4 1.05 4.58 2.77 6.2L4 22l4.9-2.1c.98.26 2.01.4 3.1.4 5.52 0 10-4.03 10-9s-4.48-9-10-9zM7.5 12.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm4.5 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm4.5 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
      </svg>
    </a>
  );
}
