import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditTrackDialogComponent } from './edit-track-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { FileValidationService } from '../../services/file-validation.service';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('EditTrackDialogComponent', () => {
  let component: EditTrackDialogComponent;
  let fixture: ComponentFixture<EditTrackDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EditTrackDialogComponent>>;

  const mockTrack = {
    id: '1',
    title: 'Test Track',
    artist: 'Test Artist',
    category: 'pop' as const,
    description: 'Test Description',
    duration: 180,
    addedDate: new Date()
  };

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        EditTrackDialogComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        provideMockStore(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockTrack }
      ]
    }).compileComponents();

    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<EditTrackDialogComponent>>;

    fixture = TestBed.createComponent(EditTrackDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with track data', () => {
    expect(component.editForm.get('title')?.value).toBe(mockTrack.title);
    expect(component.editForm.get('artist')?.value).toBe(mockTrack.artist);
    expect(component.editForm.get('category')?.value).toBe(mockTrack.category);
    expect(component.editForm.get('description')?.value).toBe(mockTrack.description);
  });
}); 