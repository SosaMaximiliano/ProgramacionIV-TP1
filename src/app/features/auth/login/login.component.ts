import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.component.css',
  templateUrl: './login.component.html',
})
export class Login {
  email = '';
  password = '';
  mensaje = '';
  procesando = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async iniciarSesion(): Promise<void> {
    this.mensaje = '';
    this.procesando = true;

    try {
      await this.authService.iniciarSesion(this.email, this.password);
      await this.router.navigateByUrl('/inicio');
    } catch {
      this.mensaje = 'No se pudo iniciar sesión. Revisá el correo y la contraseña.';
    } finally {
      this.procesando = false;
    }
  }
}
