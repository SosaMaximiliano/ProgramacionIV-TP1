import { Service } from '@angular/core';
import { Pelicula } from '../../core/models/pelicula.model';

@Service()
export class PeliculaService {
  //Utilizo el modelo de Pelicula para crear un array de peliculas
  peliculas: Pelicula[] = [
    {
      id: 1,
      nombre: 'Interestelar',
      imagen: 'assets/images/interestelar.jpg',
      sinopsis: 'Un grupo de astronautas busca un nuevo hogar para la humanidad.',
      duracion: 169,
      genero: 'Ciencia ficción',
      clasificacionEdad: 13,
      fechaEstreno: '',
      estaDisponible: true,
    },
    {
      id: 2,
      nombre: 'El Padrino',
      imagen: 'assets/images/el-padrino.jpg',
      sinopsis: 'La historia de una poderosa familia dedicada al crimen organizado.',
      duracion: 175,
      genero: 'Drama',
      clasificacionEdad: 18,
      fechaEstreno: '',
      estaDisponible: false,
    },
    {
      id: 3,
      nombre: 'El Padrino II',
      imagen: 'assets/images/el-padrino.jpg',
      sinopsis: 'La historia de una poderosa familia dedicada al crimen organizado.',
      duracion: 175,
      genero: 'Drama',
      clasificacionEdad: 18,
      fechaEstreno: '',
      estaDisponible: false,
    },
  ];

  obtenerPeliculas(): Pelicula[] {
    return this.peliculas;
  }

  obtenerPeliculaPorId(id: number): Pelicula | undefined {
    return this.peliculas.find((p) => p.id === id);
  }
}
