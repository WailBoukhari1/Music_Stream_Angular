import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class FileValidationService {
  validateAudioFile(file: File): { isValid: boolean; error?: string } {
    const validTypes = [
      'audio/mpeg', 'audio/mp3',  // MP3
      'audio/wav', 'audio/wave',  // WAV
      'audio/ogg', 'audio/oga'    // OGG
    ];
    const maxSize = 15 * 1024 * 1024; // 15MB

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 15MB' };
    }
    if (!validTypes.includes(file.type)) {
      return { isValid: false, error: 'Only MP3, WAV and OGG files are supported' };
    }
    return { isValid: true };
  }

  validateImageFile(file: File): { isValid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/png'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      return { isValid: false, error: 'Only JPEG and PNG images are supported' };
    }
    if (file.size > maxSize) {
      return { isValid: false, error: 'Image size must be less than 2MB' };
    }
    return { isValid: true };
  }
} 