import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MusicLibraryComponent } from './music-library.component';
import { Store } from '@ngrx/store';
import { AudioService } from '../../services/audio.service';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('MusicLibraryComponent', () => {
  let component: MusicLibraryComponent;
  let fixture: ComponentFixture<MusicLibraryComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockAudioService: jasmine.SpyObj<AudioService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj('Store', ['dispatch', 'select']);
    mockAudioService = jasmine.createSpyObj('AudioService', ['playTrack']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    mockStore.select.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        MusicLibraryComponent
      ],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: AudioService, useValue: mockAudioService },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MusicLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter tracks', () => {
    const mockTracks = [
      { title: 'Test Track', artist: 'Test Artist', category: 'pop', duration: 180 }
    ];
    const filters = {
      search: 'Test',
      category: 'pop',
      duration: 'medium'
    };

    const filtered = component['filterTracks'](mockTracks as any, filters);
    expect(filtered.length).toBe(1);
  });

  it('should handle track sorting', () => {
    const mockTracks = [
      { title: 'B Track', addedDate: new Date(2023, 0, 1) },
      { title: 'A Track', addedDate: new Date(2023, 0, 2) }
    ];

    component.filterForm.patchValue({ sortBy: 'title', sortDirection: 'asc' });
    const sorted = component.sortTracks(mockTracks as any);
    expect(sorted[0].title).toBe('A Track');
  });
}); 