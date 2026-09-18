import { Routes } from '@angular/router';

export const PELICULAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/listado-peliculas/listado-peliculas').then((m) => m.ListadoPeliculas),
    pathMatch: 'full',
  },

  {
    path: ':id',
    loadComponent: () =>
      import('./pages/detalle-pelicula/detalle-pelicula').then((m) => m.DetallePelicula),
  },

  //   {
  //     path: ':id/funciones',
  //     loadComponent: () =>
  //       import('./pages/funciones-pelicula/funciones-pelicula').then((m) => m.FuncionesPelicula),
  //   },
];
