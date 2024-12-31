import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as PlayerActions from './player/player.actions';
import * as TrackActions from './track/track.actions';

@Injectable()
export class ErrorEffects {
  handleErrors$ = createEffect(() => 
    this.actions$.pipe(
      ofType(
        PlayerActions.setError,
        TrackActions.loadTracksFailure,
        TrackActions.playbackError
      ),
      tap(action => {
        const message = 'error' in action ? action.error : action.message;
        this.snackBar.open(message, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      })
    ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private snackBar: MatSnackBar
  ) {}
} 