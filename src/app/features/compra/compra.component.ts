import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FuncionService } from '../../core/services/funcion.service';
import { SalaService } from '../../core/services/sala.service';
import { ButacaService } from '../../core/services/butaca.service';
import { Funcion } from '../../core/models/funcion.model';
import { Butaca } from '../../core/models/butaca.model';
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
  butacas: Butaca[] = [];
  sala?: Sala;
  butacasOcupadas: number[] = [];
  butacasSeleccionadas: Butaca[] = [];
  peliculaId!: number;
  nombrePelicula: string | undefined = '';
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
    //Obtengo el id de la función desde URL
    this.funcionId = Number(this.route.snapshot.paramMap.get('funcionId'));

    //Obtengo todas las funciones y filtro por id
    this.funcion = this.funcionService.obtenerFunciones().find((f) => f.id === this.funcionId);
    if (!this.funcion) return;

    //Obtengo el id de la película.
    this.peliculaId = this.funcion.peliculaId;

    //Obtengo la sala a partir de la función
    this.sala = this.salaService.obtenerSalaPorId(this.funcion.salaId);
    if (!this.sala) return;

    //Obtengo las butacas de la sala
    this.butacas = this.butacaService.obtenerButacasDeSala(this.sala);

    //Obtengo las butacas ocupadas
    this.butacasOcupadas = this.butacaFuncionService.obtenerButacasOcupadas(this.funcionId);

    //Obtengo el nombre de la película
    this.nombrePelicula = this.peliculaService.obtenerNombrePeliculaPorId(this.peliculaId);
  }

  estaOcupada(butacaId: number): boolean {
    return this.butacasOcupadas.includes(butacaId);
  }

  seleccionarButaca(butaca: Butaca) {
    if (this.estaOcupada(butaca.id)) return;

    const indice = this.butacasSeleccionadas.findIndex((b) => b.id === butaca.id);

    if (indice >= 0) {
      this.butacasSeleccionadas.splice(indice, 1);
    } else {
      this.butacasSeleccionadas.push(butaca);
    }
  }

  estaSeleccionada(butacaId: number): boolean {
    return this.butacasSeleccionadas.some((b) => b.id === butacaId);
  }

  continuarCompra() {
    if (this.ventaCreada || !this.funcion || this.butacasSeleccionadas.length === 0) {
      return;
    }

    const clienteId = 2;
    const precio = this.funcion?.precioEntrada;
    this.entradas = this.butacasSeleccionadas.map((b) =>
      this.entradaService.crearEntrada(
        this.nombrePelicula || 'Película',
        b.fila,
        b.numero,
        clienteId,
        precio,
        0,
      ),
    );

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
      butacas: this.butacasSeleccionadas.map((b) => `${b.fila}${b.numero}`).join(', '),
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
      this.butacasSeleccionadas.map((b) => b.id),
    );

    this.butacasOcupadas = this.butacaFuncionService.obtenerButacasOcupadas(this.funcionId);
  }
}
