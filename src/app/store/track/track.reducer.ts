import { createReducer, on } from '@ngrx/store';
import { Track } from '../../models/track.model';
import * as TrackActions from './track.actions';

export interface TrackState {
  tracks: Track[];
  loading: boolean;
  error: string | null;
}

export const initialState: TrackState = {
  tracks: [],
  loading: false,
  error: null
};

export const trackReducer = createReducer(
  initialState,
  on(TrackActions.loadTracks, state => ({
    ...state,
    loading: true
  })),
  on(TrackActions.loadTracksSuccess, (state, { tracks }) => ({
    ...state,
    tracks,
    loading: false
  })),
  on(TrackActions.loadTracksFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  on(TrackActions.addTrack, (state, { track }) => ({
    ...state,
    tracks: [...state.tracks, track]
  })),
  on(TrackActions.deleteTrack, (state, { id }) => ({
    ...state,
    tracks: state.tracks.filter(track => track.id !== id)
  })),
  on(TrackActions.setError, (state, { error }) => ({
    ...state,
    error,
    loading: false
  }))
); 