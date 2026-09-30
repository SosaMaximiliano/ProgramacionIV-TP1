import { Service } from '@angular/core';
import { ButacaFuncion } from '../models/butaca-funcion.model';

@Service()
export class ButacaFuncionService {
  private butacasOcupadas: ButacaFuncion[] = [
    {
      funcionId: 2,
      butacaId: 1,
    },
    {
      funcionId: 2,
      butacaId: 2,
    },
    {
      funcionId: 2,
      butacaId: 5,
    },
    {
      funcionId: 4,
      butacaId: 10,
    },
  ];
  //Filtra el array de butacas ocupadas por funcion y devuelve un array
  //con el número de butaca ocupada
  obtenerButacasOcupadas(funcionId: number) {
    return this.butacasOcupadas.filter((b) => b.funcionId === funcionId).map((b) => b.butacaId);
  }

  ocuparButacas(funcionId: number, butacaIds: number[]): void {
    for (const butacaId of butacaIds) {
      const yaOcupada = this.butacasOcupadas.some(
        (b) => b.funcionId === funcionId && b.butacaId === butacaId,
      );

      if (!yaOcupada) {
        this.butacasOcupadas.push({ funcionId, butacaId });
      }
    }
  }
}
