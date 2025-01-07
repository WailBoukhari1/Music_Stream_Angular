import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DurationPipe } from '../../pipes/duration.pipe';
import { Track } from '../../models/track.model';
import { selectFavoriteTracks } from '../../store/track/track.selectors';
import * as TrackActions from '../../store/track/track.actions';
import { Router } from '@angular/router';
import { AudioService } from '../../services/audio.service';
import { TrackState } from '../../store/track/track.reducer';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule, DurationPipe],
  template: `
    <div class="playlist-container">
      <div class="playlist-header">
        <h1>Favorite Tracks</h1>
      </div>

      <ng-container *ngIf="favoriteTracks$ | async as tracks">
        <!-- Empty State -->
        <div *ngIf="tracks.length === 0" class="empty-state">
          <mat-icon>favorite_border</mat-icon>
          <h2>No favorite tracks yet</h2>
          <p>Add some tracks to your favorites from the library</p>
        </div>

        <!-- Tracks Grid -->
        <div *ngIf="tracks.length > 0" class="tracks-grid">
          <div *ngFor="let track of tracks" class="track-card">
            <!-- Thumbnail Section -->
            <div class="thumbnail-container">
              <img [src]="track.thumbnailUrl || 'assets/default-cover.png'" 
                   [alt]="track.title"
                   class="track-thumbnail">
              
              <div class="play-overlay" (click)="playTrack(track, $event)">
                <mat-icon>play_circle</mat-icon>
              </div>
            </div>

            <!-- Track Info -->
            <div class="track-info">
              <h3 class="track-title">{{ track.title }}</h3>
              <p class="track-artist">{{ track.artist }}</p>
              <p class="track-duration">{{ track.duration | duration }}</p>
            </div>

            <!-- Action Buttons -->
            <div class="track-actions">
              <button mat-icon-button 
                      color="warn" 
                      (click)="removeFromFavorites(track, $event)"
                      matTooltip="Remove from Favorites">
                <mat-icon>favorite</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styleUrls: ['../music-library/music-library.component.scss']
})
export class PlaylistComponent implements OnInit {
  favoriteTracks$: Observable<Track[]>;

  constructor(
    private store: Store<{ tracks: TrackState }>,
    private router: Router,
    private audioService: AudioService
  ) {
    this.favoriteTracks$ = this.store.select(selectFavoriteTracks).pipe(
      map(tracks => tracks || [])
    );
  }

  ngOnInit() {}

  playTrack(track: Track, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/track', track.id]).then(() => {
      this.audioService.playTrack(track);
    });
  }

  removeFromFavorites(track: Track, event: Event) {
    event.stopPropagation();
    this.store.dispatch(TrackActions.toggleFavorite({ id: track.id }));
  }

  viewTrackDetails(track: Track) {
    this.router.navigate(['/track', track.id]);
  }
} 