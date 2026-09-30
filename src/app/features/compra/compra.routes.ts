import { Routes } from '@angular/router';
import { Compra } from './compra.component';

export const compraRoutes: Routes = [
  {
    path: ':funcionId',
    component: Compra,
  },
];
