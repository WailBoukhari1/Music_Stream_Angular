import { createSelector } from '@ngrx/store';
import { TrackState } from './track/track.reducer';
import { Track } from '../models/track.model';

export const selectTrackState = (state: any) => state.tracks;

export const selectAllTracks = createSelector(
  selectTrackState,
  (state: TrackState) => state.tracks
);

export const selectTrackById = (id: string) => createSelector(
  selectAllTracks,
  (tracks: Track[]) => tracks.find(track => track.id === id)
); 