import { Service } from '@angular/core';
import { Entrada, EstadoEntrada } from '../../core/models/entrada.model';

@Service()
export class EntradaService {
  private entradas: Entrada[] = [];

  crearEntrada(
    // funcionId: number,
    // butacaId: number,
    pelicula: string,
    fila: string,
    asiento: number,
    clienteId: number,
    precio: number,
    ventaId: number,
  ): Entrada {
    const entrada = {
      id: this.entradas.length + 1,
      pelicula,
      fila,
      asiento,
      clienteId,
      precio,
      ventaId,
      estadoEntrada: EstadoEntrada.Disponible,
    };

    this.entradas.push(entrada);
    return entrada;
  }
}
