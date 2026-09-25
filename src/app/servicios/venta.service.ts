// import { Service } from '@angular/core';
// import { Venta, FormaPago } from '../core/models/venta.model';

// @Service()
// export class VentaService {
//   private ventas: Venta[] = [];

//   crearVenta(
//     clienteId: number,
//     precioEntrada: number,
//     cantidadEntradas: number,
//     formaPago: FormaPago,
//   ): Venta {
//     const subtotal = precioEntrada * cantidadEntradas;
//     const impuestos = 0;
//     const precioFinal = subtotal + impuestos;

//     const venta: Venta = {
//       id: this.ventas.length + 1,
//       clienteId,
//       fechaVenta: new Date().toISOString(),
//       entradas: [],
//       subtotal,
//       impuestos,
//       precioFinal,
//       formaPago,
//       estaPagado: false,
//     };

//     this.ventas.push(venta);

//     return venta;
//   }
// }
