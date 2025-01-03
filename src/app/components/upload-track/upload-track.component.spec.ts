import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadTrackComponent } from './upload-track.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { FileValidationService } from '../../services/file-validation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('UploadTrackComponent', () => {
  let component: UploadTrackComponent;
  let fixture: ComponentFixture<UploadTrackComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockFileValidation: jasmine.SpyObj<FileValidationService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<UploadTrackComponent>>;

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj('Store', ['dispatch']);
    mockFileValidation = jasmine.createSpyObj('FileValidationService', ['validateAudioFile', 'validateImageFile']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        UploadTrackComponent
      ],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: FileValidationService, useValue: mockFileValidation },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadTrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate form', () => {
    expect(component.uploadForm.valid).toBeFalsy();
    
    component.uploadForm.patchValue({
      title: 'Test Track',
      artist: 'Test Artist',
      category: 'pop'
    });

    expect(component.uploadForm.valid).toBeTruthy();
  });

  it('should handle file selection', async () => {
    const file = new File([''], 'test.mp3', { type: 'audio/mp3' });
    const event = { target: { files: [file] } } as any;

    mockFileValidation.validateAudioFile.and.returnValue({ isValid: true });
    await component.onFileSelected(event);
    
    expect(component.selectedFile).toBe(file);
  });
}); 