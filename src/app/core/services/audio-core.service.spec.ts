import { TestBed } from '@angular/core/testing';

import { AudioCoreService } from './audio-core.service';

describe('AudioCoreService', () => {
  let service: AudioCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
