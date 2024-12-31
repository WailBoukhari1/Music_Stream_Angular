import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Track } from '../../models/track.model';
import * as TrackActions from '../../store/track/track.actions';
import { FileValidationService } from '../../services/file-validation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IndexedDBService } from '../../services/indexed-db.service';
import { AudioService } from '../../services/audio.service';

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
          <div class="file-input">
            <button mat-stroked-button type="button" (click)="audioInput.click()">
              <mat-icon>audio_file</mat-icon>
              {{ selectedFile ? selectedFile.name : 'Choose Audio File' }}
            </button>
            <input
              #audioInput
              type="file"
              accept="audio/mp3,audio/wav,audio/ogg"
              (change)="onFileSelected($event)"
              style="display: none"
            >
          </div>

          <div class="file-input">
            <button mat-stroked-button type="button" (click)="imageInput.click()">
              <mat-icon>image</mat-icon>
              {{ selectedImage ? 'Change Image' : 'Add Cover Image (Optional)' }}
            </button>
            <input
              #imageInput
              type="file"
              accept="image/jpeg,image/png"
              (change)="onImageSelected($event)"
              style="display: none"
            >
          </div>

          <div class="image-preview" *ngIf="imagePreview">
            <img [src]="imagePreview" alt="Cover preview">
            <button mat-icon-button color="warn" class="remove-image" (click)="removeImage()">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title">
            <mat-error *ngIf="uploadForm.get('title')?.errors?.['required']">
              Title is required
            </mat-error>
            <mat-error *ngIf="uploadForm.get('title')?.errors?.['maxlength']">
              Title must be less than 50 characters
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Artist</mat-label>
            <input matInput formControlName="artist">
            <mat-error *ngIf="uploadForm.get('artist')?.errors?.['required']">
              Artist is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
            <mat-error *ngIf="uploadForm.get('description')?.errors?.['maxlength']">
              Description must be less than 200 characters
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category">
              <mat-option value="pop">Pop</mat-option>
              <mat-option value="rock">Rock</mat-option>
              <mat-option value="rap">Rap</mat-option>
              <mat-option value="cha3bi">Cha3bi</mat-option>
            </mat-select>
            <mat-error *ngIf="uploadForm.get('category')?.errors?.['required']">
              Category is required
            </mat-error>
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

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .file-input {
      margin: 16px 0;
    }

    .image-preview {
      position: relative;
      width: 200px;
      margin: 0 auto;
    }

    .image-preview img {
      width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .remove-image {
      position: absolute;
      top: -10px;
      right: -10px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .progress-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    mat-progress-bar {
      flex: 1;
    }
  `]
})
export class UploadTrackComponent {
  uploadForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(50)]],
    artist: ['', [Validators.required]],
    description: ['', [Validators.maxLength(200)]],
    category: ['', [Validators.required]],
    duration: [0]
  });

  selectedFile: File | null = null;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  isUploading = false;
  uploadProgress = 0;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private fileValidation: FileValidationService,
    private snackBar: MatSnackBar,
    private indexedDB: IndexedDBService,
    public dialogRef: MatDialogRef<UploadTrackComponent>,
    private audioService: AudioService
  ) {}

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const validation = this.fileValidation.validateAudioFile(file);
      if (!validation.isValid) {
        this.snackBar.open(validation.error || 'Invalid file', 'Close', {
          duration: 3000
        });
        return;
      }
      this.selectedFile = file;
      // Calculate duration when file is selected
      const duration = await this.audioService.calculateDuration(file);
      this.uploadForm.patchValue({
        title: file.name.replace(/\.[^/.]+$/, ''),
        duration: duration
      });
    }
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const validation = this.fileValidation.validateImageFile(file);
      if (!validation.isValid) {
        this.snackBar.open(validation.error || 'Invalid image', 'Close', {
          duration: 3000
        });
        return;
      }
      this.selectedImage = file;
      this.createImagePreview(file);
    }
  }

  private createImagePreview(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  async uploadTrack() {
    if (this.uploadForm.valid && this.selectedFile) {
      this.isUploading = true;
      
      try {
        const title = this.uploadForm.get('title')?.value ?? '';
        const artist = this.uploadForm.get('artist')?.value ?? '';

        // Check for duplicates
        const isDuplicate = await this.indexedDB.checkDuplicateTrack(title, artist);
        if (isDuplicate) {
          this.snackBar.open(
            'A track with the same title and artist already exists!', 
            'Close', 
            { duration: 5000 }
          );
          this.isUploading = false;
          return;
        }

        console.log('Starting upload for file:', this.selectedFile);

        const track: Track = {
          id: crypto.randomUUID(),
          title: title,
          artist: artist,
          description: this.uploadForm.get('description')?.value || '',
          category: this.uploadForm.get('category')?.value || '',
          addedDate: new Date(),
          duration: 0,
          audioUrl: '',
          thumbnailUrl: this.imagePreview || undefined
        };

        this.store.dispatch(TrackActions.addTrack({ 
          track, 
          audioFile: this.selectedFile,
          thumbnail: this.selectedImage
        }));
        
        this.dialogRef.close();
        this.snackBar.open('Track uploaded successfully', 'Close', {
          duration: 3000
        });
      } catch (error) {
        console.error('Upload failed:', error);
        this.snackBar.open('Upload failed. Please try again.', 'Close', {
          duration: 3000
        });
      }
      this.isUploading = false;
    } else {
      this.snackBar.open('Please fill all required fields and select an audio file', 'Close', {
        duration: 3000
      });
    }
  }
}