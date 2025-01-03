import { playerReducer, initialState } from './player.reducer';
import * as PlayerActions from './player.actions';

describe('Player Reducer', () => {
  it('should return initial state', () => {
    const action = { type: 'NOOP' };
    const state = playerReducer(undefined, action);

    expect(state).toBe(initialState);
  });

  it('should handle play action', () => {
    const action = PlayerActions.play();
    const state = playerReducer(initialState, action);

    expect(state.isPlaying).toBe(true);
    expect(state.playbackState).toBe('playing');
  });

  it('should handle pause action', () => {
    const action = PlayerActions.pause();
    const state = playerReducer(initialState, action);

    expect(state.isPlaying).toBe(false);
    expect(state.playbackState).toBe('paused');
  });

  it('should handle setTrack action', () => {
    const track = {
      id: '1',
      title: 'Test Track',
      artist: 'Test Artist',
      category: 'pop' as const,
      addedDate: new Date(),
      duration: 180
    };
    const action = PlayerActions.setTrack({ track });
    const state = playerReducer(initialState, action);

    expect(state.currentTrack).toEqual(track);
    expect(state.isPlaying).toBe(true);
    expect(state.playbackState).toBe('playing');
  });
}); 