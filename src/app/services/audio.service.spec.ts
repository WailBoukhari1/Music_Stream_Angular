import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AudioService } from './audio.service';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { IndexedDBService } from './indexed-db.service';
import { of } from 'rxjs';

describe('AudioService', () => {
  let service: AudioService;
  let store: MockStore;
  let indexedDBSpy: jasmine.SpyObj<IndexedDBService>;

  // Increase timeout for async operations
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('IndexedDBService', ['getAudioFile']);
    spy.getAudioFile.and.returnValue(Promise.resolve(new File([], 'test.mp3')));

    TestBed.configureTestingModule({
      providers: [
        AudioService,
        provideMockStore({
          initialState: {
            player: {
              currentTrack: null,
              isPlaying: false,
              currentTime: 0,
              volume: 1,
              error: null
            }
          }
        }),
        { provide: IndexedDBService, useValue: spy }
      ]
    });

    service = TestBed.inject(AudioService);
    store = TestBed.inject(MockStore);
    indexedDBSpy = TestBed.inject(IndexedDBService) as jasmine.SpyObj<IndexedDBService>;
  });

  it('should calculate audio duration', fakeAsync(() => {
    const testFile = new File([], 'test.mp3');
    let metadataCallback: Function;
    
    const mockAudio = {
      duration: 180,
      addEventListener: (event: string, callback: Function) => {
        if (event === 'loadedmetadata') {
          metadataCallback = callback;
        }
      },
      removeEventListener: () => {},
      load: () => {
        // Simulate the audio loading
        setTimeout(() => {
          if (metadataCallback) {
            metadataCallback();
          }
        }, 0);
      },
      src: '',
      play: () => Promise.resolve(),
      pause: () => {}
    };

    // Mock the Audio constructor
    spyOn(window, 'Audio').and.returnValue(mockAudio as any);

    let actualDuration: number | undefined;
    
    service.calculateDuration(testFile).then(duration => {
      actualDuration = duration;
    });

    // Trigger the load event
    mockAudio.load();
    
    // Advance timers to process all pending async operations
    tick(0);  // Process the setTimeout
    tick(0);  // Process any remaining microtasks

    expect(actualDuration).toBe(180);
  }));

  afterEach(() => {
    store.resetSelectors();
  });
}); 