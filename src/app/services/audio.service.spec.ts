import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { AudioService } from './audio.service';
import { IndexedDBService } from './indexed-db.service';
import { of } from 'rxjs';

describe('AudioService', () => {
  let service: AudioService;
  let mockStore: jasmine.SpyObj<Store>;
  let mockIndexedDB: jasmine.SpyObj<IndexedDBService>;

  beforeEach(() => {
    mockStore = jasmine.createSpyObj('Store', ['dispatch', 'select']);
    mockIndexedDB = jasmine.createSpyObj('IndexedDBService', ['getAudioFile']);

    mockStore.select.and.returnValue(of(null));
    mockIndexedDB.getAudioFile.and.returnValue(Promise.resolve(new File([], 'test.mp3')));

    TestBed.configureTestingModule({
      providers: [
        AudioService,
        { provide: Store, useValue: mockStore },
        { provide: IndexedDBService, useValue: mockIndexedDB }
      ]
    });

    service = TestBed.inject(AudioService);
  });

  it('should calculate audio duration', async () => {
    const file = new File([], 'test.mp3');
    const duration = await service.calculateDuration(file);
    expect(duration).toBeGreaterThanOrEqual(0);
  });

  it('should handle play/pause states', () => {
    service.play();
    expect(mockStore.dispatch).toHaveBeenCalled();

    service.pause();
    expect(mockStore.dispatch).toHaveBeenCalled();
  });
}); 