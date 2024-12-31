import { createReducer, on } from '@ngrx/store';
import * as PlayerActions from './player.actions';
import { Track } from '../../models/track.model';

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  error: string | null;
  playerState: 'playing' | 'paused' | 'buffering' | 'stopped';
  loadingState: 'loading' | 'error' | 'success';
}

export const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  volume: 1,
  error: null,
  playerState: 'stopped',
  loadingState: 'success'
};

export const playerReducer = createReducer(
  initialState,
  on(PlayerActions.play, state => ({ ...state, isPlaying: true })),
  on(PlayerActions.pause, state => ({ ...state, isPlaying: false })),
  on(PlayerActions.stop, state => ({ ...state, isPlaying: false, currentTime: 0 })),
  on(PlayerActions.setTrack, (state, { track }) => ({ 
    ...state, 
    currentTrack: track,
    isPlaying: true 
  })),
  on(PlayerActions.setCurrentTime, (state, { time }) => ({ ...state, currentTime: time })),
  on(PlayerActions.setVolume, (state, { volume }) => ({ ...state, volume })),
  on(PlayerActions.setError, (state, { message }) => ({ ...state, error: message }))
); 