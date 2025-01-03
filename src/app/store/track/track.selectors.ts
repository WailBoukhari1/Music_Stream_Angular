import { createSelector } from '@ngrx/store';
import { TrackState } from './track.reducer';

export const selectTrackState = (state: { tracks: TrackState }) => state.tracks;

export const selectAllTracks = createSelector(
  selectTrackState,
  (state: TrackState) => Object.values(state.entities)
);

export const selectCurrentTrack = createSelector(
  selectTrackState,
  (state: TrackState, props: { id: string }) => state.entities[props.id]
); 