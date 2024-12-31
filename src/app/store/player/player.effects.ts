import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as PlayerActions from './player.actions';
import { AudioService } from '../../services/audio.service';
import { IndexedDBService } from '../../services/indexed-db.service';

@Injectable()
export class PlayerEffects {
  loadPersistedState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayerActions.loadPersistedState),
      switchMap(() => {
        const savedState = localStorage.getItem('playerState');
        if (savedState) {
          const { track, currentTime, volume } = JSON.parse(savedState);
          if (track) {
            return of(PlayerActions.setTrack({ track })).pipe(
              tap(() => {
                // After setting track, attempt to play it
                setTimeout(() => {
                  this.audioService.playTrack(track).then(() => {
                    if (currentTime) {
                      this.audioService.seek(currentTime);
                    }
                  });
                }, 0);
              })
            );
          }
        }
        return of(PlayerActions.setVolume({ volume: 1 }));
      }),
      catchError(() => of(PlayerActions.setVolume({ volume: 1 })))
    )
  );

  constructor(
    private actions$: Actions,
    private audioService: AudioService,
    private indexedDB: IndexedDBService
  ) {}
} 