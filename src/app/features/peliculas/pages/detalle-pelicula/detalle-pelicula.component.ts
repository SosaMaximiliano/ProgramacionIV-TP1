import { FuncionService } from '../../../../core/services/funcion.service';
import { Component, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { PeliculaService } from '../../../../core/services/pelicula.service';
import { Pelicula } from '../../../../core/models/pelicula.model';
import { Funcion } from '../../../../core/models/funcion.model';
import { Resena } from '../../../../core/models/resena.model';
import { DecimalPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  imports: [RouterLink, DecimalPipe, ReactiveFormsModule],
  selector: 'app-detalle-pelicula',
  styleUrl: './detalle-pelicula.component.css',
  templateUrl: './detalle-pelicula.component.html',
})
export class DetallePelicula {
  pelicula = signal<Pelicula | undefined>(undefined);
  funciones = signal<Funcion[]>([]);
  resenas = signal<Resena[]>([]);
  errorResenas = signal('');
  promedioResenas = computed(() => {
    const lista = this.resenas();
    if (lista.length === 0) return 0;
    const suma = lista.reduce((total, resena) => total + resena.puntuacion, 0);
    return suma / lista.length;
  });
  cargando = signal(true);
  errorCarga = signal('');

  formResena = new FormGroup({
    puntuacion: new FormControl(5, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(5)],
    }),
    comentario: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
  });

  guardandoResena = signal(false);
  mensajeResena = signal('');

  //Traigo el servicio que contiene las películas y
  //el servicio que contiene las funciones
  constructor(
    private route: ActivatedRoute,
    private peliculaService: PeliculaService,
    private funcionService: FuncionService,
    private router: Router,
    public authService: AuthService,
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
    }

    try {
      const resenas = await this.peliculaService.obtenerResenasPorPelicula(id);
      this.resenas.set(resenas);
    } catch {
      this.errorResenas.set('No pudimos cargar las reseñas.');
    } finally {
      this.cargando.set(false);
    }
  }

  seleccionarFuncion(funcion: Funcion) {
    this.router.navigate(['/compra', funcion.id]);
  }

  async guardarResena(): Promise<void> {
    const usuario = this.authService.usuarioActual();
    const peliculaId = Number(this.route.snapshot.paramMap.get('id'));

    if (!usuario || !peliculaId || this.formResena.invalid) {
      return;
    }

    this.guardandoResena.set(true);
    this.mensajeResena.set('');

    try {
      const { puntuacion, comentario } = this.formResena.getRawValue();

      await this.peliculaService.guardarResena(peliculaId, usuario.id, puntuacion, comentario);

      const resenasActualizadas = await this.peliculaService.obtenerResenasPorPelicula(peliculaId);

      this.resenas.set(resenasActualizadas);
      this.mensajeResena.set('Tu reseña se guardó correctamente.');
    } catch {
      this.mensajeResena.set('No pudimos guardar la reseña. Intentá nuevamente.');
    } finally {
      this.guardandoResena.set(false);
    }
  }
}
