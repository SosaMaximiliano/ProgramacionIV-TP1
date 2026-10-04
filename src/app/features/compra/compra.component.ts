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
import { Entrada, EstadoEntrada } from '../../core/models/entrada.model';
import { CurrencyPipe } from '@angular/common';
import { Venta, FormaPago } from '../../core/models/venta.model';
import { VentaService } from '../../core/services/venta.service';

@Component({
  imports: [CurrencyPipe],
  selector: 'app-compra',
  styleUrl: './compra.component.css',
  templateUrl: './compra.component.html',
})
export class Compra {
  funcionId!: number;
  funcion?: Funcion;
  filasButacas: FilaButacas[] = [];
  sala?: Sala;
  butacasOcupadas = signal<number[]>([]);
  butacasSeleccionadas = signal<Butaca[]>([]);
  peliculaId!: number;
  nombrePelicula: string | undefined = '';
  errorCarga = '';
  detalle: any = null;
  entradas: Entrada[] = [];
  ventaCreada: Venta | null = null;

  constructor(
    private route: ActivatedRoute,
    private funcionService: FuncionService,
    private salaService: SalaService,
    private butacaService: ButacaService,
    private butacaFuncionService: ButacaFuncionService,
    private peliculaService: PeliculaService,
    private entradaService: EntradaService,
    private ventaService: VentaService,
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
      this.filasButacas = this.butacaService.obtenerButacasDeSala(this.sala);

      //Por ahora la ocupación todavía se conserva localmente.
      this.butacasOcupadas.set(this.butacaFuncionService.obtenerButacasOcupadas(this.funcionId));

      this.nombrePelicula = await this.peliculaService.obtenerNombrePeliculaPorId(this.peliculaId);
    } catch {
      this.errorCarga = 'No pudimos cargar la función. Revisá la conexión con Supabase.';
    }
  }

  estaOcupada(butacaId: number): boolean {
    return this.butacasOcupadas().includes(butacaId);
  }

  seleccionarButaca(butaca: Butaca) {
    if (this.estaOcupada(butaca.id)) return;

    this.butacasSeleccionadas.update((s) => {
      const yaSeleccionada = s.some((b) => b.id === butaca.id);
      return yaSeleccionada ? s.filter((b) => b.id !== butaca.id) : [...s, butaca];
    });
  }

  estaSeleccionada(butacaId: number): boolean {
    return this.butacasSeleccionadas().some((b) => b.id === butacaId);
  }

  continuarCompra() {
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

    this.ventaCreada = this.ventaService.crearVenta(clienteId, this.entradas, FormaPago.Efectivo);

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

  confirmarPago(): void {
    if (!this.ventaCreada || this.ventaCreada.estaPagado) {
      return;
    }

    this.ventaCreada.estaPagado = true;

    this.entradas.forEach((e) => {
      e.estadoEntrada = EstadoEntrada.Emitida;
    });

    this.butacaFuncionService.ocuparButacas(
      this.funcionId,
      this.butacasSeleccionadas().map((b) => b.id),
    );

    this.butacasOcupadas.set(this.butacaFuncionService.obtenerButacasOcupadas(this.funcionId));
  }
}
