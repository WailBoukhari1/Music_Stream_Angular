import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'library',
    pathMatch: 'full'
  },
  {
    path: 'library',
    loadComponent: () => import('./components/music-library/music-library.component')
      .then(m => m.MusicLibraryComponent)
  }
];
