import { FuncionService } from '../../../../core/services/funcion.service';
import { Component, signal } from '@angular/core';
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
  pelicula = signal<Pelicula | undefined>(undefined);
  funciones = signal<Funcion[]>([]);
  cargando = signal(true);
  errorCarga = signal('');

  //Traigo el servicio que contiene las películas y
  //el servicio que contiene las funciones
  constructor(
    private route: ActivatedRoute,
    private peliculaService: PeliculaService,
    private funcionService: FuncionService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    void this.cargarDatos();
  }

  private async cargarDatos(): Promise<void> {
    //Obtengo el id de la película desde la URL por medio de ActivatedRoute
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorCarga.set('La película solicitada no es válida.');
      this.cargando.set(false);
      return;
    }

    try {
      //Obtengo la película y sus funciones desde Supabase.
      const [pelicula, funciones] = await Promise.all([
        this.peliculaService.obtenerPeliculaPorId(id),
        this.funcionService.obtenerFuncionesPorPelicula(id),
      ]);
      this.pelicula.set(pelicula);
      this.funciones.set(funciones);
      if (!pelicula) this.errorCarga.set('No encontramos esa película.');
    } catch {
      this.errorCarga.set('No pudimos cargar los datos. Revisá la conexión con Supabase.');
    } finally {
      this.cargando.set(false);
    }
  }

  seleccionarFuncion(funcion: Funcion) {
    this.router.navigate(['/compra', funcion.id]);
  }
}
