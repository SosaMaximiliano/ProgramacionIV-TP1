import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DatosRegistro } from '../../../core/models/usuario.model';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-registro',
  styleUrl: './registro.component.css',
  templateUrl: './registro.component.html',
})
export class Registro {
  perfil = {
    email: '',
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    tipoSangre: '',
    colorOjos: '',
    diasVacaciones: 0,
  };
  password = '';
  repetirPassword = '';
  mensaje = '';
  registroCompletado = false;
  procesando = false;

  constructor(private authService: AuthService) {}

  async registrarse(): Promise<void> {
    this.mensaje = '';

    if (this.password !== this.repetirPassword) {
      this.mensaje = 'Las contraseñas no coinciden.';
      return;
    }

    this.procesando = true;
    let temporizador: ReturnType<typeof setTimeout> | undefined;

    try {
      const datos: DatosRegistro = { ...this.perfil, password: this.password };
      const sesionIniciada = await Promise.race([
        this.authService.registrarse(datos),
        new Promise<never>((_, reject) => {
          temporizador = setTimeout(
            () => reject(new Error('La solicitud tardó demasiado. Revisá Supabase antes de volver a intentar.')),
            20000,
          );
        }),
      ]);
      this.registroCompletado = true;

      if (sesionIniciada) {
        this.mensaje = 'Tu cuenta está lista. Ya tenés un 20 % de descuento en tu primera compra.';
      } else {
        this.mensaje = 'Te enviamos un correo para confirmar la cuenta. Después podrás iniciar sesión.';
      }
    } catch (error) {
      const detalle = error instanceof Error ? error.message : 'Error desconocido';
      this.mensaje = `No se pudo completar el registro. ${detalle}`;
    } finally {
      if (temporizador) clearTimeout(temporizador);
      this.procesando = false;
    }
  }
}
