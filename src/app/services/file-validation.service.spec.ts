import { TestBed } from '@angular/core/testing';
import { FileValidationService } from './file-validation.service';

describe('FileValidationService', () => {
  let service: FileValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileValidationService);
  });

  it('should validate audio file size and type', () => {
    const validFile = new File([''], 'test.mp3', { type: 'audio/mp3' });
    Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }); // 1MB

    const result = service.validateAudioFile(validFile);
    expect(result.isValid).toBe(true);
  });

  it('should reject oversized audio files', () => {
    const largeFile = new File([''], 'large.mp3', { type: 'audio/mp3' });
    Object.defineProperty(largeFile, 'size', { value: 20 * 1024 * 1024 }); // 20MB

    const result = service.validateAudioFile(largeFile);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('size exceeds');
  });

  it('should validate image files', () => {
    const validImage = new File([''], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(validImage, 'size', { value: 500 * 1024 }); // 500KB

    const result = service.validateImageFile(validImage);
    expect(result.isValid).toBe(true);
  });
}); 