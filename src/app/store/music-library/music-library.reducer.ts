import { createReducer, on } from '@ngrx/store';
import { Track } from '../../components/music-library/music-library.model';
import * as MusicLibraryActions from './music-library.actions';

export interface MusicLibraryState {
  tracks: Track[];
  currentTrack: Track | null;
  loading: boolean;
  error: string | null;
}

export const initialState: MusicLibraryState = {
  tracks: [],
  currentTrack: null,
  loading: false,
  error: null,
};

export const musicLibraryReducer = createReducer(
  initialState,
  on(MusicLibraryActions.loadTracks, (state) => ({
    ...state,
    loading: true,
  })),
  on(MusicLibraryActions.loadTracksSuccess, (state, { tracks }) => ({
    ...state,
    tracks,
    loading: false,
    error: null,
  })),
  on(MusicLibraryActions.loadTracksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(MusicLibraryActions.playTrack, (state, { track }) => ({
    ...state,
    currentTrack: track,
  }))
); 