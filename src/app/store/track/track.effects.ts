import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { TrackService } from '../../services/track.service';
import * as TrackActions from './track.actions';

@Injectable()
export class TrackEffects {
  loadTracks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.loadTracks),
      mergeMap(() =>
        this.trackService.getAllTracks().pipe(
          map(tracks => TrackActions.loadTracksSuccess({ tracks })),
          catchError(error => of(TrackActions.loadTracksFailure({ error })))
        )
      )
    )
  );

  loadTrack$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.loadTrack),
      mergeMap(action =>
        this.trackService.getTrackById(action.id).pipe(
          map(track => TrackActions.loadTrackSuccess({ track })),
          catchError(error => of(TrackActions.loadTrackFailure({ error })))
        )
      )
    )
  );

  deleteTrack$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.deleteTrack),
      mergeMap(({ id }) =>
        this.trackService.deleteTrack(id).pipe(
          map(() => TrackActions.deleteTrackSuccess({ id })),
          catchError(error => of(TrackActions.deleteTrackFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private trackService: TrackService
  ) {}
} 