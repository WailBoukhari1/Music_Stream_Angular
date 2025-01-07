import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import * as TrackActions from './track.actions';
import { Track } from '../../models/track.model';

// Create entity adapter
export const adapter: EntityAdapter<Track> = createEntityAdapter<Track>();

// Define the state interface extending EntityState
export interface TrackState extends EntityState<Track> {
  loading: boolean;
  error: string | null;
}

// Initialize state using adapter
export const initialState: TrackState = adapter.getInitialState({
  loading: false,
  error: null
});

export const trackReducer = createReducer(
  initialState,
  on(TrackActions.loadTracks, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(TrackActions.loadTracksSuccess, (state, { tracks }) => {
    console.log('Reducer handling loadTracksSuccess:', tracks);
    return adapter.setAll(tracks, {
      ...state,
      loading: false,
      error: null
    });
  }),
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
  })),
  on(TrackActions.toggleFavorite, (state, { id }) => {
    const track = state.entities[id];
    if (!track) return state;

    return adapter.updateOne({
      id,
      changes: { isFavorite: !track.isFavorite }
    }, state);
  }),
  on(TrackActions.updateFavoriteSuccess, (state, { track }) => {
    return adapter.updateOne({
      id: track.id,
      changes: track
    }, state);
  })
); 