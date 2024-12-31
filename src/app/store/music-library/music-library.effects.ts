import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import * as MusicLibraryActions from './music-library.actions';
import { MusicLibraryService } from '../../components/music-library/music-library.service';
import { AudioCoreService } from '../../core/services/audio-core.service';

@Injectable()
export class MusicLibraryEffects {
  loadTracks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MusicLibraryActions.loadTracks),
      mergeMap(() =>
        this.musicLibraryService.getTracks().pipe(
          map((tracks) => MusicLibraryActions.loadTracksSuccess({ tracks })),
          catchError((error) =>
            of(MusicLibraryActions.loadTracksFailure({ error: error.message }))
          )
        )
      )
    )
  );

  playTrack$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(MusicLibraryActions.playTrack),
        tap(({ track }) => {
          this.audioCoreService.loadAudio(track.url);
          this.audioCoreService.play();
        })
      ),
    { dispatch: false }
  );

  pauseTrack$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(MusicLibraryActions.pauseTrack),
        tap(() => {
          this.audioCoreService.pause();
        })
      ),
    { dispatch: false }
  );

  stopTrack$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(MusicLibraryActions.stopTrack),
        tap(() => {
          this.audioCoreService.stop();
        })
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private musicLibraryService: MusicLibraryService,
    private audioCoreService: AudioCoreService
  ) {}
} 