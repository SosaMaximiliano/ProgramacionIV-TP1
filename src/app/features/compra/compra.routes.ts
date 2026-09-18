import { Routes } from '@angular/router';
import { Compra } from './compra';

export const compraRoutes: Routes = [
  {
    path: ':funcionId',
    component: Compra,
  },
];
