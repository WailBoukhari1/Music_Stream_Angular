export const VALIDATION_CONSTANTS = {
  TITLE: {
    MAX_LENGTH: 50,
    MIN_LENGTH: 1
  },
  DESCRIPTION: {
    MAX_LENGTH: 200
  },
  FILE: {
    MAX_SIZE: 15 * 1024 * 1024, // 15MB
    AUDIO: {
      VALID_TYPES: [
        'audio/mp3',
        'audio/mpeg',
        'audio/wav',
        'audio/wave',
        'audio/ogg',
        'audio/vorbis'
      ],
      VALID_EXTENSIONS: ['.mp3', '.wav', '.ogg']
    },
    IMAGE: {
      VALID_TYPES: [
        'image/jpeg',
        'image/png',
        'image/webp'
      ],
      MAX_SIZE: 2 * 1024 * 1024 // 2MB
    }
  }
}; 