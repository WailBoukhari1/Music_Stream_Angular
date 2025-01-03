import { createReducer, on } from '@ngrx/store';
import * as TrackActions from './track.actions';
import { Track } from '../../models/track.model';

export interface TrackState {
  entities: { [id: string]: Track };
  loading: boolean;
  error: string | null;
}

export const initialState: TrackState = {
  entities: {},
  loading: false,
  error: null
};

export const trackReducer = createReducer(
  initialState,
  on(TrackActions.loadTracks, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(TrackActions.loadTracksSuccess, (state, { tracks }) => ({
    ...state,
    entities: tracks.reduce<{ [id: string]: Track }>((acc, track) => {
      acc[track.id] = track;
      return acc;
    }, {}),
    loading: false
  })),
  on(TrackActions.loadTrack, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(TrackActions.loadTrackSuccess, (state, { track }) => ({
    ...state,
    entities: { ...state.entities, [track.id]: track },
    loading: false
  })),
  on(TrackActions.loadTracksFailure, TrackActions.loadTrackFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(TrackActions.deleteTrack, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(TrackActions.deleteTrackSuccess, (state, { id }) => {
    const { [id]: removed, ...entities } = state.entities;
    return {
      ...state,
      entities,
      loading: false
    };
  }),
  on(TrackActions.deleteTrackFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
); 