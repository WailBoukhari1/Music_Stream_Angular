// import { TestBed } from '@angular/core/testing';
// import { IndexedDBService } from './indexed-db.service';

// describe('IndexedDBService', () => {
//   let service: IndexedDBService;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       providers: [IndexedDBService]
//     });
//     service = TestBed.inject(IndexedDBService);
//   });

//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });

//   it('should validate file size correctly', async () => {
//     const validFile = new File([''], 'test.mp3', { type: 'audio/mp3' });
//     Object.defineProperty(validFile, 'size', { value: 14 * 1024 * 1024 });

//     const invalidFile = new File([''], 'test.mp3', { type: 'audio/mp3' });
//     Object.defineProperty(invalidFile, 'size', { value: 16 * 1024 * 1024 });

//     expect(await service.validateFileSize(validFile)).toBe(true);
//     expect(await service.validateFileSize(invalidFile)).toBe(false);
//   });

//   it('should validate audio format correctly', async () => {
//     const validFormats = ['audio/mp3', 'audio/wav', 'audio/ogg'];
//     const invalidFormats = ['audio/aac', 'audio/m4a'];

//     for (const format of validFormats) {
//       const file = new File([''], 'test.mp3', { type: format });
//       expect(await service.validateAudioFormat(file)).toBe(true);
//     }

//     for (const format of invalidFormats) {
//       const file = new File([''], 'test.m4a', { type: format });
//       expect(await service.validateAudioFormat(file)).toBe(false);
//     }
//   });
// }); 