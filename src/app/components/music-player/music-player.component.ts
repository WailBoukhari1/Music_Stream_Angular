import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { Track } from '../music-library/music-library.model';
import * as MusicLibraryActions from '../../store/music-library/music-library.actions';

@Component({
  selector: 'app-music-player',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    RouterModule
  ],
  templateUrl: './music-player.component.html',
  styleUrl: './music-player.component.scss'
})
export class MusicPlayerComponent {
  currentTrack$: Observable<Track | null> = this.store.select(state => state.musicLibrary.currentTrack);

  constructor(private store: Store<any>) {}

  pauseTrack(): void {
    this.store.dispatch(MusicLibraryActions.pauseTrack());
  }

  playTrack(): void {
    this.currentTrack$.pipe(take(1)).subscribe(track => {
      if (track) {
        this.store.dispatch(MusicLibraryActions.playTrack({ track }));
      }
    });
  }

  stopTrack(): void {
    this.store.dispatch(MusicLibraryActions.stopTrack());
  }
}
