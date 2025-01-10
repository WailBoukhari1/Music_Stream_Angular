import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { TrackService } from '../../services/track.service';
import * as TrackActions from './track.actions';
import { IndexedDBService } from '../../services/indexed-db.service';
import { from } from 'rxjs';
import { Track } from '../../models/track.model';
import { NotificationService } from '../../services/notification.service';

@Injectable()
export class TrackEffects {
  loadTracks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.loadTracks),
      mergeMap(() => {
        console.log('Loading tracks effect triggered');
        return from(this.indexedDBService.getAllTracks()).pipe(
          map(tracks => {
            console.log('Tracks loaded successfully:', tracks);
            return TrackActions.loadTracksSuccess({ tracks });
          }),
          catchError(error => {
            console.error('Error loading tracks:', error);
            return of(TrackActions.loadTracksFailure({ error }));
          })
        );
      })
    )
  );

  loadTrack$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.loadTrack),
      switchMap(({ id }) => 
        from(this.indexedDBService.getTrackById(id)).pipe(
          map(track => {
            if (!track) {
              throw new Error('Track not found');
            }
            return TrackActions.loadTrackSuccess({ track });
          }),
          catchError(error => {
            console.error('Error loading track:', error);
            return of(TrackActions.loadTrackFailure({ error: error.message }));
          })
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

  addTrack$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.addTrack),
      mergeMap(action =>
        from(this.indexedDBService.addTrack(
          action.track,
          action.audioFile,
          action.thumbnail
        )).pipe(
          map(() => {
            this.notification.success('Track added successfully');
            return TrackActions.loadTracks();
          }),
          catchError(error => {
            this.notification.error('Failed to add track');
            return of(TrackActions.setError({ error: error.message }));
          })
        )
      )
    )
  );

  updateTrack$ = createEffect(() => this.actions$.pipe(
    ofType(TrackActions.updateTrack),
    mergeMap(({ track }) => from(this.indexedDBService.updateTrack(track)).pipe(
      map(() => TrackActions.updateTrackSuccess({ track })),
      catchError(error => of(TrackActions.updateTrackFailure({ error })))
    ))
  ));

  toggleFavorite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.toggleFavorite),
      mergeMap(({ id }) =>
        from(this.indexedDBService.getTrackById(id)).pipe(
          map((track: Track) => ({
            ...track,
            isFavorite: !track.isFavorite
          })),
          mergeMap((updatedTrack: Track) =>
            from(this.indexedDBService.updateTrack(updatedTrack)).pipe(
              map(() => TrackActions.updateFavoriteSuccess({ track: updatedTrack })),
              catchError(error => of(TrackActions.loadTracksFailure({ error })))
            )
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private trackService: TrackService,
    private indexedDBService: IndexedDBService,
    private notification: NotificationService
  ) {}
} 