import { Service } from '@angular/core';
import { Butaca } from '../models/butaca.model';
import { Sala } from '../models/sala.model';

@Service()
export class ButacaService {
  obtenerButacasDeSala(sala: Sala): Butaca[] {
    const butacas: Butaca[] = [];
    //Recorro las filas
    for (let fila = 0; fila < sala.filas; fila++) {
      const letraFila = String.fromCharCode(65 + fila);
      //Recorro las butacas
      for (let numero = 1; numero <= sala.butacasPorFila; numero++) {
        butacas.push({
          id: butacas.length + 1,
          salaId: sala.id,
          fila: letraFila,
          numero: numero,
        });
      }
    }
    return butacas;
  }
}
