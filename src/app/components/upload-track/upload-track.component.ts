import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Track } from '../../models/track.model';
import * as TrackActions from '../../store/track/track.actions';
import { IndexedDBService } from '../../services/indexed-db.service';

@Component({
  selector: 'app-upload-track',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatIconModule
  ],
  template: `
    <div class="upload-dialog">
      <h2 mat-dialog-title>Upload Music</h2>
      
      <mat-dialog-content>
        <form [formGroup]="uploadForm">
          <div class="file-inputs">
            <div class="upload-section">
              <button mat-stroked-button type="button" (click)="audioInput.click()">
                <mat-icon>audio_file</mat-icon>
                {{ selectedFile ? selectedFile.name : 'Choose Audio File' }}
              </button>
              <input
                #audioInput
                type="file"
                accept="audio/*"
                (change)="onFileSelected($event)"
                style="display: none"
              >
            </div>

            <div class="upload-section">
              <button mat-stroked-button type="button" (click)="thumbnailInput.click()">
                <mat-icon>image</mat-icon>
                {{ selectedThumbnail ? 'Change Thumbnail' : 'Add Thumbnail' }}
              </button>
              <input
                #thumbnailInput
                type="file"
                accept="image/*"
                (change)="onThumbnailSelected($event)"
                style="display: none"
              >
            </div>

            <div class="thumbnail-preview" *ngIf="thumbnailPreview">
              <img [src]="thumbnailPreview" alt="Thumbnail preview">
            </div>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" required>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Artist</mat-label>
            <input matInput formControlName="artist" required>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Description</mat-label>
            <input matInput formControlName="description" maxlength="200">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category" required>
              <mat-option value="pop">Pop</mat-option>
              <mat-option value="rock">Rock</mat-option>
              <mat-option value="jazz">Jazz</mat-option>
              <mat-option value="classical">Classical</mat-option>
              <mat-option value="other">Other</mat-option>
            </mat-select>
          </mat-form-field>

          <div *ngIf="isUploading" class="progress-section">
            <mat-progress-bar mode="determinate" [value]="uploadProgress"></mat-progress-bar>
            <span>{{ uploadProgress }}%</span>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close()">Cancel</button>
        <button 
          mat-raised-button 
          color="primary" 
          [disabled]="!uploadForm.valid || !selectedFile || isUploading"
          (click)="uploadTrack()"
        >
          Upload
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .upload-dialog {
      padding: 20px;
    }

    mat-dialog-content {
      min-width: 400px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .file-inputs {
      display: grid;
      gap: 16px;
    }

    .upload-section {
      margin: 16px 0;
    }

    .progress-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    mat-progress-bar {
      flex: 1;
    }

    .thumbnail-preview {
      width: 100%;
      max-width: 200px;
      margin: 0 auto;
    }

    .thumbnail-preview img {
      width: 100%;
      height: auto;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `]
})
export class UploadTrackComponent {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  selectedThumbnail: File | null = null;
  thumbnailPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private indexedDB: IndexedDBService,
    public dialogRef: MatDialogRef<UploadTrackComponent>
  ) {
    this.uploadForm = this.fb.group({
      title: ['', [
        Validators.required, 
        Validators.maxLength(50)
      ]],
      description: ['', [
        Validators.maxLength(200)
      ]],
      artist: ['', Validators.required],
      category: ['', Validators.required]
    });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) { // 15MB limit
        alert('File size must be less than 15MB');
        return;
      }
      this.selectedFile = file;
      if (!this.uploadForm.get('title')?.value) {
        this.uploadForm.patchValue({
          title: file.name.replace(/\.[^/.]+$/, "")
        });
      }
    }
  }

  onThumbnailSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('Thumbnail size must be less than 2MB');
        return;
      }
      this.selectedThumbnail = file;
      this.createThumbnailPreview(file);
    }
  }

  private createThumbnailPreview(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.thumbnailPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async uploadTrack() {
    if (this.uploadForm.valid && this.selectedFile) {
      this.isUploading = true;
      
      try {
        const track: Track = {
          id: crypto.randomUUID(),
          title: this.uploadForm.get('title')?.value,
          artist: this.uploadForm.get('artist')?.value,
          description: this.uploadForm.get('description')?.value || '',
          category: this.uploadForm.get('category')?.value,
          addedDate: new Date(),
          duration: 0,
          audioUrl: URL.createObjectURL(this.selectedFile),
          thumbnailUrl: this.thumbnailPreview || undefined
        };

        await this.indexedDB.addTrack(track, this.selectedFile, this.selectedThumbnail);
        this.store.dispatch(TrackActions.addTrack({ 
          track, 
          audioFile: this.selectedFile, 
          thumbnail: this.selectedThumbnail 
        }));
        
        this.dialogRef.close();
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed. Please try again.');
      }
      this.isUploading = false;
    }
  }
}