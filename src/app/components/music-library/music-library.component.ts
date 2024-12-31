import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Track } from './music-library.model';
import * as MusicLibraryActions from '../../store/music-library/music-library.actions';

@Component({
  selector: 'app-music-library',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './music-library.component.html',
  styleUrl: './music-library.component.scss'
})
export class MusicLibraryComponent implements OnInit {
  tracks$: Observable<Track[]> = this.store.select(state => state.musicLibrary.tracks);
  loading$: Observable<boolean> = this.store.select(state => state.musicLibrary.loading);
  error$: Observable<string | null> = this.store.select(state => state.musicLibrary.error);

  constructor(
    private store: Store<any>,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.store.dispatch(MusicLibraryActions.loadTracks());
  }

  playTrack(track: Track): void {
    this.store.dispatch(MusicLibraryActions.playTrack({ track }));
    this.router.navigate(['/player']);
  }
}
