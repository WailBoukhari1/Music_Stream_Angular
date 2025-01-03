import { Injectable } from '@angular/core';
import { VALIDATION_CONSTANTS } from '../constants/validation.constants';

@Injectable({
  providedIn: 'root'
})
export class FileValidationService {
  
  validateAudioFile(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > VALIDATION_CONSTANTS.FILE.MAX_SIZE) {
      return {
        isValid: false,
        error: `File size exceeds ${VALIDATION_CONSTANTS.FILE.MAX_SIZE / (1024 * 1024)}MB limit`
      };
    }

    // Check file type
    const isValidType = VALIDATION_CONSTANTS.FILE.AUDIO.VALID_TYPES.includes(file.type) ||
      VALIDATION_CONSTANTS.FILE.AUDIO.VALID_EXTENSIONS.some(ext => 
        file.name.toLowerCase().endsWith(ext)
      );

    if (!isValidType) {
      return {
        isValid: false,
        error: 'Invalid file format. Supported formats: MP3, WAV, OGG'
      };
    }

    return { isValid: true };
  }

  validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > VALIDATION_CONSTANTS.FILE.IMAGE.MAX_SIZE) {
      return {
        isValid: false,
        error: `Image size exceeds ${VALIDATION_CONSTANTS.FILE.IMAGE.MAX_SIZE / (1024 * 1024)}MB limit`
      };
    }

    // Check file type
    if (!VALIDATION_CONSTANTS.FILE.IMAGE.VALID_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid image format. Supported formats: JPEG, PNG, WEBP'
      };
    }

    return { isValid: true };
  }

  async validateImageDimensions(file: File): Promise<{ isValid: boolean; error?: string }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width > 2000 || img.height > 2000) {
          resolve({
            isValid: false,
            error: 'Image dimensions should not exceed 2000x2000 pixels'
          });
        }
        resolve({ isValid: true });
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve({
          isValid: false,
          error: 'Failed to load image for validation'
        });
      };
    });
  }
} 