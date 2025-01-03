import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditTrackDialogComponent } from './edit-track-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('EditTrackDialogComponent', () => {
  let component: EditTrackDialogComponent;
  let fixture: ComponentFixture<EditTrackDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<EditTrackDialogComponent>>;

  const mockTrack = {
    id: '1',
    title: 'Test Track',
    artist: 'Test Artist',
    category: 'pop' as const,
    addedDate: new Date(),
    duration: 180,
    description: 'Test Description'
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('MatDialogRef', ['close']);
    
    await TestBed.configureTestingModule({
      imports: [
        EditTrackDialogComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: spy },
        { provide: MAT_DIALOG_DATA, useValue: mockTrack }
      ]
    }).compileComponents();

    dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<EditTrackDialogComponent>>;
    
    fixture = TestBed.createComponent(EditTrackDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with track data', () => {
    expect(component.form.get('title')?.value).toBe(mockTrack.title);
    expect(component.form.get('artist')?.value).toBe(mockTrack.artist);
    expect(component.form.get('category')?.value).toBe(mockTrack.category);
    expect(component.form.get('description')?.value).toBe(mockTrack.description);
  });

  it('should validate title length', () => {
    const longTitle = 'a'.repeat(51);
    component.form.patchValue({ title: longTitle });
    expect(component.form.get('title')?.errors?.['maxlength']).toBeTruthy();
  });

  it('should validate description length', () => {
    const longDescription = 'a'.repeat(201);
    component.form.patchValue({ description: longDescription });
    expect(component.form.get('description')?.errors?.['maxlength']).toBeTruthy();
  });

  it('should close dialog with updated track when saving', () => {
    const updatedTitle = 'Updated Track';
    component.form.patchValue({ title: updatedTitle });
    
    component.save();
    
    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      ...mockTrack,
      title: updatedTitle
    });
  });
}); 