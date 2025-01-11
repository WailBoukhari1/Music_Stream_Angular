import { createReducer, on } from '@ngrx/store';
import { Track } from '../../models/track.model';
import * as PlayerActions from './player.actions';

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  audioUrl: string | null;
  error: string | null;
  queue: Track[];
  loading: boolean;
}

export const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  audioUrl: null,
  error: null,
  queue: [],
  loading: false
};

export const playerReducer = createReducer(
  initialState,
  
  // Playback Control
  on(PlayerActions.play, state => ({ ...state, isPlaying: true })),
  on(PlayerActions.pause, state => ({ ...state, isPlaying: false })),
  on(PlayerActions.stop, state => ({ 
    ...state, 
    isPlaying: false, 
    currentTime: 0 
  })),
  on(PlayerActions.togglePlay, state => ({ 
    ...state, 
    isPlaying: !state.isPlaying 
  })),

  // Track Loading
  on(PlayerActions.loadTrack, (state, { track }) => ({
    ...state,
    currentTrack: track,
    loading: true,
    error: null
  })),
  on(PlayerActions.loadTrackSuccess, (state, { audioUrl }) => ({
    ...state,
    audioUrl,
    loading: false,
    isPlaying: true
  })),
  on(PlayerActions.loadTrackFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
    isPlaying: false
  })),

  // Playback State
  on(PlayerActions.setCurrentTime, (state, { time }) => ({
    ...state,
    currentTime: time
  })),
  on(PlayerActions.setDuration, (state, { duration }) => ({
    ...state,
    duration
  })),
  on(PlayerActions.setVolume, (state, { volume }) => ({
    ...state,
    volume
  })),

  // Queue Management
  on(PlayerActions.addToQueue, (state, { track }) => ({
    ...state,
    queue: [...state.queue, track]
  })),
  on(PlayerActions.clearQueue, state => ({
    ...state,
    queue: []
  }))
); 