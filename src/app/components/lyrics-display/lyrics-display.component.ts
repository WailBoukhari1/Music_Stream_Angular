import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Track, SyncedLyric } from '../../models/track.model';

@Component({
  selector: 'app-lyrics-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lyrics-container">
      <div class="lyrics-scroll" #lyricsScroll>
        <div *ngFor="let line of track?.syncedLyrics" 
             class="lyric-line"
             [class.active]="isCurrentLyric(line)"
             [id]="'lyric-' + line.time">
          {{ line.text }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .lyrics-container {
      padding: 2rem;
      height: 300px;
      overflow: hidden;
    }

    .lyrics-scroll {
      height: 100%;
      overflow-y: auto;
      text-align: center;
    }

    .lyric-line {
      padding: 0.5rem;
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.3s ease;
      cursor: default;

      &.active {
        color: white;
        font-size: 1.4rem;
        font-weight: 500;
      }
    }
  `]
})
export class LyricsDisplayComponent implements OnChanges {
  @Input() track?: Track;
  @Input() currentTime: number = 0;

  isCurrentLyric(lyric: SyncedLyric): boolean {
    if (!this.track?.syncedLyrics) return false;
    const nextLyricIndex = this.track.syncedLyrics.findIndex(l => l.time > lyric.time);
    const nextLyricTime = nextLyricIndex !== -1 ? 
      this.track.syncedLyrics[nextLyricIndex].time : Infinity;
    
    return this.currentTime >= lyric.time && this.currentTime < nextLyricTime;
  }

  ngOnChanges() {
    if (this.track?.syncedLyrics) {
      const currentLyric = this.track.syncedLyrics
        .find(lyric => this.isCurrentLyric(lyric));
      
      if (currentLyric) {
        document.getElementById(`lyric-${currentLyric.time}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
} 