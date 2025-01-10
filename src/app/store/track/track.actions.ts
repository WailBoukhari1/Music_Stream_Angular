import { createAction, props } from '@ngrx/store';
import { Track } from '../../models/track.model';

export const loadTrack = createAction(
  '[Track] Load Track',
  props<{ id: string }>()
);

export const loadTracks = createAction('[Track] Load Tracks');
export const loadTracksSuccess = createAction(
  '[Track] Load Tracks Success',
  props<{ tracks: Track[] }>()
);
export const loadTracksFailure = createAction(
  '[Track] Load Tracks Failure',
  props<{ error: any }>()
);

export const loadTrackSuccess = createAction(
  '[Track] Load Track Success',
  props<{ track: Track }>()
);

export const loadTrackFailure = createAction(
  '[Track] Load Track Failure',
  props<{ error: string }>()
);

export const addTrack = createAction(
  '[Track] Add Track',
  props<{ track: Track; audioFile: File; thumbnail?: File | null }>()
);

export const addTrackSuccess = createAction(
  '[Track] Add Track Success',
  props<{ track: Track }>()
);

export const addTrackFailure = createAction(
  '[Track] Add Track Failure',
  props<{ error: any }>()
);

export const deleteTrack = createAction(
  '[Track] Delete Track',
  props<{ id: string }>()
);

export const deleteTrackSuccess = createAction(
  '[Track] Delete Track Success',
  props<{ id: string }>()
);

export const deleteTrackFailure = createAction(
  '[Track] Delete Track Failure',
  props<{ error: string }>()
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

export const updateTrack = createAction(
  '[Track] Update Track',
  props<{ track: Track }>()
);

export const updateTrackSuccess = createAction(
  '[Track] Update Track Success',
  props<{ track: Track }>()
);

export const updateTrackFailure = createAction(
  '[Track] Update Track Failure',
  props<{ error: any }>()
);

export const playTrack = createAction(
  '[Track] Play Track',
  props<{ track: Track }>()
);

export const toggleFavorite = createAction(
  '[Track] Toggle Favorite',
  props<{ id: string }>()
);

export const updateFavoriteSuccess = createAction(
  '[Track] Update Favorite Success',
  props<{ track: Track }>()
); 