@Injectable({
  providedIn: 'root'
})
export class FileValidationService {
  validateAudioFile(file: File): boolean {
    const validTypes = ['audio/mp3', 'audio/wav', 'audio/ogg'];
    const maxSize = 15 * 1024 * 1024; // 15MB

    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  validateImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    return validTypes.includes(file.type) && file.size <= maxSize;
  }
} 