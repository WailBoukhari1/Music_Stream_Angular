import { Routes } from '@angular/router';
import { MusicLibraryComponent } from './components/music-library/music-library.component';
import { MusicPlayerComponent } from './components/music-player/music-player.component';

export const routes: Routes = [
  { path: '', redirectTo: 'library', pathMatch: 'full' },

  { path: 'library', component: MusicLibraryComponent },
  { path: 'player', component: MusicPlayerComponent },
  { path: '**', redirectTo: 'library' },
];
