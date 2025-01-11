import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { Track } from '../../models/track.model';
import * as TrackActions from '../../store/track/track.actions';

@Component({
  selector: 'app-edit-track-dialog',
  template: `
    <div class="edit-dialog">
      <h2 mat-dialog-title>Edit Track</h2>
      
      <form [formGroup]="editForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" placeholder="Enter title">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Artist</mat-label>
          <input matInput formControlName="artist" placeholder="Enter artist">
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

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" 
                    placeholder="Enter description"></textarea>
        </mat-form-field>

        <div class="dialog-actions">
          <button mat-button type="button" (click)="onCancel()">Cancel</button>
          <button mat-raised-button color="primary" 
                  type="submit" 
                  [disabled]="!editForm.valid">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .edit-dialog {
      padding: 1.5rem;
      background: #1e1e1e;
      color: white;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
    }

    ::ng-deep {
      .mat-mdc-form-field {
        width: 100%;
      }

      .mat-mdc-dialog-container {
        --mdc-dialog-container-color: #1e1e1e;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule
  ]
})
export class EditTrackDialogComponent {
  editForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditTrackDialogComponent>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public data: Track
  ) {
    this.editForm = this.fb.group({
      title: [data.title, [Validators.required, Validators.maxLength(50)]],
      artist: [data.artist, [Validators.required, Validators.maxLength(50)]],
      category: [data.category, Validators.required],
      description: [data.description || '', Validators.maxLength(200)]
    });
  }

  onSubmit() {
    if (this.editForm.valid) {
      const updatedTrack: Track = {
        ...this.data,
        ...this.editForm.value
      };

      this.store.dispatch(TrackActions.updateTrack({ track: updatedTrack }));
      this.store.dispatch(TrackActions.loadTracks());
      this.dialogRef.close(true);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
} 