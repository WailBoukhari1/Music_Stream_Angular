import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Track } from '../../models/track.model';
import { DurationPipe } from '../../pipes/duration.pipe';

@Component({
  selector: 'app-track-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, DurationPipe],
  template: `
    <div class="track-detail-dialog">
      <div class="track-image">
        <img [src]="data.thumbnailUrl || 'assets/default-cover.png'" [alt]="data.title">
      </div>
      
      <div class="track-info">
        <h2 mat-dialog-title>{{ data.title }}</h2>
        
        <mat-dialog-content>
          <div class="info-item">
            <strong>Artist:</strong> {{ data.artist }}
          </div>
          <div class="info-item">
            <strong>Category:</strong> {{ data.category }}
          </div>
          <div class="info-item">
            <strong>Duration:</strong> {{ data.duration | duration }}
          </div>
          <div class="info-item" *ngIf="data.releaseDate">
            <strong>Release Date:</strong> {{ data.releaseDate | date }}
          </div>
          <div class="info-item">
            <strong>Added:</strong> {{ data.addedDate | date }}
          </div>
          <div class="info-item description" *ngIf="data.description">
            <strong>Description:</strong>
            <p>{{ data.description }}</p>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button mat-dialog-close>Close</button>
        </mat-dialog-actions>
      </div>
    </div>
  `,
  styles: [`
    .track-detail-dialog {
      display: flex;
      gap: 24px;
      padding: 16px;
    }

    .track-image {
      flex: 0 0 200px;
      
      img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 8px;
      }
    }

    .track-info {
      flex: 1;
    }

    .info-item {
      margin-bottom: 12px;
      
      strong {
        color: #666;
        margin-right: 8px;
      }
    }

    .description {
      margin-top: 16px;
      
      p {
        margin: 8px 0 0;
        color: #666;
        line-height: 1.5;
      }
    }

    mat-dialog-actions {
      padding: 16px 0 0;
    }
  `]
})
export class TrackDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TrackDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Track
  ) {}
} 