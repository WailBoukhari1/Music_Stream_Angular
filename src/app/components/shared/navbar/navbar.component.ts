import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { UploadTrackComponent } from '../../upload-track/upload-track.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-toolbar color="primary">
      <a mat-button routerLink="/" class="brand">
        <mat-icon>music_note</mat-icon>
        Music Player
      </a>
      
      <span class="spacer"></span>
      
      <nav>
        <a mat-button routerLink="/library" routerLinkActive="active">
          <mat-icon>library_music</mat-icon>
          Library
        </a>
        <button mat-button (click)="openUploadDialog()">
          <mat-icon>upload</mat-icon>
          Upload
        </button>
      </nav>
    </mat-toolbar>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }

    .brand {
      font-size: 1.2rem;
      text-decoration: none;
    }

    nav {
      display: flex;
      gap: 1rem;
    }

    .active {
      background: rgba(255, 255, 255, 0.1);
    }

    mat-icon {
      margin-right: 8px;
    }
  `]
})
export class NavbarComponent {
  constructor(private dialog: MatDialog) {}

  openUploadDialog() {
    this.dialog.open(UploadTrackComponent, {
      width: '500px',
      disableClose: true
    });
  }
} 