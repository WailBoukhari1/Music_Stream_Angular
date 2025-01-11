import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, filter, tap } from 'rxjs';
import { takeUntil, catchError, take } from 'rxjs/operators';
import { Track } from '../../models/track.model';
import * as TrackSelectors from '../../store/track/track.selectors';
import * as TrackActions from '../../store/track/track.actions';
import { TrackState } from '../../store/track/track.reducer';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DurationPipe } from '../../pipes/duration.pipe';
import { MatDialog } from '@angular/material/dialog';
import { EditTrackDialogComponent } from '../edit-track-dialog/edit-track-dialog.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { AudioService } from '../../services/audio.service';
import * as PlayerActions from '../../store/player/player.actions';

@Component({
  selector: 'app-track-detail',
  templateUrl: './track-detail.component.html',
  styleUrls: ['./track-detail.component.scss'],
  standalone: true,
  imports: [MatIconModule, CommonModule, DurationPipe, MatCardModule]
})
export class TrackDetailComponent implements OnInit, OnDestroy {
  track$!: Observable<Track | null | undefined>;
  currentTrack?: Track;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<{ tracks: TrackState }>,
    private dialog: MatDialog,
    private audioService: AudioService,
  ) {
    this.track$ = this.store.select(TrackSelectors.selectTrackById(this.route.snapshot.params['id']));
  }

  ngOnInit() {
    // First load all tracks to ensure we have data
    this.store.dispatch(TrackActions.loadTracks());

    // Then handle the route params
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const trackId = params.get('id');
        if (trackId) {
          // Set up the track$ observable before dispatching load action
          this.track$ = this.store.select(TrackSelectors.selectTrackById(trackId))
            .pipe(
              takeUntil(this.destroy$),
              tap(track => {
                if (track) {
                  this.currentTrack = track;
                  this.error = null;
                } else {
                  this.error = 'Loading track...';
                }
              })
            );

          // Then dispatch the load action
          this.store.dispatch(TrackActions.loadTrack({ id: trackId }));
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  playTrack(track: Track): void {
    this.store.dispatch(PlayerActions.loadTrack({ track }));
    this.audioService.play();
  }

  editTrack(track: Track): void {
    this.dialog.open(EditTrackDialogComponent, {
      width: '500px',
      data: track
    });
  }

  confirmDelete(track: Track): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Track', message: `Are you sure you want to delete "${track.title}"?` }
    });

    dialogRef.afterClosed()
      .pipe(take(1))
      .subscribe(result => {
        if (result) {
          this.store.dispatch(TrackActions.deleteTrack({ id: track.id }));
          this.router.navigate(['/library']);
        }
      });
  }

} 