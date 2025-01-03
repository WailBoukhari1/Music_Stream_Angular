import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-upload-progress',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  template: `
    <div class="upload-progress">
      <mat-progress-bar
        [mode]="mode"
        [value]="progress"
        [color]="color">
      </mat-progress-bar>
      <span class="progress-text">{{ progress }}%</span>
    </div>
  `,
  styles: [`
    .upload-progress {
      margin: 1rem 0;
      position: relative;
    }
    .progress-text {
      position: absolute;
      right: 0;
      top: -20px;
      font-size: 0.8rem;
    }
  `]
})
export class UploadProgressComponent {
  @Input() progress = 0;
  @Input() mode: 'determinate' | 'indeterminate' = 'determinate';
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
} 