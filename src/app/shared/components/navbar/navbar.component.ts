import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  imports: [RouterLink],
  selector: 'app-navbar',
  styleUrl: './navbar.component.css',
  templateUrl: './navbar.component.html',
})
export class Navbar {
  mensaje = '';

  constructor(
    public authService: AuthService,
    private router: Router,
  ) {}

  async cerrarSesion(): Promise<void> {
    this.mensaje = '';

    try {
      await this.authService.cerrarSesion();
      await this.router.navigateByUrl('/inicio');
    } catch {
      this.mensaje = 'No se pudo cerrar la sesión.';
    }
  }
}
