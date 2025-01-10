import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { DurationPipe } from '../../pipes/duration.pipe';
import { Track } from '../../models/track.model';
import { selectFavoriteTracks } from '../../store/track/track.selectors';
import * as TrackActions from '../../store/track/track.actions';
import { Router } from '@angular/router';
import { AudioService } from '../../services/audio.service';
import { TrackState } from '../../store/track/track.reducer';

interface AppState {
  tracks: TrackState;
}

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    MatTooltipModule,
    MatRippleModule,
    DurationPipe
  ],
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {
  favoriteTracks$: Observable<Track[]>;

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private audioService: AudioService
  ) {
    this.favoriteTracks$ = this.store.select(selectFavoriteTracks);
  }

  ngOnInit() {}

  playTrack(track: Track) {
    this.router.navigate(['/track', track.id]).then(() => {
      this.audioService.playTrack(track);
    });
  }

  removeFromFavorites(track: Track, event: Event) {
    event.stopPropagation();
    this.store.dispatch(TrackActions.toggleFavorite({ id: track.id }));
  }
} 