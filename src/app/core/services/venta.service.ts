import { Service } from '@angular/core';
import { Butaca } from '../models/butaca.model';
import { EstadoEntrada } from '../models/entrada.model';
import { Venta, FormaPago } from '../models/venta.model';
import { Entrada } from '../models/entrada.model';
import { getSupabaseClient } from './supabase.client';

@Service()
export class VentaService {
  private ventas: Venta[] = [];

  async obtenerDescuentoBienvenidaDisponible(): Promise<number> {
    const supabase = await getSupabaseClient();
    const {
      data: { user },
      error: errorUsuario,
    } = await supabase.auth.getUser();

    if (errorUsuario) throw errorUsuario;
    if (!user) return 0;

    const { data: perfil, error } = await supabase
      .from('profiles')
      .select('descuento_bienvenida_porcentaje, descuento_bienvenida_usado')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    if (!perfil || perfil.descuento_bienvenida_usado) return 0;

    return Number(perfil.descuento_bienvenida_porcentaje);
  }

  crearVenta(
    clienteId: number,
    entradas: Entrada[],
    formaPago: FormaPago,
    descuentoPorcentaje = 0,
  ): Venta {
    const subtotal = entradas.reduce((total, entrada) => total + entrada.precio, 0);
    const descuentoImporte = Math.round(subtotal * descuentoPorcentaje) / 100;
    const venta: Venta = {
      id: this.ventas.length + 1,
      clienteId,
      fechaVenta: new Date().toISOString(),
      subtotal,
      descuentoPorcentaje,
      descuentoImporte,
      precioFinal: subtotal - descuentoImporte,
      formaPago,
      estaPagado: false,
      estaCancelada: false,
      entradas,
    };

    this.ventas.push(venta);
    return venta;
  }

  cancelarVenta(ventaId: number): void {
    const venta = this.ventas.find((item) => item.id === ventaId);

    if (!venta || venta.estaPagado) return;

    venta.estaCancelada = true;
  }

  async confirmarEnSupabase(venta: Venta, funcionId: number, butacas: Butaca[]): Promise<void> {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.rpc('confirmar_compra', {
      p_funcion_id: funcionId,
      p_forma_pago: venta.formaPago,
      p_butacas: butacas.map((butaca) => ({ fila: butaca.fila, asiento: butaca.numero })),
    });

    if (error) throw error;
    if (!data) throw new Error('Supabase no devolvió la venta confirmada.');

    const ventaGuardada = data as {
      venta_id: number;
      subtotal: number;
      descuento_porcentaje: number;
      descuento_importe: number;
      precio_final: number;
      entradas: { id: number; fila: string; asiento: number; precio: number }[];
    };

    venta.id = ventaGuardada.venta_id;
    venta.subtotal = Number(ventaGuardada.subtotal);
    venta.descuentoPorcentaje = Number(ventaGuardada.descuento_porcentaje);
    venta.descuentoImporte = Number(ventaGuardada.descuento_importe);
    venta.precioFinal = Number(ventaGuardada.precio_final);
    venta.estaPagado = true;
    venta.entradas = venta.entradas.map((entrada) => {
      const guardada = ventaGuardada.entradas.find(
        (item) => item.fila === entrada.fila && item.asiento === entrada.asiento,
      );

      return guardada
        ? {
            ...entrada,
            id: guardada.id,
            ventaId: ventaGuardada.venta_id,
            precio: Number(guardada.precio),
            estadoEntrada: EstadoEntrada.Emitida,
          }
        : entrada;
    });
  }

  async obtenerMisVentas() {
    const supabase = await getSupabaseClient();

    const { data, error } = await supabase
      .from('ventas')
      .select(
        `
      id,
      fecha_venta,
      subtotal,
      descuento_porcentaje,
      descuento_importe,
      precio_final,
      forma_pago,
      esta_pagado,
      esta_cancelada,
      entradas (
        id,
        fila,
        asiento,
        precio,
        estado_entrada,
        funciones (
          fecha,
          hora,
          peliculas (nombre)
        )
      )
    `,
      )
      .order('fecha_venta', { ascending: false });

    if (error) throw error;

    return data ?? [];
  }
}
