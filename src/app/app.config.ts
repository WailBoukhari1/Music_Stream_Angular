import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { musicLibraryReducer } from './store/music-library/music-library.reducer';
import { MusicLibraryEffects } from './store/music-library/music-library.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideStore({
      musicLibrary: musicLibraryReducer
    }),
    provideEffects([MusicLibraryEffects]),
    provideAnimations()
  ]
};
