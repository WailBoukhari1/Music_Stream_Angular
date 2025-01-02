import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Track } from '../../models/track.model';
import * as TrackActions from './track.actions';

export interface TrackState extends EntityState<Track> {
  loading: boolean;
  error: string | null;
}

export const adapter: EntityAdapter<Track> = createEntityAdapter<Track>();

export const initialState: TrackState = adapter.getInitialState({
  loading: false,
  error: null
});

export const trackReducer = createReducer(
  initialState,
  on(TrackActions.loadTracks, state => ({
    ...state,
    loading: true
  })),
  on(TrackActions.loadTracksSuccess, (state, { tracks }) => 
    adapter.setAll(tracks, { ...state, loading: false })
  ),
  on(TrackActions.loadTracksFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  on(TrackActions.addTrack, (state, { track }: { track: Track }) => 
    adapter.addOne(track, state)
  ),
  on(TrackActions.deleteTrack, (state, { id }) => 
    adapter.removeOne(id, state)
  ),
  on(TrackActions.updateTrackSuccess, (state, { track }) => 
    adapter.updateOne({ id: track.id, changes: track }, state)
  )
); 