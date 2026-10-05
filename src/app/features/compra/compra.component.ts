import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FuncionService } from '../../core/services/funcion.service';
import { SalaService } from '../../core/services/sala.service';
import { ButacaService } from '../../core/services/butaca.service';
import { Funcion } from '../../core/models/funcion.model';
import { Butaca, FilaButacas } from '../../core/models/butaca.model';
import { Sala } from '../../core/models/sala.model';
import { ButacaFuncionService } from '../../core/services/butaca-funcion.service';
import { PeliculaService } from '../../core/services/pelicula.service';
import { EntradaService } from './entrada.service';
import { Entrada } from '../../core/models/entrada.model';
import { CurrencyPipe } from '@angular/common';
import { Venta, FormaPago } from '../../core/models/venta.model';
import { VentaService } from '../../core/services/venta.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { edadMinimaValidator } from '../../core/validators/edad-minima';

@Component({
  imports: [CurrencyPipe, ReactiveFormsModule],
  selector: 'app-compra',
  styleUrl: './compra.component.css',
  templateUrl: './compra.component.html',
})
export class Compra {
  funcionId!: number;
  funcion?: Funcion;
  filasButacas = signal<FilaButacas[]>([]);
  sala?: Sala;
  butacasOcupadas = signal<number[]>([]);
  butacasSeleccionadas = signal<Butaca[]>([]);
  pagoProcesando = signal(false);
  errorPago = signal('');
  peliculaId!: number;
  nombrePelicula: string | undefined = '';
  errorCarga = '';
  descuentoBienvenida = signal(0);
  detalle: any = null;
  entradas: Entrada[] = [];
  ventaCreada: Venta | null = null;
  edadMinima = signal(0);
  fechaNacimientoPerfil = signal<string | null>(null);
  formularioEdad = new FormGroup({
    fechaNacimiento: new FormControl('', { nonNullable: true }),
  });

  constructor(
    private route: ActivatedRoute,
    private funcionService: FuncionService,
    private salaService: SalaService,
    private butacaService: ButacaService,
    private butacaFuncionService: ButacaFuncionService,
    private peliculaService: PeliculaService,
    private entradaService: EntradaService,
    private ventaService: VentaService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    void this.cargarDatos();
  }

  private async cargarDatos(): Promise<void> {
    //Obtengo el id de la función desde URL
    this.funcionId = Number(this.route.snapshot.paramMap.get('funcionId'));

    try {
      this.funcion = await this.funcionService.obtenerFuncionPorId(this.funcionId);
      if (!this.funcion) {
        this.errorCarga = 'No encontramos esa función.';
        return;
      }

      //Obtengo el id de la película.
      this.peliculaId = this.funcion.peliculaId;

      //Obtengo la sala a partir de la función.
      this.sala = await this.salaService.obtenerSalaPorId(this.funcion.salaId);
      if (!this.sala) {
        this.errorCarga = 'No encontramos la sala de esta función.';
        return;
      }

      //Las butacas se generan con la distribución configurada para la sala.
      this.filasButacas.set(this.butacaService.obtenerButacasDeSala(this.sala));

      //Por ahora la ocupación todavía se conserva localmente.
      this.butacasOcupadas.set(
        await this.butacaFuncionService.obtenerButacasOcupadas(this.funcionId, this.filasButacas()),
      );

      const pelicula = await this.peliculaService.obtenerPeliculaPorId(this.peliculaId);
      this.nombrePelicula = pelicula?.nombre;
      this.edadMinima.set(pelicula?.clasificacionEdad ?? 0);

      if (this.edadMinima() > 0) {
        const control = this.formularioEdad.controls.fechaNacimiento;

        control.setValidators([Validators.required, edadMinimaValidator(this.edadMinima())]);
        control.updateValueAndValidity();

        try {
          const fechaPerfil = await this.authService.obtenerFechaNacimientoActual();
          this.fechaNacimientoPerfil.set(fechaPerfil);

          if (fechaPerfil) {
            control.setValue(fechaPerfil);
          }
        } catch {
          this.fechaNacimientoPerfil.set(null);
        }
      }

      try {
        this.descuentoBienvenida.set(
          await this.ventaService.obtenerDescuentoBienvenidaDisponible(),
        );
      } catch {
        this.descuentoBienvenida.set(0);
      }
    } catch {
      this.errorCarga = 'No pudimos cargar la función. Revisá la conexión con Supabase.';
    }
  }

  estaOcupada(butacaId: number): boolean {
    return this.butacasOcupadas().includes(butacaId);
  }

  seleccionarButaca(butaca: Butaca) {
    if (this.ventaCreada || this.estaOcupada(butaca.id)) return;

    this.butacasSeleccionadas.update((s) => {
      const yaSeleccionada = s.some((b) => b.id === butaca.id);
      return yaSeleccionada ? s.filter((b) => b.id !== butaca.id) : [...s, butaca];
    });
  }

  estaSeleccionada(butacaId: number): boolean {
    return this.butacasSeleccionadas().some((b) => b.id === butacaId);
  }

  continuarCompra() {
    if (this.edadMinima() > 0 && this.formularioEdad.invalid) {
      this.formularioEdad.markAllAsTouched();
      return;
    }

    if (this.ventaCreada || !this.funcion || this.butacasSeleccionadas().length === 0) {
      return;
    }

    const clienteId = 2;
    const precioBase = this.funcion?.precioEntrada;
    this.entradas = this.butacasSeleccionadas().map((b) => {
      const precioButaca = b.tipo === 'vip' ? precioBase * 1.5 : precioBase;
      return this.entradaService.crearEntrada(
        this.nombrePelicula || 'Película',
        b.fila,
        b.numero,
        clienteId,
        precioButaca,
        0,
      );
    });

    this.ventaCreada = this.ventaService.crearVenta(
      clienteId,
      this.entradas,
      FormaPago.Efectivo,
      this.descuentoBienvenida(),
    );

    this.entradas.forEach((e) => {
      e.ventaId = this.ventaCreada!.id;
    });
  }

  get totalCompra(): number {
    return this.entradas.reduce((total, entrada) => total + entrada.precio, 0);
  }

  detalleCompra() {
    this.detalle = {
      pelicula: this.nombrePelicula,
      fecha: this.funcion?.fecha,
      hora: this.funcion?.hora,
      butacas: this.butacasSeleccionadas()
        .map((b) => `${b.fila}${b.numero}`)
        .join(', '),
    };

    const detalleJSON = JSON.stringify(this.detalle, null, 2);
    console.log(detalleJSON);
    return this.detalle;
  }

  cancelarCompra(): void {
    if (!this.ventaCreada || this.ventaCreada.estaPagado || this.pagoProcesando()) return;

    this.ventaService.cancelarVenta(this.ventaCreada.id);
    this.entradaService.cancelarEntradas(this.entradas.map((entrada) => entrada.id));

    this.ventaCreada = null;
    this.entradas = [];
    this.butacasSeleccionadas.set([]);
  }

  async confirmarPago(): Promise<void> {
    if (
      !this.ventaCreada ||
      this.ventaCreada.estaPagado ||
      this.ventaCreada.estaCancelada ||
      this.pagoProcesando()
    ) {
      return;
    }

    if (this.edadMinima() > 0 && this.formularioEdad.invalid) {
      this.formularioEdad.markAllAsTouched();
      return;
    }

    this.pagoProcesando.set(true);
    this.errorPago.set('');

    try {
      await this.ventaService.confirmarEnSupabase(
        this.ventaCreada,
        this.funcionId,
        this.butacasSeleccionadas(),
      );
      this.entradas = [...this.ventaCreada.entradas];
      this.butacasOcupadas.update((ocupadas) => [
        ...ocupadas,
        ...this.butacasSeleccionadas().map((butaca) => butaca.id),
      ]);
    } catch {
      this.errorPago.set(
        'No pudimos confirmar la compra. Puede que alguna butaca ya se haya ocupado; actualizá el mapa e intentá de nuevo.',
      );
    } finally {
      this.pagoProcesando.set(false);
    }
  }
}
