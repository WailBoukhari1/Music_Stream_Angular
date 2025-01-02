import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TrackState, adapter } from './track.reducer';
import { Track } from '../../models/track.model';

export const selectTrackState = createFeatureSelector<TrackState>('tracks');

// Get the selectors
const { selectAll } = adapter.getSelectors();

export const selectAllTracks = createSelector(
  selectTrackState,
  selectAll
);

export const selectTrackById = (id: string) => createSelector(
  selectAllTracks,
  (tracks: Track[]) => tracks.find((track: Track) => track.id === id)
); 