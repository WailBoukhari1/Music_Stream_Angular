import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { trackReducer } from './store/track/track.reducer';
import { playerReducer } from './store/player/player.reducer';
import { TrackEffects } from './store/track/track.effects';
import { PlayerEffects } from './store/player/player.effects';
import { ErrorEffects } from './store/error.effects';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideStore({
      tracks: trackReducer,
      player: playerReducer
    }),
    provideEffects([TrackEffects, PlayerEffects, ErrorEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideAnimations(),
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        hasBackdrop: true,
        disableClose: false,
        width: '500px'
      }
    }
  ]
};
