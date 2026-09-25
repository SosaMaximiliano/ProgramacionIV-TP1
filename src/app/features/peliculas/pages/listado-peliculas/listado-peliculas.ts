import { Component, OnInit } from '@angular/core';
import { Pelicula } from '../../../../core/models/pelicula.model';
import { PeliculaCard } from '../../components/pelicula-card/pelicula-card';
import { Router } from '@angular/router';
import { PeliculaService } from '../../../../servicios/pelicula-service';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [PeliculaCard, FormsModule],
  selector: 'app-listado-peliculas',
  styleUrl: './listado-peliculas.css',
  templateUrl: './listado-peliculas.html',
})
export class ListadoPeliculas implements OnInit {
  peliculas: Pelicula[] = [];
  peliculasFiltradas: Pelicula[] = [];
  busqueda: string = '';

  //Al iniciar la app obtengo las peliculas desde el servicio
  ngOnInit(): void {
    this.peliculas = this.peliculaService.obtenerPeliculas();
    this.peliculasFiltradas = this.peliculas;
  }

  //Inyeccion de dependencias
  constructor(
    private router: Router,
    private peliculaService: PeliculaService,
  ) {}

  //Recibo un objeto Pelicula emitido por el componente hijo (pelicula-card).
  seleccionarPelicula(pelicula: Pelicula) {
    //Utilizo el método navigate para ir a /peliculas + el id de la pelicula recibida
    this.router.navigate(['/peliculas', pelicula.id]);
  }

  filtrarPeliculas() {
    const texto = this.busqueda.toLowerCase();

    this.peliculasFiltradas = this.peliculas.filter(
      (p) => p.nombre.toLowerCase().includes(texto) || p.genero.toLowerCase().includes(texto),
    );
  }
}
