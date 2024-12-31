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
    path: 'upload',
    loadComponent: () => import('./components/upload-track/upload-track.component')
      .then(m => m.UploadTrackComponent)
  },
  {
    path: 'player/:id',
    loadComponent: () => import('./components/audio-player/audio-player.component')
      .then(m => m.AudioPlayerComponent)
  }
];
