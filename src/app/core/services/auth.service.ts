import { Injectable, signal } from '@angular/core';
import type { User } from '@supabase/supabase-js';
import { DatosRegistro, Usuario } from '../models/usuario.model';
import { getSupabaseClient, isSupabaseConfigured } from './supabase.client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly usuarioActual = signal<User | null>(null);

  constructor() {
    if (!isSupabaseConfigured()) return;

    void getSupabaseClient().then((supabase) => {
      void supabase.auth.getSession().then(({ data }) => {
        this.usuarioActual.set(data.session?.user ?? null);
      });

      supabase.auth.onAuthStateChange((_evento, sesion) => {
        this.usuarioActual.set(sesion?.user ?? null);
      });
    });
  }

  async registrarse(datos: DatosRegistro): Promise<boolean> {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: datos.email,
      password: datos.password,
      options: {
        data: {
          nombre: datos.nombre,
          apellido: datos.apellido,
          fecha_nacimiento: datos.fechaNacimiento,
          tipo_sangre: datos.tipoSangre,
          color_ojos: datos.colorOjos,
          dias_vacaciones: datos.diasVacaciones,
        },
      },
    });

    if (error) throw error;

    this.usuarioActual.set(data.session?.user ?? null);
    return data.session !== null;
  }

  async iniciarSesion(email: string, password: string): Promise<void> {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw error;

    this.usuarioActual.set(data.user);
  }

  async cerrarSesion(): Promise<void> {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.signOut({ scope: 'local' });

    if (error) throw error;

    this.usuarioActual.set(null);
  }

  async obtenerPerfil(id: string): Promise<Usuario> {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .select(
        'id, email, nombre, apellido, fecha_nacimiento, tipo_sangre, color_ojos, dias_vacaciones',
      )
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      email: data.email,
      nombre: data.nombre,
      apellido: data.apellido,
      fechaNacimiento: data.fecha_nacimiento,
      tipoSangre: data.tipo_sangre,
      colorOjos: data.color_ojos,
      diasVacaciones: data.dias_vacaciones,
    };
  }

  async obtenerFechaNacimientoActual(): Promise<string | null> {
    const supabase = await getSupabaseClient();

    const {
      data: { user },
      error: errorUsuario,
    } = await supabase.auth.getUser();

    if (errorUsuario) throw errorUsuario;
    if (!user) return null;

    const { data: perfil, error } = await supabase
      .from('profiles')
      .select('fecha_nacimiento')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;

    return perfil?.fecha_nacimiento ?? null;
  }
}
