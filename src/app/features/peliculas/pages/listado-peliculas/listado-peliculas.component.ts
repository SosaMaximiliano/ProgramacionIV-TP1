import { Component, OnInit, computed, signal } from '@angular/core';
import { Pelicula } from '../../../../core/models/pelicula.model';
import { PeliculaCard } from '../../components/pelicula-card/pelicula-card.component';
import { Router } from '@angular/router';
import { PeliculaService } from '../../../../core/services/pelicula.service';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [PeliculaCard, FormsModule],
  selector: 'app-listado-peliculas',
  styleUrl: './listado-peliculas.component.css',
  templateUrl: './listado-peliculas.component.html',
})
export class ListadoPeliculas implements OnInit {
  peliculas = signal<Pelicula[]>([]);
  busqueda = signal('');
  cargando = signal(true);
  errorCarga = signal('');
  peliculasFiltradas = computed(() => {
    const texto = this.busqueda().trim().toLocaleLowerCase();

    return this.peliculas().filter(
      (pelicula) =>
        pelicula.nombre.toLocaleLowerCase().includes(texto) ||
        pelicula.genero.toLocaleLowerCase().includes(texto),
    );
  });

  //Al iniciar la app obtengo las peliculas desde el servicio
  ngOnInit(): void {
    void this.cargarPeliculas();
  }

  private async cargarPeliculas(): Promise<void> {
    try {
      this.peliculas.set(await this.peliculaService.obtenerPeliculas());
    } catch {
      this.errorCarga.set('No pudimos cargar la cartelera. Revisá la conexión con Supabase.');
    } finally {
      this.cargando.set(false);
    }
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

}
