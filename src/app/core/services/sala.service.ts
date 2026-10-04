import { Injectable } from '@angular/core';
import { Sala } from '../models/sala.model';
import { getSupabaseClient } from './supabase.client';

@Injectable({ providedIn: 'root' })
export class SalaService {
  async obtenerSalas(): Promise<Sala[]> {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.from('salas').select('*').order('id');
    if (error) throw error;
    return (data ?? []).map((fila) => this.convertirSala(fila));
  }

  async obtenerSalaPorId(id: number): Promise<Sala | undefined> {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.from('salas').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? this.convertirSala(data) : undefined;
  }

  private convertirSala(fila: any): Sala {
    return { id: fila.id, nombre: fila.nombre, filas: fila.filas };
  }
}
