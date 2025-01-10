import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrackDetailComponent } from './track-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { MatDialog } from '@angular/material/dialog';
import { AudioService } from '../../services/audio.service';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TrackDetailComponent', () => {
  let component: TrackDetailComponent;
  let fixture: ComponentFixture<TrackDetailComponent>;
  let audioService: jasmine.SpyObj<AudioService>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const audioServiceSpy = jasmine.createSpyObj('AudioService', ['playTrack']);

    await TestBed.configureTestingModule({
      imports: [
        TrackDetailComponent,
        NoopAnimationsModule
      ],
      providers: [
        provideMockStore(),
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: AudioService, useValue: audioServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => '1' }),
            snapshot: { params: { id: '1' } }
          }
        }
      ]
    }).compileComponents();

    audioService = TestBed.inject(AudioService) as jasmine.SpyObj<AudioService>;
    fixture = TestBed.createComponent(TrackDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 