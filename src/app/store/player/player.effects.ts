import { Injectable, OnDestroy } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as PlayerActions from './player.actions';
import { AudioService } from '../../services/audio.service';
import { IndexedDBService } from '../../services/indexed-db.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable()
export class PlayerEffects implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private actions$: Actions,
    private audioService: AudioService,
    private indexedDB: IndexedDBService
  ) {
    // Add takeUntil to any manual subscriptions
    this.actions$.pipe(
      takeUntil(this.destroy$),
      ofType(PlayerActions.setError)
    ).subscribe(action => {
      console.error('Player error:', action.message);
    });
  }

  loadPersistedState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayerActions.loadPersistedState),
      takeUntil(this.destroy$),
      switchMap(() => {
        const savedState = localStorage.getItem('playerState');
        if (savedState) {
          const { track, currentTime, volume } = JSON.parse(savedState);
          if (track) {
            return of(PlayerActions.setTrack({ track })).pipe(
              tap(() => {
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
} 