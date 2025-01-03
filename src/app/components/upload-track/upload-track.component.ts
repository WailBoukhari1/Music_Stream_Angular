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
  templateUrl: './upload-track.component.html',
  styleUrls: ['./upload-track.component.scss']
})
export class UploadTrackComponent {
  uploadForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(50)]],
    artist: ['', [Validators.required]],
    description: ['', [Validators.maxLength(200)]],
    category: ['pop' as const, [Validators.required]],
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
      this.uploadProgress = 0;
      
      try {
        // Simulate upload progress
        const interval = setInterval(() => {
          if (this.uploadProgress < 90) {
            this.uploadProgress += 10;
          }
        }, 500);

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
          category: (this.uploadForm.get('category')?.value || 'pop') as 'pop' | 'rock' | 'rap' | 'cha3bi',
          addedDate: new Date(),
          duration: 0,
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

        clearInterval(interval);
        this.uploadProgress = 100;
      } catch (error) {
        this.uploadProgress = 0;
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

  getErrorMessage(controlName: string): string {
    const control = this.uploadForm.get(controlName);
    if (control?.hasError('required')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
    }
    if (control?.hasError('maxlength')) {
      const maxLength = controlName === 'title' ? 50 : 200;
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} cannot exceed ${maxLength} characters`;
    }
    return '';
  }

  async validateFiles(audioFile: File, imageFile?: File): Promise<boolean> {
    // Audio file validation
    if (audioFile.size > 15 * 1024 * 1024) {
      this.snackBar.open('Audio file must not exceed 15MB', 'Close', { duration: 3000 });
      return false;
    }

    const validAudioTypes = ['audio/mp3', 'audio/wav', 'audio/ogg'];
    if (!validAudioTypes.includes(audioFile.type)) {
      this.snackBar.open('Only MP3, WAV, and OGG formats are allowed', 'Close', { duration: 3000 });
      return false;
    }

    // Image file validation
    if (imageFile) {
      const validImageTypes = ['image/jpeg', 'image/png'];
      if (!validImageTypes.includes(imageFile.type)) {
        this.snackBar.open('Only JPEG and PNG images are allowed', 'Close', { duration: 3000 });
        return false;
      }
    }

    return true;
  }
}