import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { map, switchMap, catchError, tap, mergeMap } from 'rxjs/operators';
import { IndexedDBService } from '../../services/indexed-db.service';
import * as TrackActions from './track.actions';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class TrackEffects {
  loadTracks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.loadTracks),
      switchMap(() => from(this.indexedDB.getAllTracks()).pipe(
        map(tracks => TrackActions.loadTracksSuccess({ tracks })),
        catchError(error => of(TrackActions.loadTracksFailure({ 
          error: error?.message || 'Failed to load tracks' 
        })))
      ))
    )
  );

  addTrack$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.addTrack),
      switchMap(({ track, audioFile, thumbnail }) => 
        from(this.indexedDB.addTrack(track, audioFile, thumbnail)).pipe(
          map(() => TrackActions.loadTracks()),
          catchError(error => {
            console.error('Error adding track:', error);
            return of(TrackActions.loadTracksFailure({ 
              error: error?.message || 'Failed to add track' 
            }));
          })
        )
      )
    )
  );

  deleteTrack$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.deleteTrack),
      switchMap(({ id }) => from(this.indexedDB.deleteTrack(id)).pipe(
        map(() => TrackActions.loadTracks()),
        catchError(error => of(TrackActions.loadTracksFailure({ 
          error: error?.message || 'Failed to delete track' 
        })))
      ))
    )
  );

  handleErrors$ = createEffect(() => 
    this.actions$.pipe(
      ofType(TrackActions.loadTracksFailure),
      tap(({ error }) => {
        this.snackBar.open(error || 'An error occurred', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      })
    ),
    { dispatch: false }
  );

  updateTrack$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.updateTrack),
      mergeMap(({ track }) =>
        from(this.indexedDB.updateTrack(track)).pipe(
          map(updatedTrack => TrackActions.updateTrackSuccess({ track: updatedTrack })),
          catchError(error => of(TrackActions.updateTrackFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private indexedDB: IndexedDBService,
    private snackBar: MatSnackBar
  ) {}
} 