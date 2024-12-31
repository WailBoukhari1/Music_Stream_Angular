import { createAction, props } from '@ngrx/store';
import { Track } from '../../components/music-library/music-library.model';

export const loadTracks = createAction('[Music Library] Load Tracks');
export const loadTracksSuccess = createAction(
  '[Music Library] Load Tracks Success',
  props<{ tracks: Track[] }>()
);
export const loadTracksFailure = createAction(
  '[Music Library] Load Tracks Failure',
  props<{ error: string }>()
);
export const playTrack = createAction(
  '[Music Library] Play Track',
  props<{ track: Track }>()
);
export const pauseTrack = createAction('[Music Library] Pause Track');
export const stopTrack = createAction('[Music Library] Stop Track'); 