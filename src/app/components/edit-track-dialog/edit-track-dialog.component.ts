import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Track } from '../../models/track.model';

@Component({
  selector: 'app-edit-track-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>Edit Track</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="fill">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title">
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Artist</mat-label>
          <input matInput formControlName="artist">
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Category</mat-label>
          <mat-select formControlName="category">
            <mat-option value="pop">Pop</mat-option>
            <mat-option value="rock">Rock</mat-option>
            <mat-option value="rap">Rap</mat-option>
            <mat-option value="cha3bi">Cha3bi</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!form.valid" (click)="save()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-width: 400px;
    }
    mat-form-field {
      width: 100%;
    }
  `]
})
export class EditTrackDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditTrackDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Track
  ) {
    this.form = this.fb.group({
      title: [data.title, Validators.required],
      artist: [data.artist, Validators.required],
      category: [data.category, Validators.required],
      description: [data.description]
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close({
        ...this.data,
        ...this.form.value
      });
    }
  }
} 