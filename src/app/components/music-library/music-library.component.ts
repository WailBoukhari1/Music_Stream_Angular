import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

import { Track } from '../../models/track.model';
import { AudioService } from '../../services/audio.service';
import { IndexedDBService } from '../../services/indexed-db.service';
import { DurationPipe } from '../../pipes/duration.pipe';
import * as TrackActions from '../../store/track/track.actions';
import { selectAllTracks } from '../../store/track/track.selectors';
import { Router } from '@angular/router';
import * as PlayerActions from '../../store/player/player.actions';
import { TrackState } from '../../store/track/track.reducer';

@Component({
  selector: 'app-music-library',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    DurationPipe,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatPaginatorModule,
  ],
  templateUrl: './music-library.component.html',
  styleUrls: ['./music-library.component.scss']
})
export class MusicLibraryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private tracks: Track[] = [];
  
  // Filter Controls
  filterForm = new FormGroup({
    search: new FormControl(''),
    category: new FormControl<'pop' | 'rock' | 'rap' | 'cha3bi' | ''>(''),
    duration: new FormControl(''),
    sortBy: new FormControl('addedDate'),
    sortDirection: new FormControl('desc')
  });

  // Filter Options
  categories: ('pop' | 'rock' | 'rap' | 'cha3bi')[] = ['pop', 'rock', 'rap', 'cha3bi'];
  durationRanges = [
    { value: 'short', label: 'Short (< 3 min)', max: 180 },
    { value: 'medium', label: 'Medium (3-5 min)', min: 180, max: 300 },
    { value: 'long', label: 'Long (> 5 min)', min: 300 }
  ];

  // UI State
  isEditMode = false;

  // Add pagination properties
  pageSize = 12;
  pageSizeOptions = [6, 12, 24, 48];
  currentPage = 0;
  
  // Modify filteredTracks$ to include pagination
  filteredTracks$ = combineLatest([
    this.store.select(selectAllTracks),
    this.filterForm.valueChanges.pipe(startWith(this.filterForm.value))
  ]).pipe(
    map(([tracks, filters]) => {
      const filteredTracks = this.filterTracks(tracks, filters);
      const startIndex = this.currentPage * this.pageSize;
      return filteredTracks.slice(startIndex, startIndex + this.pageSize);
    })
  );

  // Add total tracks count for paginator
  totalTracks$ = combineLatest([
    this.store.select(selectAllTracks),
    this.filterForm.valueChanges.pipe(startWith(this.filterForm.value))
  ]).pipe(
    map(([tracks, filters]) => this.filterTracks(tracks, filters).length)
  );

  constructor(
    private store: Store<{ tracks: TrackState }>,
    private audioService: AudioService,
    private router: Router,
    private indexedDBService: IndexedDBService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.loadTracks();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Track Actions
  viewTrackDetails(track: Track, event?: Event) {
    if (event) {
      event.stopPropagation(); // Prevent event bubbling if called from a button
    }
    this.router.navigate(['/track', track.id]);
  }

  deleteTrack(id: string, trackName: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Track',
        message: `Are you sure you want to delete "${trackName}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(TrackActions.deleteTrack({ id }));
      }
    });
  }

  // Drag & Drop
  onDrop(event: CdkDragDrop<Track[]>) {
    if (!this.isEditMode) return;

    const tracks = [...this.tracks];
    moveItemInArray(tracks, event.previousIndex, event.currentIndex);
    
    const updatedTracks = tracks.map((track, index) => ({
      ...track,
      order: index
    }));

    this.tracks = updatedTracks; // Update local tracks immediately
    
    this.indexedDBService.updateTrackOrders(updatedTracks)
      .then(() => {
        // Dispatch success action to update store
        this.store.dispatch(TrackActions.loadTracksSuccess({ tracks: updatedTracks }));
      })
      .catch(error => {
        console.error('Error updating track order:', error);
        this.loadTracks(); // Reload on error
      });
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  // Private Methods
  private loadTracks() {
    this.store.dispatch(TrackActions.loadTracks());
    
    this.indexedDBService.getAllTracks()
      .then(tracks => {
        const sortedTracks = tracks.sort((a, b) => (a.order || 0) - (b.order || 0));
        this.tracks = sortedTracks;
        this.store.dispatch(TrackActions.loadTracksSuccess({ tracks: sortedTracks }));
      })
      .catch(error => {
        console.error('Error loading tracks:', error);
        this.store.dispatch(TrackActions.loadTracksFailure({ error }));
      });
  }

  private filterTracks(tracks: Track[], filters: any): Track[] {
    if (!tracks) return [];
    
    return tracks.filter(track => {
      const searchMatch = !filters.search || 
        track.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        track.artist.toLowerCase().includes(filters.search.toLowerCase());

      const categoryMatch = !filters.category || 
        track.category === filters.category;

      const durationMatch = !filters.duration || 
        this.matchDuration(track.duration, filters.duration);

      return searchMatch && categoryMatch && durationMatch;
    }).sort((a, b) => {
      const direction = filters.sortDirection === 'desc' ? -1 : 1;
      switch (filters.sortBy) {
        case 'title':
          return direction * a.title.localeCompare(b.title);
        case 'artist':
          return direction * a.artist.localeCompare(b.artist);
        case 'duration':
          return direction * (a.duration - b.duration);
        default:
          return direction * (new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime());
      }
    });
  }

  private matchDuration(trackDuration: number, filterValue: string): boolean {
    const range = this.durationRanges.find(r => r.value === filterValue);
    if (!range) return true;
    
    return (
      (!range.min || trackDuration >= range.min) && 
      (!range.max || trackDuration <= range.max)
    );
  }

  // Add page change handler
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  // Add a new method for playing track
  playTrack(track: Track, event: Event) {
    event.stopPropagation(); // Prevent the card click event from firing
    this.router.navigate(['/track', track.id]).then(() => {
      this.audioService.playTrack(track);
    });
  }

  // Add sorting functionality
  sortTracks(tracks: Track[]): Track[] {
    return tracks.sort((a, b) => {
      const direction = this.filterForm.get('sortDirection')?.value === 'desc' ? -1 : 1;
      const sortBy = this.filterForm.get('sortBy')?.value;

      switch (sortBy) {
        case 'title':
          return direction * a.title.localeCompare(b.title);
        case 'artist':
          return direction * a.artist.localeCompare(b.artist);
        case 'duration':
          return direction * (a.duration - b.duration);
        default:
          return direction * (new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime());
      }
    });
  }
} 