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
  template: `
    <div class="playlist-container">
      <div class="playlist-header">
        <div class="header-content">
          <div class="playlist-info">
            <h1>Favorite Tracks</h1>
            <p>{{ (favoriteTracks$ | async)?.length || 0 }} tracks</p>
          </div>
          <button mat-raised-button color="primary" *ngIf="(favoriteTracks$ | async)?.length">
            <mat-icon>play_arrow</mat-icon>
            Play All
          </button>
        </div>
      </div>

      <div class="tracks-list" *ngIf="(favoriteTracks$ | async)?.length; else empty">
        <div class="track-item" *ngFor="let track of favoriteTracks$ | async; let i = index"
             matRipple
             (click)="playTrack(track)">
          <div class="track-number">{{ i + 1 }}</div>
          <div class="track-thumbnail">
            <img [src]="track.thumbnailUrl || 'assets/default-cover.png'" [alt]="track.title">
            <div class="play-overlay">
              <mat-icon>play_arrow</mat-icon>
            </div>
          </div>
          <div class="track-info">
            <h3>{{ track.title }}</h3>
            <p>{{ track.artist }}</p>
          </div>
          <div class="track-category">{{ track.category }}</div>
          <div class="track-duration">
            {{ track.duration | duration }}
          </div>
          <div class="track-actions">
            <button mat-icon-button (click)="removeFromFavorites(track, $event)" matTooltip="Remove from favorites">
              <mat-icon>favorite</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <ng-template #empty>
        <div class="empty-state">
          <mat-icon>favorite_border</mat-icon>
          <h2>No favorite tracks yet</h2>
          <p>Add some tracks to your favorites from the library</p>
        </div>
      </ng-template>
    </div>
  `,
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {
  favoriteTracks$: Observable<Track[]>;

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private audioService: AudioService
  ) {
    this.favoriteTracks$ = this.store.select((state: AppState) => selectFavoriteTracks(state));
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