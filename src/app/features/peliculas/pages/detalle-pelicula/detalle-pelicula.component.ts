import { FuncionService } from '../../../../core/services/funcion.service';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { PeliculaService } from '../../../../core/services/pelicula.service';
import { Pelicula } from '../../../../core/models/pelicula.model';
import { Funcion } from '../../../../core/models/funcion.model';

@Component({
  imports: [RouterLink],
  selector: 'app-detalle-pelicula',
  styleUrl: './detalle-pelicula.component.css',
  templateUrl: './detalle-pelicula.component.html',
})
export class DetallePelicula {
  pelicula?: Pelicula;
  funciones: Funcion[] = [];

  //Traigo el servicio que contiene las películas y
  //el servicio que contiene las funciones
  constructor(
    private route: ActivatedRoute,
    private peliculaService: PeliculaService,
    private funcionService: FuncionService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    //Obtengo el id de la película desde la URL por medio de ActivatedRoute
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      //Obtengo la película y sus funciones
      this.pelicula = this.peliculaService.obtenerPeliculaPorId(id);
      this.funciones = this.funcionService.obtenerFuncionesPorPelicula(id);
    }
  }

  seleccionarFuncion(funcion: Funcion) {
    this.router.navigate(['/compra', funcion.id]);
  }
}
