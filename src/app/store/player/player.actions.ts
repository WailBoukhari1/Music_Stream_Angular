import { createAction, props } from '@ngrx/store';
import { Track } from '../../models/track.model';

export const play = createAction('[Player] Play');
export const pause = createAction('[Player] Pause');
export const stop = createAction('[Player] Stop');
export const setTrack = createAction(
  '[Player] Set Track',
  props<{ track: Track }>()
);
export const setCurrentTime = createAction(
  '[Player] Set Current Time',
  props<{ time: number }>()
);
export const setVolume = createAction(
  '[Player] Set Volume',
  props<{ volume: number }>()
);
export const setError = createAction(
  '[Player] Set Error',
  props<{ message: string }>()
);
export const loadPersistedState = createAction('[Player] Load Persisted State'); 