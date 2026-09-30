import { Service } from '@angular/core';
import { Venta, FormaPago } from '../models/venta.model';
import { Entrada } from '../models/entrada.model';

@Service()
export class VentaService {
  private ventas: Venta[] = [];

  crearVenta(clienteId: number, entradas: Entrada[], formaPago: FormaPago): Venta {
    const subtotal = entradas.reduce((total, entrada) => total + entrada.precio, 0);
    const venta: Venta = {
      id: this.ventas.length + 1,
      clienteId,
      fechaVenta: new Date().toISOString(),
      subtotal,
      precioFinal: subtotal,
      formaPago,
      estaPagado: false,
      entradas,
    };

    this.ventas.push(venta);
    return venta;
  }
}
