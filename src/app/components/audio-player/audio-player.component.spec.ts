import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AudioPlayerComponent } from './audio-player.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { AudioService } from '../../services/audio.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { DurationPipe } from '../../pipes/duration.pipe';
import * as PlayerSelectors from '../../store/player/player.selectors';

describe('AudioPlayerComponent', () => {
  let component: AudioPlayerComponent;
  let fixture: ComponentFixture<AudioPlayerComponent>;
  let store: MockStore;
  let audioServiceSpy: jasmine.SpyObj<AudioService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AudioService', ['play', 'pause', 'seek', 'setVolume']);
    
    await TestBed.configureTestingModule({
      imports: [
        AudioPlayerComponent,
        MatIconModule,
        MatSliderModule,
        DurationPipe
      ],
      providers: [
        provideMockStore(),
        { provide: AudioService, useValue: spy }
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    audioServiceSpy = TestBed.inject(AudioService) as jasmine.SpyObj<AudioService>;
    
    // Setup default mock selectors
    store.overrideSelector(PlayerSelectors.selectCurrentTrack, null);
    store.overrideSelector(PlayerSelectors.selectIsPlaying, false);
    store.overrideSelector(PlayerSelectors.selectCurrentTime, 0);
    store.overrideSelector(PlayerSelectors.selectVolume, 1);
    store.overrideSelector(PlayerSelectors.selectError, null);
    store.overrideSelector(PlayerSelectors.selectLoadingState, 'success');
    store.overrideSelector(PlayerSelectors.selectPlaybackState, 'stopped');

    fixture = TestBed.createComponent(AudioPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle play/pause', () => {
    component.togglePlay();
    expect(audioServiceSpy.play).toHaveBeenCalled();

    store.overrideSelector(PlayerSelectors.selectIsPlaying, true);
    store.refreshState();
    fixture.detectChanges();

    component.togglePlay();
    expect(audioServiceSpy.pause).toHaveBeenCalled();
  });

  it('should update volume', () => {
    component.setVolume(50);
    expect(audioServiceSpy.setVolume).toHaveBeenCalledWith(0.5);
  });

  it('should seek to position', () => {
    component.seekTo(30);
    expect(audioServiceSpy.seek).toHaveBeenCalledWith(30);
  });
}); 