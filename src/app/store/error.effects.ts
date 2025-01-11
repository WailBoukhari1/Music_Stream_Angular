import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as PlayerActions from './player/player.actions';

@Injectable()
export class ErrorEffects {
  handleError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayerActions.loadTrackFailure),
      map(({ error }) => {
        this.snackBar.open(error, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return { type: '[Error] Handled' };
      })
    )
  );

  constructor(
    private actions$: Actions,
    private snackBar: MatSnackBar
  ) {}
} 