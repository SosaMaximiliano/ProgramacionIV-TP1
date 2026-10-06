import { Service } from '@angular/core';
import { Funcion } from '../models/funcion.model';
import { getSupabaseClient } from './supabase.client';

@Service()
export class FuncionService {
  async obtenerFunciones(): Promise<Funcion[]> {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.from('funciones').select('*').order('id');
    if (error) throw error;
    return (data ?? []).map((fila) => this.convertirFuncion(fila));
  }

  async obtenerFuncionPorId(id: number): Promise<Funcion | undefined> {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.from('funciones').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? this.convertirFuncion(data) : undefined;
  }

  async obtenerFuncionesPorPelicula(peliculaId: number): Promise<Funcion[]> {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.from('funciones').select('*').eq('pelicula_id', peliculaId).order('fecha').order('hora');
    if (error) throw error;
    return (data ?? []).map((fila) => this.convertirFuncion(fila));
  }

  private convertirFuncion(fila: any): Funcion {
    return {
      id: fila.id,
      peliculaId: fila.pelicula_id,
      salaId: fila.sala_id,
      fecha: fila.fecha,
      hora: fila.hora,
      precioEntrada: Number(fila.precio_entrada),
    };
  }
}
