import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';
import { hot, cold } from 'jasmine-marbles';
import { TrackEffects } from './track.effects';
import { IndexedDBService } from '../../services/indexed-db.service';
import * as TrackActions from './track.actions';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('TrackEffects', () => {
  let actions$: Observable<any>;
  let effects: TrackEffects;
  let indexedDBSpy: jasmine.SpyObj<IndexedDBService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    const dbSpy = jasmine.createSpyObj('IndexedDBService', ['getAllTracks', 'addTrack', 'deleteTrack']);
    const snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        TrackEffects,
        provideMockActions(() => actions$),
        { provide: IndexedDBService, useValue: dbSpy },
        { provide: MatSnackBar, useValue: snackSpy }
      ]
    });

    effects = TestBed.inject(TrackEffects);
    indexedDBSpy = TestBed.inject(IndexedDBService) as jasmine.SpyObj<IndexedDBService>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should load tracks successfully', () => {
    const tracks = [
      { id: '1', title: 'Test Track', artist: 'Test Artist', category: 'pop' as const }
    ];
    indexedDBSpy.getAllTracks.and.returnValue(Promise.resolve(tracks));

    actions$ = hot('-a', { a: TrackActions.loadTracks() });
    const expected = cold('-b', {
      b: TrackActions.loadTracksSuccess({ tracks })
    });

    expect(effects.loadTracks$).toBeObservable(expected);
  });

  it('should handle load tracks failure', () => {
    const error = new Error('Test error');
    indexedDBSpy.getAllTracks.and.returnValue(Promise.reject(error));

    actions$ = hot('-a', { a: TrackActions.loadTracks() });
    const expected = cold('-b', {
      b: TrackActions.loadTracksFailure({ error: error.message })
    });

    expect(effects.loadTracks$).toBeObservable(expected);
  });
}); 