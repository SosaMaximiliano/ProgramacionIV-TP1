import { Service } from '@angular/core';
import { Sala } from '../../core/models/sala.model';

@Service()
export class SalaService {
  private salas: Sala[] = [
    {
      id: 1,
      nombre: 'Sala 1',
      filas: 5,
      butacasPorFila: 8,
    },
    {
      id: 2,
      nombre: 'Sala 2',
      filas: 6,
      butacasPorFila: 10,
    },
  ];

  obtenerSalas(): Sala[] {
    return this.salas;
  }

  obtenerSalaPorId(id: number): Sala | undefined {
    return this.salas.find((sala) => sala.id === id);
  }
}
