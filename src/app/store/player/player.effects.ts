import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { from, fromEvent, of } from 'rxjs';
import { map, switchMap, catchError, withLatestFrom, tap } from 'rxjs/operators';
import * as PlayerActions from './player.actions';
import * as PlayerSelectors from './player.selectors';
import { AudioService } from '../../services/audio.service';
import { IndexedDBService } from '../../services/indexed-db.service';

@Injectable()
export class PlayerEffects {
  constructor(
    private actions$: Actions,
    private store: Store,
    private audioService: AudioService,
    private indexedDB: IndexedDBService
  ) {
    // Setup audio event listeners
    this.setupAudioEventListeners();
  }

  private setupAudioEventListeners() {
    // Handle track end
    fromEvent(this.audioService.audioElement, 'ended').subscribe(() => {
      this.store.dispatch(PlayerActions.stop());
      this.store.dispatch(PlayerActions.playNext());
    });

    // Handle play state
    fromEvent(this.audioService.audioElement, 'play').subscribe(() => {
      this.store.dispatch(PlayerActions.playSuccess());
    });

    // Handle pause state
    fromEvent(this.audioService.audioElement, 'pause').subscribe(() => {
      this.store.dispatch(PlayerActions.pause());
    });

    // Handle time updates
    fromEvent(this.audioService.audioElement, 'timeupdate').subscribe(() => {
      this.store.dispatch(PlayerActions.setCurrentTime({ 
        time: this.audioService.audioElement.currentTime 
      }));
    });

    // Handle errors
    fromEvent(this.audioService.audioElement, 'error').subscribe((event: Event) => {
      const error = (event.target as HTMLAudioElement).error;
      this.store.dispatch(PlayerActions.setError({ 
        message: error?.message || 'Unknown playback error'
      }));
    });
  }

  // Load and play a track
  playTrack$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayerActions.setTrack),
      switchMap(({ track }) => {
        if (!track) {
          throw new Error('No track provided');
        }
        return from(this.audioService.playTrack(track)).pipe(
          map(() => PlayerActions.playSuccess()),
          catchError(error => of(PlayerActions.setError({ message: error.message })))
        );
      })
    )
  );

  // Handle play action
  play$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayerActions.play),
      switchMap(() =>
        from(this.audioService.play()).pipe(
          map(() => PlayerActions.playSuccess()),
          catchError(error => of(PlayerActions.setError({ message: error.message })))
        )
      )
    )
  );

  // Handle pause action
  pause$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayerActions.pause),
      tap(() => this.audioService.pause())
    ),
    { dispatch: false }
  );

  // Handle volume changes
  setVolume$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayerActions.setVolume),
      tap(({ volume }) => {
        this.audioService.setVolume(Math.max(0, Math.min(1, volume))); // Ensure volume is between 0 and 1
      })
    ),
    { dispatch: false }
  );

  // Handle seeking
  seek$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayerActions.seek),
      tap(({ time }) => this.audioService.seek(time))
    ),
    { dispatch: false }
  );

  // Handle playing next track
  playNext$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayerActions.playNext),
      withLatestFrom(
        this.store.select(PlayerSelectors.selectCurrentTrack),
        from(this.indexedDB.getAllTracks())
      ),
      map(([_, currentTrack, tracks]) => {
        if (!tracks.length) return PlayerActions.setError({ message: 'No tracks available' });
        
        const currentIndex = currentTrack 
          ? tracks.findIndex(t => t.id === currentTrack.id)
          : -1;
        const nextTrack = tracks[(currentIndex + 1) % tracks.length];
        
        return PlayerActions.setTrack({ track: nextTrack });
      })
    )
  );

  // Handle playing previous track
  playPrevious$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayerActions.playPrevious),
      withLatestFrom(
        this.store.select(PlayerSelectors.selectCurrentTrack),
        from(this.indexedDB.getAllTracks())
      ),
      map(([_, currentTrack, tracks]) => {
        if (!tracks.length) return PlayerActions.setError({ message: 'No tracks available' });
        
        const currentIndex = currentTrack 
          ? tracks.findIndex(t => t.id === currentTrack.id)
          : 0;
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tracks.length - 1;
        
        return PlayerActions.setTrack({ track: tracks[prevIndex] });
      })
    )
  );

  // Handle state persistence
  persistState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        PlayerActions.playSuccess,
        PlayerActions.pause,
        PlayerActions.setCurrentTime,
        PlayerActions.setVolume,
        PlayerActions.setTrack
      ),
      withLatestFrom(
        this.store.select(PlayerSelectors.selectCurrentTrack),
        this.store.select(PlayerSelectors.selectCurrentTime),
        this.store.select(PlayerSelectors.selectVolume),
        this.store.select(PlayerSelectors.selectIsPlaying)
      ),
      tap(([_, track, currentTime, volume, isPlaying]) => {
        if (track) {
          localStorage.setItem('playerState', JSON.stringify({
            track,
            currentTime,
            volume,
            isPlaying,
            timestamp: Date.now()
          }));
        }
      })
    ),
    { dispatch: false }
  );

  // Load persisted state
  loadPersistedState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayerActions.loadPersistedState),
      map(() => {
        const savedState = localStorage.getItem('playerState');
        if (savedState) {
          const { track, currentTime, volume } = JSON.parse(savedState);
          if (track) {
            return PlayerActions.setTrack({ track });
          }
        }
        return PlayerActions.setVolume({ volume: 1 });
      }),
      catchError(() => of(PlayerActions.setVolume({ volume: 1 })))
    )
  );
} 