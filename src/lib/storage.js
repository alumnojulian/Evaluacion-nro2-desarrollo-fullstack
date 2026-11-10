// Acceso seguro a localStorage (si falla, la app sigue funcionando con el valor por defecto)
export const LS = {
  get(clave, defecto) {
    try {
      const valor = localStorage.getItem(clave);
      return valor === null ? defecto : JSON.parse(valor);
    } catch (e) {
      return defecto;
    }
  },
  set(clave, valor) {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch (e) {
      return false;
    }
  },
  remove(clave) {
    try {
      localStorage.removeItem(clave);
    } catch (e) {
      /* sin acción */
    }
  },
};
