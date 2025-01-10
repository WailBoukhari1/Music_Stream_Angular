import { createSelector } from '@ngrx/store';
import { TrackState, adapter } from './track.reducer';

export const selectTrackState = (state: any) => state.tracks;

const { selectAll, selectEntities } = adapter.getSelectors();

export const selectAllTracks = createSelector(
  selectTrackState,
  selectAll
);

export const selectTrackById = (id: string) => createSelector(
  selectTrackState,
  (state: TrackState) => selectEntities(state)[id]
);

export const selectCurrentTrack = createSelector(
  selectTrackState,
  (state: TrackState) => state.currentTrack
);

export const selectFavoriteTracks = createSelector(
  selectAllTracks,
  (tracks) => tracks.filter(track => track.isFavorite)
); 