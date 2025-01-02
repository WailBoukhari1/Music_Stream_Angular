import { createReducer, on } from '@ngrx/store';
import * as PlayerActions from './player.actions';
import { Track, PlayerState as PlaybackState } from '../../models/track.model';

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  error: string | null;
  loadingState: 'loading' | 'error' | 'success';
  playbackState: string;
  shuffle: boolean;
  repeat: boolean;
}

export const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  volume: 1,
  error: null,
  loadingState: 'success',
  playbackState: 'stopped',
  shuffle: false,
  repeat: false
};

export const playerReducer = createReducer(
  initialState,
  on(PlayerActions.play, state => ({ 
    ...state, 
    isPlaying: true,
    playbackState: 'playing' as PlaybackState
  })),
  on(PlayerActions.pause, state => ({ 
    ...state, 
    isPlaying: false,
    playbackState: 'paused' as PlaybackState
  })),
  on(PlayerActions.stop, state => ({ 
    ...state, 
    isPlaying: false, 
    currentTime: 0,
    playbackState: 'stopped' as PlaybackState
  })),
  on(PlayerActions.setTrack, (state, { track }) => ({ 
    ...state, 
    currentTrack: track,
    isPlaying: true,
    playbackState: 'playing' as PlaybackState
  })),
  on(PlayerActions.setCurrentTime, (state, { time }) => ({ 
    ...state, 
    currentTime: time 
  })),
  on(PlayerActions.setVolume, (state, { volume }) => ({ 
    ...state, 
    volume 
  })),
  on(PlayerActions.setError, (state, { message }) => ({ 
    ...state, 
    error: message,
    playbackState: 'stopped' as PlaybackState
  })),
  on(PlayerActions.toggleShuffle, (state) => ({
    ...state,
    shuffle: !state.shuffle
  })),
  on(PlayerActions.toggleRepeat, (state) => ({
    ...state,
    repeat: !state.repeat
  }))
); 