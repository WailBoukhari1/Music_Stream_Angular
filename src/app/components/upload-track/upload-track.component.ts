import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Track } from '../../models/track.model';
import * as TrackActions from '../../store/track/track.actions';
import { AudioService } from '../../services/audio.service';
import { FileSizePipe } from '../../pipes/file-size.pipe';
import { NotificationService } from '../../services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-upload-track',
  templateUrl: './upload-track.component.html',
  styleUrls: ['./upload-track.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatIconModule,
    FileSizePipe
  ]
})
export class UploadTrackComponent implements OnInit, OnDestroy {
 private destroy$ = new Subject<void>();
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  isUploading = false;
  uploadProgress = 0;
  isDragging = false;
  categories: ('pop' | 'rock' | 'rap' | 'cha3bi')[] = ['pop', 'rock', 'rap', 'cha3bi'];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UploadTrackComponent>,
    private store: Store,
    private audioService: AudioService,
    private notification: NotificationService
  ) {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(50)]],
      artist: ['', [Validators.required, Validators.maxLength(50)]],
      category: ['pop', Validators.required],
      description: ['', Validators.maxLength(200)]
    });
  }

  ngOnInit() {
    // Monitor form changes
   this.uploadForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('Form value changed:', this.uploadForm.value);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.handleFileSelection(files[0]);
    }
  }

  onAudioFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFileSelection(input.files[0]);
    }
  }

  handleFileSelection(file: File) {
    if (file.type.startsWith('audio/')) {
      this.selectedFile = file;
      
      // Get the file name without extension and convert to title case
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      const titleCased = fileName
        .replace(/-|_/g, ' ') // Replace dashes and underscores with spaces
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      // Update the form's title field
      this.uploadForm.patchValue({
        title: titleCased
      });
    } else {
      this.notification.error('Please select an audio file');
    }
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (file.type.startsWith('image/')) {
        this.selectedImage = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        this.notification.error('Please select an image file');
      }
    }
  }

  removeFile() {
    this.selectedFile = null;
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
        const duration = await this.audioService.calculateDuration(this.selectedFile);

        const track: Track = {
          id: crypto.randomUUID(),
          title: this.uploadForm.get('title')?.value || this.selectedFile.name,
          artist: this.uploadForm.get('artist')?.value || 'Unknown Artist',
          description: this.uploadForm.get('description')?.value || '',
          category: this.uploadForm.get('category')?.value,
          addedDate: new Date(),
          duration: duration as number,
          thumbnailUrl: this.imagePreview || undefined
        };

        this.store.dispatch(TrackActions.addTrack({ 
          track, 
          audioFile: this.selectedFile,
          thumbnail: this.selectedImage
        }));

        this.uploadProgress = 100;
        this.dialogRef.close(true);
        
      } catch (error) {
        console.error('Upload failed:', error);
        this.notification.error('Upload failed. Please try again.');
      } finally {
        this.isUploading = false;
      }
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

  get selectedFileInfo() {
    if (!this.selectedFile) return null;
    return {
      name: this.selectedFile.name,
      size: this.selectedFile.size
    };
  }

  public formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  close() {
    this.dialogRef.close();
  }
}