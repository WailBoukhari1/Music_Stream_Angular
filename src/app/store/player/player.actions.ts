import { createAction, props } from '@ngrx/store';
import { Track } from '../../models/track.model';

// Playback Control Actions
export const play = createAction('[Player] Play');
export const pause = createAction('[Player] Pause');
export const stop = createAction('[Player] Stop');
export const togglePlay = createAction('[Player] Toggle Play');

// Track Loading Actions
export const loadTrack = createAction(
  '[Player] Load Track',
  props<{ track: Track }>()
);
export const loadTrackSuccess = createAction(
  '[Player] Load Track Success',
  props<{ audioUrl: string }>()
);
export const loadTrackFailure = createAction(
  '[Player] Load Track Failure',
  props<{ error: string }>()
);

// Playback State Actions
export const setCurrentTime = createAction(
  '[Player] Set Current Time',
  props<{ time: number }>()
);
export const setDuration = createAction(
  '[Player] Set Duration',
  props<{ duration: number }>()
);
export const setVolume = createAction(
  '[Player] Set Volume',
  props<{ volume: number }>()
);

// Playlist Actions
export const playNext = createAction('[Player] Play Next Track');
export const playPrevious = createAction('[Player] Play Previous Track');
export const addToQueue = createAction(
  '[Player] Add To Queue',
  props<{ track: Track }>()
);
export const clearQueue = createAction('[Player] Clear Queue');