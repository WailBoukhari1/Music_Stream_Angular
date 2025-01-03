import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrackDetailComponent } from './track-detail.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AudioService } from '../../services/audio.service';
import { IndexedDBService } from '../../services/indexed-db.service';

describe('TrackDetailComponent', () => {
  let component: TrackDetailComponent;
  let fixture: ComponentFixture<TrackDetailComponent>;
  let store: MockStore;
  let audioServiceSpy: jasmine.SpyObj<AudioService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const mockTrack = {
    id: '1',
    title: 'Test Track',
    artist: 'Test Artist',
    category: 'pop' as const,
    addedDate: new Date(),
    duration: 180
  };

  beforeEach(async () => {
    const audioSpy = jasmine.createSpyObj('AudioService', ['playTrack', 'pause']);
    const dialogSpyObj = jasmine.createSpyObj('MatDialog', ['open']);
    const indexedDBSpy = jasmine.createSpyObj('IndexedDBService', ['getTrackWithFiles']);

    await TestBed.configureTestingModule({
      imports: [TrackDetailComponent],
      providers: [
        provideMockStore(),
        { provide: ActivatedRoute, useValue: { params: of({ id: '1' }), queryParams: of({}) } },
        { provide: AudioService, useValue: audioSpy },
        { provide: MatDialog, useValue: dialogSpyObj },
        { provide: IndexedDBService, useValue: indexedDBSpy }
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    audioServiceSpy = TestBed.inject(AudioService) as jasmine.SpyObj<AudioService>;
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    fixture = TestBed.createComponent(TrackDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should play track', () => {
    component.playTrack(mockTrack);
    expect(audioServiceSpy.playTrack).toHaveBeenCalledWith(mockTrack);
  });

  it('should open edit dialog', () => {
    component.editTrack(mockTrack);
    expect(dialogSpy.open).toHaveBeenCalled();
  });
}); 