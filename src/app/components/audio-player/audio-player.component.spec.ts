import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AudioPlayerComponent } from './audio-player.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { AudioService } from '../../services/audio.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import * as PlayerSelectors from '../../store/player/player.selectors';
import { of } from 'rxjs';

describe('AudioPlayerComponent', () => {
  let component: AudioPlayerComponent;
  let fixture: ComponentFixture<AudioPlayerComponent>;
  let audioServiceSpy: jasmine.SpyObj<AudioService>;
  let store: MockStore;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AudioService', 
      ['play', 'pause', 'seek', 'setVolume', 'cleanup'],
      {
        currentTrack$: of(null),
        isPlaying$: of(false),
        currentTime$: of(0),
        volume$: of(1),
        duration$: of(0)
      }
    );
    
    await TestBed.configureTestingModule({
      imports: [
        AudioPlayerComponent,
        NoopAnimationsModule
      ],
      providers: [
        provideMockStore({
          initialState: {
            player: {
              currentTrack: null,
              isPlaying: false,
              currentTime: 0,
              volume: 1,
              error: null,
              loadingState: 'success',
              playbackState: 'stopped'
            }
          },
          selectors: [
            { selector: PlayerSelectors.selectCurrentTrack, value: null },
            { selector: PlayerSelectors.selectIsPlaying, value: false },
            { selector: PlayerSelectors.selectCurrentTime, value: 0 },
            { selector: PlayerSelectors.selectVolume, value: 1 },
            { selector: PlayerSelectors.selectError, value: null },
            { selector: PlayerSelectors.selectLoadingState, value: 'success' },
            { selector: PlayerSelectors.selectPlaybackState, value: 'stopped' }
          ]
        }),
        { provide: AudioService, useValue: spy }
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    audioServiceSpy = TestBed.inject(AudioService) as jasmine.SpyObj<AudioService>;
    
    // Mock all store selects
    spyOn(store, 'select').and.returnValue(of(null));
    
    fixture = TestBed.createComponent(AudioPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    store.resetSelectors();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 