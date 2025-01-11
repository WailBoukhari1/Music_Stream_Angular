import { createSelector } from '@ngrx/store';
import { PlayerState } from './player.reducer';

export const selectPlayer = (state: any) => state.player;

export const selectCurrentTrack = createSelector(
  selectPlayer,
  (state: PlayerState) => state.currentTrack
);

export const selectIsPlaying = createSelector(
  selectPlayer,
  (state: PlayerState) => state.isPlaying
);

export const selectCurrentTime = createSelector(
  selectPlayer,
  (state: PlayerState) => state.currentTime
);

export const selectDuration = createSelector(
  selectPlayer,
  (state: PlayerState) => state.duration
);

export const selectVolume = createSelector(
  selectPlayer,
  (state: PlayerState) => state.volume
);

export const selectError = createSelector(
  selectPlayer,
  (state: PlayerState) => state.error
);

export const selectQueue = createSelector(
  selectPlayer,
  (state: PlayerState) => state.queue
);

export const selectLoading = createSelector(
  selectPlayer,
  (state: PlayerState) => state.loading
);