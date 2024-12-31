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
import { localStorageSync } from 'ngrx-store-localstorage';

const metaReducers = [
  localStorageSync({
    keys: ['player'],
    rehydrate: true
  })
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideStore(
      {
        tracks: trackReducer,
        player: playerReducer
      },
      { metaReducers }
    ),
    provideEffects([TrackEffects, PlayerEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideAnimations()
  ]
};
