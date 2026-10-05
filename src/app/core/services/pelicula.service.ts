import { Injectable } from '@angular/core';
import { Pelicula } from '../models/pelicula.model';
import { getSupabaseClient } from './supabase.client';
import { Resena } from '../models/resena.model';

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

  async obtenerResenasPorPelicula(peliculaId: number): Promise<Resena[]> {
    const supabase = await getSupabaseClient();

    const { data, error } = await supabase
      .from('resenas')
      .select('id, usuario_id, puntuacion, comentario, fecha_creacion')
      .eq('pelicula_id', peliculaId)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((fila) => ({
      id: fila.id,
      usuarioId: fila.usuario_id,
      puntuacion: fila.puntuacion,
      comentario: fila.comentario,
      fechaCreacion: fila.fecha_creacion,
    }));
  }

  async guardarResena(
    peliculaId: number,
    usuarioId: string,
    puntuacion: number,
    comentario: string,
  ): Promise<void> {
    const supabase = await getSupabaseClient();

    const { error } = await supabase.from('resenas').upsert(
      {
        pelicula_id: peliculaId,
        usuario_id: usuarioId,
        puntuacion,
        comentario: comentario.trim() || null,
      },
      { onConflict: 'pelicula_id,usuario_id' },
    );

    if (error) throw error;
  }
}
