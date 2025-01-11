import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, mergeMap, catchError, withLatestFrom } from 'rxjs/operators';
import * as PlayerActions from './player.actions';
import { AudioService } from '../../services/audio.service';
import { selectCurrentTrack, selectQueue } from './player.selectors';
import { Track } from '../../models/track.model';

@Injectable()
export class PlayerEffects {
  loadTrack$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayerActions.loadTrack),
      mergeMap(({ track }) =>
        this.audioService.loadTrack(track)
          .then(() => PlayerActions.loadTrackSuccess({ audioUrl: '' }))
          .catch(error => PlayerActions.loadTrackFailure({ error: error.message }))
      )
    )
  );

  playNext$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayerActions.playNext),
      withLatestFrom(
        this.store.select(selectCurrentTrack),
        this.store.select(selectQueue)
      ),
      map(([_, currentTrack, queue]: [any, Track | null, Track[]]) => {
        if (!currentTrack || queue.length === 0) {
          return PlayerActions.stop();
        }
        
        const currentIndex = queue.findIndex((track: Track) => track.id === currentTrack.id);
        const nextTrack = queue[currentIndex + 1];
        
        return nextTrack 
          ? PlayerActions.loadTrack({ track: nextTrack })
          : PlayerActions.stop();
      })
    )
  );

  playPrevious$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayerActions.playPrevious),
      withLatestFrom(
        this.store.select(selectCurrentTrack),
        this.store.select(selectQueue)
      ),
      map(([_, currentTrack, queue]) => {
        if (!currentTrack || queue.length === 0) {
          return PlayerActions.stop();
        }
        
        const currentIndex = queue.findIndex(track => track.id === currentTrack.id);
        const previousTrack = queue[currentIndex - 1];
        
        return previousTrack 
          ? PlayerActions.loadTrack({ track: previousTrack })
          : PlayerActions.stop();
      })
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store,
    private audioService: AudioService
  ) {}
} 