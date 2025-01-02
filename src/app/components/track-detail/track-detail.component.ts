import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Track } from '../../models/track.model';
import { ActivatedRoute } from '@angular/router';
import { AudioPlayerComponent } from '../audio-player/audio-player.component';
import { DurationPipe } from '../../pipes/duration.pipe';
import { AudioService } from '../../services/audio.service';
import * as TrackSelectors from '../../store/track/track.selectors';
import * as TrackActions from '../../store/track/track.actions';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EditTrackDialogComponent } from '../edit-track-dialog/edit-track-dialog.component';

@Component({
  selector: 'app-track-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    AudioPlayerComponent,
    DurationPipe,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './track-detail.component.html',
  styleUrls: ['./track-detail.component.scss']
})
export class TrackDetailComponent implements OnInit {
  track$: Observable<Track | undefined>;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private audioService: AudioService,
    private dialog: MatDialog,
    private router: Router
  ) {
    const trackId = this.route.snapshot.paramMap.get('id') || '';
    this.track$ = this.store.select(TrackSelectors.selectTrackById(trackId));
  }

  ngOnInit() {
    // Load tracks if they're not already loaded
    this.store.dispatch(TrackActions.loadTracks());
  }

  playTrack(track: Track) {
    this.audioService.playTrack(track);
  }

  addToQueue(track: Track) {
    // Implement queue functionality
  }

  editTrack(track: Track) {
    const dialogRef = this.dialog.open(EditTrackDialogComponent, {
      data: track
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(TrackActions.updateTrack({ track: result }));
      }
    });
  }

  confirmDelete(track: Track) {
    if (confirm('Are you sure you want to delete this track?')) {
      this.store.dispatch(TrackActions.deleteTrack({ id: track.id }));
      this.router.navigate(['/library']);
    }
  }
} 