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
  },
  {
    path: 'track/:id',
    loadComponent: () => import('./components/track-detail/track-detail.component')
      .then(m => m.TrackDetailComponent)
  },
  {
    path: 'player/:id',
    loadComponent: () => import('./components/audio-player/audio-player.component')
      .then(m => m.AudioPlayerComponent)
  },
  {
    path: '**',
    redirectTo: 'library'
  }
  // {
  //   path: 'category/:category',
  //   loadComponent: () => import('./components/category-view/category-view.component')
  //     .then(m => m.CategoryViewComponent)
  // }
];
