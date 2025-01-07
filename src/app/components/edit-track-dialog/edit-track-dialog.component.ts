import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Track } from '../../models/track.model';
import * as TrackActions from '../../store/track/track.actions';
import { FileValidationService } from '../../services/file-validation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FileSizePipe } from '../../pipes/file-size.pipe';

@Component({
  selector: 'app-edit-track-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    FileSizePipe
  ],
  template: `
    <div class="edit-dialog">
      <h2>Edit Track</h2>
      
      <form [formGroup]="editForm" (ngSubmit)="onSubmit()">
        <div class="form-container">
          <div class="form-fields">
            <mat-form-field appearance="outline">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title" placeholder="Enter track title">
              <mat-error *ngIf="editForm.get('title')?.invalid">Title is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Artist</mat-label>
              <input matInput formControlName="artist" placeholder="Enter artist name">
              <mat-error *ngIf="editForm.get('artist')?.invalid">Artist is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" placeholder="Enter track description"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                <mat-option value="pop">Pop</mat-option>
                <mat-option value="rock">Rock</mat-option>
                <mat-option value="rap">Rap</mat-option>
                <mat-option value="cha3bi">Cha3bi</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="thumbnail-section">
            <div class="current-thumbnail" *ngIf="data.thumbnailUrl && !selectedImage">
              <img [src]="data.thumbnailUrl" alt="Current thumbnail">
              <button mat-icon-button color="warn" type="button" (click)="removeThumbnail()">
                <mat-icon>delete</mat-icon>
              </button>
            </div>

            <div class="upload-box" (click)="imageInput.click()" *ngIf="!selectedImage && !data.thumbnailUrl">
              <mat-icon>image</mat-icon>
              <p class="upload-text">
                <strong>Update Cover Image</strong>
                JPG, PNG (max. 2MB)
              </p>
              <input #imageInput type="file" accept="image/*" (change)="onImageSelected($event)" hidden>
            </div>

            <div class="file-preview" *ngIf="selectedImage">
              <img [src]="imagePreview" class="preview-image" alt="New thumbnail">
              <div class="file-info">
                <div class="file-name">New Cover Image</div>
                <div class="file-size">{{ selectedImage.size | fileSize }}</div>
              </div>
              <button mat-icon-button type="button" (click)="removeImage()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <div class="dialog-actions">
          <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="!editForm.valid">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .edit-dialog {
      background: rgba(24, 24, 24, 0.95);
      border-radius: 20px;
      padding: 2.5rem;
      max-width: 600px;
      width: 100%;

      h2 {
        font-size: 2rem;
        font-weight: 700;
        margin: 0 0 2rem;
        background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0.7));
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }

      .form-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
      }

      .thumbnail-section {
        .current-thumbnail {
          position: relative;
          width: 100%;
          border-radius: 12px;
          overflow: hidden;

          img {
            width: 100%;
            height: 200px;
            object-fit: cover;
          }

          button {
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(0, 0, 0, 0.5);
            
            &:hover {
              background: rgba(220, 20, 60, 0.8);
            }
          }
        }

        .upload-box {
          background: rgba(255, 255, 255, 0.05);
          border: 2px dashed rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(220, 20, 60, 0.5);
          }

          mat-icon {
            font-size: 2.5rem;
            width: 2.5rem;
            height: 2.5rem;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 1rem;
          }

          .upload-text {
            color: rgba(255, 255, 255, 0.7);
            font-size: 1rem;
            margin: 0;

            strong {
              display: block;
              color: #dc143c;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }
          }
        }

        .file-preview {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 1.25rem;
          border-radius: 12px;

          .preview-image {
            width: 70px;
            height: 70px;
            border-radius: 8px;
            object-fit: cover;
          }

          .file-info {
            flex: 1;
            
            .file-name {
              color: white;
              font-weight: 500;
              margin-bottom: 0.5rem;
            }

            .file-size {
              color: rgba(255, 255, 255, 0.6);
              font-size: 0.9rem;
            }
          }

          button {
            color: #dc143c;
          }
        }
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1.5rem;
        margin-top: 2rem;

        button {
          min-width: 120px;
          height: 44px;
          border-radius: 22px;
          font-weight: 500;

          &[mat-raised-button] {
            background: linear-gradient(135deg, #dc143c 0%, #ff1464 100%);
            box-shadow: 0 4px 15px rgba(220, 20, 60, 0.3);
            
            &:hover {
              box-shadow: 0 6px 20px rgba(220, 20, 60, 0.4);
              transform: translateY(-1px);
            }

            &:disabled {
              background: rgba(255, 255, 255, 0.1);
              color: rgba(255, 255, 255, 0.3);
            }
          }
        }
      }

      @media (max-width: 600px) {
        padding: 2rem;
        
        h2 {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
        }

        .dialog-actions {
          flex-direction: column-reverse;
          gap: 1rem;
          
          button {
            width: 100%;
          }
        }
      }
    }
  `]
})
export class EditTrackDialogComponent {
  editForm: FormGroup;
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private fileValidation: FileValidationService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditTrackDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Track
  ) {
    this.editForm = this.fb.group({
      title: [data.title, [Validators.required, Validators.maxLength(50)]],
      artist: [data.artist, [Validators.required]],
      description: [data.description, [Validators.maxLength(200)]],
      category: [data.category, [Validators.required]]
    });
  }

  onImageSelected(event: Event): void {
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

  createImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  removeThumbnail(): void {
    this.data = { ...this.data, thumbnailUrl: undefined };
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      const updatedTrack: Track = {
        ...this.data,
        ...this.editForm.value,
        thumbnailUrl: this.imagePreview || this.data.thumbnailUrl
      };

      this.store.dispatch(TrackActions.updateTrack({ 
        track: updatedTrack,
        thumbnail: this.selectedImage
      }));
      this.dialogRef.close(true);
    }
  }
} 