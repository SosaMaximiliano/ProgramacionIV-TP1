import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full',
  },
  {
    path: 'inicio',
    loadComponent: () => import('./features/home/home.component').then((m) => m.Home),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.Login),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./features/auth/registro/registro.component').then((m) => m.Registro),
  },
  {
    path: 'peliculas',
    loadChildren: () =>
      import('./features/peliculas/peliculas.routes').then((m) => m.PELICULAS_ROUTES),
  },
  {
    path: 'compra',
    loadChildren: () => import('./features/compra/compra.routes').then((m) => m.compraRoutes),
  },
  {
    path: 'error',
    loadComponent: () => import('./features/error/error.component').then((m) => m.Error),
  },
  {
    path: 'mis-compras',
    loadComponent: () => import('./features/venta/venta.component').then((m) => m.Venta),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'error',
  },
];
