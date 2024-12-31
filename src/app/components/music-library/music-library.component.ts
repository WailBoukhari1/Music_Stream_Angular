import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Track } from '../../models/track.model';
import * as TrackActions from '../../store/track/track.actions';
import { selectAllTracks } from '../../store/track/track.selectors';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AudioService } from '../../services/audio.service';
import { combineLatest } from 'rxjs';
import { DurationPipe } from '../../pipes/duration.pipe';

@Component({
  selector: 'app-music-library',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    DurationPipe
  ],
  template: `
    <div class="library-container">
      <!-- Search and Filter Controls -->
      <div class="controls">
        <mat-form-field appearance="outline">
          <mat-label>Search tracks</mat-label>
          <input matInput [formControl]="searchControl" placeholder="Search by title or artist">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Filter by category</mat-label>
          <mat-select [formControl]="categoryFilter">
            <mat-option value="">All Categories</mat-option>
            <mat-option *ngFor="let category of categories" [value]="category">
              {{category}}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Tracks Grid -->
      <div class="tracks-grid">
        <mat-card *ngFor="let track of filteredTracks$ | async" 
                 class="track-card"
                 (click)="playTrack(track)">
          <img mat-card-image [src]="track.thumbnailUrl || 'assets/default-cover.png'" [alt]="track.title">
          
          <mat-card-content>
            <h3>{{ track.title }}</h3>
            <p class="artist">{{ track.artist }}</p>
            <p class="duration">{{ track.duration | duration }}</p>
            <p class="category">{{ track.category }}</p>
          </mat-card-content>

          <button mat-icon-button class="delete-btn" (click)="deleteTrack(track.id); $event.stopPropagation()">
            <mat-icon>delete</mat-icon>
          </button>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .library-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .controls {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    mat-form-field {
      width: 100%;
    }

    .tracks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    mat-card {
      transition: transform 0.2s ease-in-out;
    }

    mat-card:hover {
      transform: translateY(-4px);
    }

    mat-card-content {
      padding: 1rem;
    }

    mat-card img {
      aspect-ratio: 1;
      object-fit: cover;
    }

    h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .artist, .category {
      margin: 4px 0;
      color: rgba(0,0,0,0.6);
      font-size: 0.9rem;
    }

    .delete-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0,0,0,0.5);
      color: white;
    }
  `]
})
export class MusicLibraryComponent implements OnInit {
  tracks$ = this.store.select(selectAllTracks);
  searchControl = new FormControl('');
  categoryFilter = new FormControl('');
  categories = ['pop', 'rock', 'rap', 'cha3bi'];

  filteredTracks$ = combineLatest([
    this.tracks$,
    this.searchControl.valueChanges.pipe(startWith('')),
    this.categoryFilter.valueChanges.pipe(startWith(''))
  ]).pipe(
    map(([tracks, search, category]) => {
      return tracks.filter(track => {
        const matchesSearch = !search || 
          track.title.toLowerCase().includes(search.toLowerCase()) ||
          track.artist.toLowerCase().includes(search.toLowerCase());
        
        const matchesCategory = !category || track.category === category;
        
        return matchesSearch && matchesCategory;
      });
    })
  );

  constructor(
    private store: Store,
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