import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AudioPlayerComponent } from './components/audio-player/audio-player.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AudioPlayerComponent],
  template: `
    <main>
      <router-outlet></router-outlet>
      <app-audio-player></app-audio-player>
    </main>
  `,
  styles: [`
    main {
      padding-bottom: 90px; /* Add space for the fixed player */
    }
  `]
})
export class AppComponent {}
