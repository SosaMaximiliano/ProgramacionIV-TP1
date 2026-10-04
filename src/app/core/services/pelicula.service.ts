import { Injectable } from '@angular/core';
import { Pelicula } from '../models/pelicula.model';
import { getSupabaseClient } from './supabase.client';

@Injectable({ providedIn: 'root' })
export class PeliculaService {
  async obtenerPeliculas(): Promise<Pelicula[]> {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.from('peliculas').select('*').order('id');
    if (error) throw error;
    return (data ?? []).map((fila) => this.convertirPelicula(fila));
  }

  async obtenerPeliculaPorId(id: number): Promise<Pelicula | undefined> {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.from('peliculas').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? this.convertirPelicula(data) : undefined;
  }

  async obtenerNombrePeliculaPorId(id: number): Promise<string | undefined> {
    const pelicula = await this.obtenerPeliculaPorId(id);
    return pelicula?.nombre;
  }

  private convertirPelicula(fila: any): Pelicula {
    return {
      id: fila.id,
      nombre: fila.nombre,
      imagen: fila.imagen,
      sinopsis: fila.sinopsis,
      duracion: fila.duracion,
      genero: fila.genero,
      clasificacionEdad: fila.clasificacion_edad,
      fechaEstreno: fila.fecha_estreno ?? '',
      estaDisponible: fila.esta_disponible,
    };
  }
}
