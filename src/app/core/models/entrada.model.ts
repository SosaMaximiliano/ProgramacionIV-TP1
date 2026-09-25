export enum EstadoEntrada {
  Disponible = 1,
  Emitida = 2,
  Utilizada = 3,
  Cancelada = 4,
}

export interface Entrada {
  id: number;
  funcionId: number;
  butacaId: number;
  clienteId: number;
  precio: number;
  ventaId: number;
  estadoEntrada: EstadoEntrada;
}
