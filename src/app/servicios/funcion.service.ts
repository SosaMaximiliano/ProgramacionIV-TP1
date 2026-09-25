import { Service } from '@angular/core';
import { Funcion } from '../core/models/funcion.model';

@Service()
export class FuncionService {
  private funciones: Funcion[] = [
    {
      id: 1,
      peliculaId: 1,
      salaId: 1,
      fecha: '2026-09-17',
      hora: '18:00',
      precioEntrada: 5000,
    },
    {
      id: 2,
      peliculaId: 1,
      salaId: 2,
      fecha: '2026-09-17',
      hora: '20:30',
      precioEntrada: 8000,
    },
    {
      id: 3,
      peliculaId: 1,
      salaId: 1,
      fecha: '2026-09-17',
      hora: '22:45',
      precioEntrada: 8000,
    },
    {
      id: 4,
      peliculaId: 2,
      salaId: 2,
      fecha: '2026-09-17',
      hora: '19:00',
      precioEntrada: 5000,
    },
  ];

  obtenerFunciones(): Funcion[] {
    return this.funciones;
  }

  obtenerFuncionesPorPelicula(peliculaId: number): Funcion[] {
    return this.funciones.filter((funcion) => funcion.peliculaId === peliculaId);
  }
}
