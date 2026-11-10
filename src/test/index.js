// Punto de entrada de Karma: carga automáticamente todos los archivos *.spec.js / *.spec.jsx
const context = import.meta.webpackContext('..', { recursive: true, regExp: /\.spec\.jsx?$/ });
context.keys().forEach(context);
