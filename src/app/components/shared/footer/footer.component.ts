import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, MatToolbarModule],
  template: `
    <mat-toolbar class="footer">
      <span>© 2024 Music Player. All rights reserved.</span>
    </mat-toolbar>
  `,
  styles: [`
    .footer {
      background: #424242;
      color: white;
      font-size: 0.9rem;
      height: 48px;
      display: flex;
      justify-content: center;
    }
  `]
})
export class FooterComponent {} 