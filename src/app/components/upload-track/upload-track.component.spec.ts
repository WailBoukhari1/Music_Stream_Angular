import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadTrackComponent } from './upload-track.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { FileValidationService } from '../../services/file-validation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('UploadTrackComponent', () => {
  let component: UploadTrackComponent;
  let fixture: ComponentFixture<UploadTrackComponent>;

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const fileValidationSpy = jasmine.createSpyObj('FileValidationService', ['validateAudioFile', 'validateImageFile']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        UploadTrackComponent
      ],
      providers: [
        provideMockStore(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: FileValidationService, useValue: fileValidationSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadTrackComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 