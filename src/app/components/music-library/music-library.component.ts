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
import { Router } from '@angular/router';

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
  templateUrl: './music-library.component.html',
  styleUrls: ['./music-library.component.scss']
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
      return tracks.filter((track: Track) => {
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
    private audioService: AudioService,
    private router: Router
  ) {}

  ngOnInit() {
    this.store.dispatch(TrackActions.loadTracks());
  }

  deleteTrack(id: string) {
    this.store.dispatch(TrackActions.deleteTrack({ id }));
  }

  viewTrackDetails(track: Track, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/track', track.id]);
  }
} 