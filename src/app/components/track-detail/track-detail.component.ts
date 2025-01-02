import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
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
import * as PlayerActions from '../../store/player/player.actions';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

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
export class TrackDetailComponent implements OnInit, OnDestroy {
  track$: Observable<Track | undefined>;
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private audioService: AudioService,
    private dialog: MatDialog,
    private router: Router
  ) {
    const trackId = this.route.snapshot.paramMap.get('id') || '';
    this.track$ = this.store.select(TrackSelectors.selectTrackById(trackId))
      .pipe(takeUntil(this.destroy$));
  }

  ngOnInit() {
    this.store.dispatch(TrackActions.loadTracks());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.audioService.pause();
    this.store.dispatch(PlayerActions.stop());
    this.store.dispatch(PlayerActions.setTrack({ track: null }));
  }

  playTrack(track: Track) {
    this.audioService.playTrack(track);
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
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Track',
        message: `Are you sure you want to delete "${track.title}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(TrackActions.deleteTrack({ id: track.id }));
        this.router.navigate(['/library']);
      }
    });
  }
} 