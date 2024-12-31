import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Track } from '../../models/track.model';
import { DurationPipe } from '../../pipes/duration.pipe';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-track-detail',
  standalone: true,
  imports: [CommonModule, DurationPipe],
  template: `
    <div class="track-detail" *ngIf="track$ | async as track">
      <div class="cover">
        <img [src]="track.thumbnailUrl || 'assets/default-cover.png'" [alt]="track.title">
      </div>
      <div class="info">
        <h1>{{ track.title }}</h1>
        <p class="artist">{{ track.artist }}</p>
        <p class="category">{{ track.category }}</p>
        <p class="description">{{ track.description }}</p>
        <p class="metadata">
          Added: {{ track.addedDate | date }}
          Duration: {{ track.duration | duration }}
        </p>
      </div>
    </div>
  `
})
export class TrackDetailComponent {
  track$: Observable<Track>;

  constructor(private route: ActivatedRoute) {
    this.track$ = this.route.data.pipe(map(data => data['track']));
  }
} 