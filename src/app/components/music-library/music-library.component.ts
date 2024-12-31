import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Track } from '../../models/track.model';
import * as TrackActions from '../../store/track/track.actions';
import { selectAllTracks } from '../../store/track/track.selectors';
import { FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { TrackState } from '../../store/track/track.reducer';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-music-library',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="library-container">
      <div *ngIf="loading$ | async" class="loading">
        <mat-spinner diameter="40"></mat-spinner>
        Loading tracks...
      </div>

      <div *ngIf="error$ | async as error" class="error">
        {{ error }}
      </div>

      <div *ngIf="!(loading$ | async) && !(error$ | async)" class="tracks-grid">
        <mat-card *ngFor="let track of tracks$ | async" class="track-card" (click)="playTrack(track)">
          <img mat-card-image [src]="track.thumbnailUrl || 'assets/default-cover.png'" [alt]="track.title">
          
          <mat-card-content>
            <h3>{{ track.title }}</h3>
            <p class="artist">{{ track.artist }}</p>
            <p class="category">{{ track.category }}</p>
          </mat-card-content>

          <mat-card-actions>
            <button mat-icon-button [routerLink]="['/player', track.id]">
              <mat-icon>play_arrow</mat-icon>
            </button>
            <button mat-icon-button (click)="deleteTrack(track.id)">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .library-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .tracks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      padding: 20px;
    }

    .track-card {
      transition: transform 0.2s;
    }

    .track-card:hover {
      transform: translateY(-4px);
    }

    mat-card-content h3 {
      margin: 0;
      font-size: 1.1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .artist, .category {
      margin: 4px 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.9rem;
    }

    mat-card-actions {
      display: flex;
      justify-content: space-between;
      padding: 8px;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 2rem;
      text-align: center;
      color: rgba(0, 0, 0, 0.6);
    }

    .error {
      color: #f44336;
      text-align: center;
      padding: 1rem;
      margin: 1rem;
      background: #ffebee;
      border-radius: 4px;
    }
  `]
})
export class MusicLibraryComponent implements OnInit {
  tracks$ = this.store.select(selectAllTracks);
  loading$ = this.store.select((state: { tracks: TrackState }) => state.tracks.loading);
  error$ = this.store.select((state: { tracks: TrackState }) => state.tracks.error);
  searchControl = new FormControl();

  constructor(
    private store: Store<{ tracks: TrackState }>,
    private audioService: AudioService
  ) {}

  ngOnInit() {
    this.store.dispatch(TrackActions.loadTracks());
  }

  deleteTrack(id: string) {
    this.store.dispatch(TrackActions.deleteTrack({ id }));
  }

  playTrack(track: Track) {
    this.audioService.playTrack(track);
  }
} 