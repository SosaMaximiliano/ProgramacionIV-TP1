import { Entrada } from './entrada.model';
import { ItemVenta } from './item-venta.model';

export enum FormaPago {
  Efectivo = 1,
  Debito = 2,
  Credito = 3,
  Transferencia = 4,
  Otro = 9,
}
export interface Venta {
  id: number;
  clienteId: number;
  fechaVenta: string;
  subtotal: number;
  descuentoPorcentaje: number;
  descuentoImporte: number;
  precioFinal: number;
  formaPago: FormaPago;
  estaPagado: boolean;
  estaCancelada: boolean;
  entradas: Entrada[];
}
