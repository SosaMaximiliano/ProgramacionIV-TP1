import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FuncionService } from '../../servicios/funcion.service';
import { SalaService } from '../../servicios/sala.service';
import { ButacaService } from '../../servicios/butaca.service';
import { Funcion } from '../../core/models/funcion.model';
import { Butaca } from '../../core/models/butaca.model';
import { Sala } from '../../core/models/sala.model';
import { ButacaFuncionService } from '../../servicios/butaca-funcion.service';
import { PeliculaService } from '../../servicios/pelicula-service';
import { EntradaService } from './entrada.service';

@Component({
  imports: [],
  selector: 'app-compra',
  styleUrl: './compra.css',
  templateUrl: './compra.html',
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

  constructor(
    private route: ActivatedRoute,
    private funcionService: FuncionService,
    private salaService: SalaService,
    private butacaService: ButacaService,
    private butacaFuncionService: ButacaFuncionService,
    private peliculaService: PeliculaService,
    private entradaService: EntradaService,
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
    console.log('Funcion', this.funcionId);
    console.log('Butacas seleccionadas: ', this.butacasSeleccionadas);
    console.log(this.entradaService.crearEntrada(2, 15, 8, 5000, 25));
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
}
