import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
      },
      {
        path: 'clients',
        loadComponent: () => import('./features/clients/clients').then(m => m.ClientsComponent),
      },
      {
        path: 'contracted-services',
        loadComponent: () => import('./features/contracted-services/contracted-services').then(m => m.ContractedServicesComponent),
      },
      {
        path: 'service-catalog',
        loadComponent: () => import('./features/service-catalog/service-catalog').then(m => m.ServiceCatalogComponent),
      },
      {
        path: 'contract-types',
        loadComponent: () => import('./features/contract-types/contract-types').then(m => m.ContractTypesComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
