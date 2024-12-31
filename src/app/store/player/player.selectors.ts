import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PlayerState } from './player.reducer';

export const selectPlayerState = createFeatureSelector<PlayerState>('player');

export const selectCurrentTrack = createSelector(
  selectPlayerState,
  state => state.currentTrack
);

export const selectIsPlaying = createSelector(
  selectPlayerState,
  state => state.isPlaying
);

export const selectCurrentTime = createSelector(
  selectPlayerState,
  state => state.currentTime
);

export const selectVolume = createSelector(
  selectPlayerState,
  state => state.volume
);

export const selectError = createSelector(
  selectPlayerState,
  state => state.error
);

export const selectLoadingState = createSelector(
  selectPlayerState,
  (state: PlayerState) => state.loadingState
);

export const selectPlaybackState = createSelector(
  selectPlayerState,
  (state) => state.playbackState
); 