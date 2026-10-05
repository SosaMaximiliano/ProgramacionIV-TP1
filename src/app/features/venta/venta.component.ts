import { Component, OnInit, signal } from '@angular/core';
import { VentaService } from '../../core/services/venta.service';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  imports: [CurrencyPipe, DatePipe],
  selector: 'app-venta',
  styleUrl: './venta.component.css',
  templateUrl: './venta.component.html',
})
export class Venta implements OnInit {
  ventas = signal<any[]>([]);
  cargando = signal(true);
  error = signal('');

  constructor(private ventaService: VentaService) {}

  ngOnInit(): void {
    void this.cargarVentas();
  }

  private async cargarVentas(): Promise<void> {
    try {
      this.ventas.set(await this.ventaService.obtenerMisVentas());
    } catch {
      this.error.set('No pudimos cargar tus compras. Intentá nuevamente.');
    } finally {
      this.cargando.set(false);
    }
  }
}
