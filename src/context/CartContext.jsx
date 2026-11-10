import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { LS } from '../lib/storage';
import {
  CLAVE_CARRITO,
  CLAVE_CUPON,
  buscarProducto,
  getOrdenes,
  getProductos,
  guardarOrdenes,
  guardarProductos,
} from '../lib/store';
import {
  agregarLinea,
  calcularResumen,
  cambiarCantidad,
  contarItems,
  crearOrden,
  descontarStock,
  lineaSinStock,
  quitarLinea,
  validarCupon,
} from '../lib/cart';

const CartContext = createContext(null);

// Estado global del carrito: líneas, cupón y resumen (persistidos en localStorage)
export function CartProvider({ children }) {
  const { usuario } = useAuth();
  const [carrito, setCarrito] = useState(() => LS.get(CLAVE_CARRITO, []));
  const [cupon, setCupon] = useState(() => LS.get(CLAVE_CUPON, ''));

  useEffect(() => {
    LS.set(CLAVE_CARRITO, carrito);
  }, [carrito]);
  useEffect(() => {
    if (cupon) LS.set(CLAVE_CUPON, cupon);
    else LS.remove(CLAVE_CUPON);
  }, [cupon]);

  const resumen = calcularResumen({ carrito, productos: getProductos(), usuario, cupon });

  const agregar = useCallback(
    (codigo, cantidad = 1) => {
      const r = agregarLinea(carrito, buscarProducto(codigo), cantidad);
      if (r.ok) setCarrito(r.carrito);
      return r;
    },
    [carrito]
  );

  const cambiar = useCallback(
    (codigo, cantidad) => {
      const r = cambiarCantidad(carrito, buscarProducto(codigo), cantidad);
      setCarrito(r.carrito);
      return r;
    },
    [carrito]
  );

  const quitar = useCallback((codigo) => setCarrito((c) => quitarLinea(c, codigo)), []);

  const vaciar = useCallback(() => {
    setCupon('');
    setCarrito([]);
  }, []);

  const aplicarCupon = useCallback(
    (valor) => {
      const error = validarCupon(valor, resumen.subtotal);
      if (error) return { ok: false, mensaje: error };
      const codigo = valor.trim().toUpperCase();
      setCupon(codigo);
      return { ok: true, codigo };
    },
    [resumen.subtotal]
  );

  // Paga: crea la orden, descuenta el stock y vacía el carrito
  const pagar = useCallback(() => {
    if (!usuario) return { ok: false, requiereLogin: true };
    if (resumen.lineas.length === 0) return { ok: false, mensaje: 'Tu carrito está vacío.' };
    const sinStock = lineaSinStock(resumen.lineas);
    if (sinStock) return { ok: false, mensaje: `No hay stock suficiente de ${sinStock.producto.nombre}. Ajusta la cantidad.` };
    const ordenes = getOrdenes();
    const orden = crearOrden(resumen, usuario, ordenes);
    guardarOrdenes([...ordenes, orden]);
    guardarProductos(descontarStock(getProductos(), resumen.lineas));
    vaciar();
    return { ok: true, orden };
  }, [usuario, resumen, vaciar]);

  const value = useMemo(
    () => ({ carrito, cupon, resumen, totalItems: contarItems(carrito), agregar, cambiar, quitar, vaciar, aplicarCupon, pagar }),
    [carrito, cupon, resumen, agregar, cambiar, quitar, vaciar, aplicarCupon, pagar]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
