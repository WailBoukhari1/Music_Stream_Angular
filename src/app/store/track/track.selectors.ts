import { createSelector } from '@ngrx/store';
import { TrackState, adapter } from './track.reducer';
import { Track } from '../../models/track.model';

export const selectTrackState = (state: { tracks: TrackState }) => state.tracks;

const { selectAll } = adapter.getSelectors();

export const selectAllTracks = createSelector(
  selectTrackState,
  selectAll
);

export const selectCurrentTrack = createSelector(
  selectTrackState,
  (state: TrackState, props: { id: string }) => state.entities[props.id]
);

export const selectFavoriteTracks = createSelector(
  selectAllTracks,
  (tracks: Track[]) => tracks.filter(track => track.isFavorite)
); 