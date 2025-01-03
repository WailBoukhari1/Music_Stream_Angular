import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { GlobalErrorHandler } from './services/error-handler.service';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { routes } from './app.routes';

// Import your reducers and effects
import { trackReducer } from './store/track/track.reducer';
import { playerReducer } from './store/player/player.reducer';
import { TrackEffects } from './store/track/track.effects';
import { PlayerEffects } from './store/player/player.effects';
import { ErrorEffects } from './store/error.effects';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideAnimations(),
    provideHttpClient(withInterceptors([])),
    provideRouter(routes, withComponentInputBinding()),
    provideStore({
      tracks: trackReducer,
      player: playerReducer
    }),
    provideEffects([
      TrackEffects,
      PlayerEffects,
      ErrorEffects
    ]), provideAnimationsAsync()
  ]
};
