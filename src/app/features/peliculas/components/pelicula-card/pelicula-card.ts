import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Pelicula } from '../../../../core/models/pelicula.model';

@Component({
  imports: [],
  selector: 'app-pelicula-card',
  styleUrl: './pelicula-card.css',
  templateUrl: './pelicula-card.html',
})
export class PeliculaCard {
  //Recibo un objeto Pelicula a traves del HTML
  @Input() peliculaRecibida!: Pelicula;

  //Emito el evento que devuelve la película seleccionada
  @Output() peliculaSeleccionada = new EventEmitter<Pelicula>();

  emitirSeleccion() {
    this.peliculaSeleccionada.emit(this.peliculaRecibida);
  }
}
