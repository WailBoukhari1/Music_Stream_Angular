import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Track } from '../../models/track.model';
import * as TrackActions from '../../store/track/track.actions';
import { selectAllTracks } from '../../store/track/track.selectors';
import { FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="library-container">
      <div class="header">
        <h1>Music Library</h1>
        <div class="controls-bar">
          <mat-form-field>
            <input matInput placeholder="Search tracks..." [formControl]="searchControl">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          
          <mat-form-field>
            <mat-select placeholder="Category" [formControl]="categoryFilter">
              <mat-option value="">All</mat-option>
              <mat-option *ngFor="let category of categories" [value]="category">
                {{category}}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field>
            <mat-select placeholder="Sort by" [formControl]="sortControl">
              <mat-option value="title">Title</mat-option>
              <mat-option value="artist">Artist</mat-option>
              <mat-option value="addedDate">Date Added</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <div class="upload-section">
        <input 
          type="file" 
          accept=".mp3,.wav,.ogg" 
          (change)="onFileSelected($event)"
          #fileInput
          class="hidden"
        >
        <button class="upload-btn" (click)="fileInput.click()">
          <span class="icon">+</span> Upload Track
        </button>
      </div>

      <div class="tracks-grid">
        <div *ngFor="let track of tracks$ | async" class="track-card" [routerLink]="['/player', track.id]">
          <div class="cover-image">
            <img [src]="track.thumbnailUrl || 'assets/default-cover.png'" alt="Track cover">
            <div class="play-overlay">▶</div>
          </div>
          <div class="track-info">
            <h3>{{ track.title }}</h3>
            <p class="artist">{{ track.artist }}</p>
            <p class="category">{{ track.category }}</p>
          </div>
          <button class="delete-btn" (click)="deleteTrack(track.id); $event.stopPropagation()">×</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .library-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .hidden {
      display: none;
    }

    .upload-btn {
      background: #2196f3;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.3s;
    }

    .upload-btn:hover {
      background: #1976d2;
    }

    .tracks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .track-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.3s;
    }

    .track-card:hover {
      transform: translateY(-4px);
    }

    .cover-image {
      position: relative;
      padding-top: 100%;
    }

    .cover-image img {
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .play-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.6);
      color: white;
      padding: 1rem;
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .track-card:hover .play-overlay {
      opacity: 1;
    }

    .track-info {
      padding: 1rem;
    }

    .track-info h3 {
      margin: 0;
      font-size: 1.1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .artist, .category {
      margin: 0.25rem 0;
      color: #666;
      font-size: 0.9rem;
    }

    .delete-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: rgba(255,255,255,0.9);
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .track-card:hover .delete-btn {
      opacity: 1;
    }
  `]
})
export class LibraryComponent implements OnInit {
  tracks$: Observable<Track[]>;
  searchControl = new FormControl('');
  categoryFilter = new FormControl('');
  sortControl = new FormControl('');
  categories = ['Rock', 'Pop', 'Hip-Hop', 'Electronic', 'Country', 'R&B', 'Jazz'];

  constructor(private store: Store) {
    this.tracks$ = this.store.select(selectAllTracks);
  }

  ngOnInit() {
    this.store.dispatch(TrackActions.loadTracks());
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) { // 15MB limit
        alert('File size must be less than 15MB');
        return;
      }

      const track: Track = {
        id: crypto.randomUUID(),
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Unknown Artist',
        addedDate: new Date(),
        duration: 0,
        category: 'Unknown',
        audioUrl: URL.createObjectURL(file),
        thumbnailUrl: undefined
      };

      this.store.dispatch(TrackActions.addTrack({ track, audioFile: file, thumbnail: null }));
    }
  }

  deleteTrack(id: string) {
    this.store.dispatch(TrackActions.deleteTrack({ id }));
  }
} 