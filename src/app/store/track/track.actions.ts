import { createAction, props } from '@ngrx/store';
import { Track } from '../../models/track.model';

export const loadTracks = createAction('[Track] Load Tracks');
export const loadTracksSuccess = createAction(
  '[Track] Load Tracks Success',
  props<{ tracks: Track[] }>()
);
export const loadTracksFailure = createAction(
  '[Track] Load Tracks Failure',
  props<{ error: any }>()
);

export const addTrack = createAction(
  '[Track] Add Track',
  props<{ track: Track; audioFile: File; thumbnail?: File | null }>()
);

export const deleteTrack = createAction(
  '[Track] Delete Track',
  props<{ id: string }>()
);

export const playbackError = createAction(
  '[Track] Playback Error',
  props<{ error: string }>()
);

export const updateTrackOrders = createAction(
  '[Track] Update Track Orders',
  props<{ tracks: Track[] }>()
);

export const setError = createAction(
  '[Track] Set Error',
  props<{ error: string }>()
); 