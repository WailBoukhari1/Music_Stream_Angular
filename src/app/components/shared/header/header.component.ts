import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { UploadTrackComponent } from '../../upload-track/upload-track.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <mat-toolbar>
      <a mat-button routerLink="/library" class="brand">
        <mat-icon>music_note</mat-icon>
        Music Player
      </a>

      <span class="spacer"></span>

      <button mat-raised-button color="primary" (click)="openUploadDialog()">
        <mat-icon>upload</mat-icon>
        Upload Music
      </button>
    </mat-toolbar>
  `,
  styles: [`
    mat-toolbar {
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }

    .brand {
      font-size: 1.2rem;
      text-decoration: none;
    }

    .spacer {
      flex: 1 1 auto;
    }

    button mat-icon {
      margin-right: 8px;
    }
  `]
})
export class HeaderComponent {
  constructor(private dialog: MatDialog) {}

  openUploadDialog() {
    this.dialog.open(UploadTrackComponent, {
      width: '500px',
      panelClass: 'upload-dialog'
    });
  }
} 