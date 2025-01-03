import { Track } from './track.model';

describe('Track Model', () => {
  it('should create a valid track object', () => {
    const track: Track = {
      id: '1',
      title: 'Test Track',
      artist: 'Test Artist',
      description: 'Test Description',
      addedDate: new Date(),
      duration: 180,
      category: 'pop',
      thumbnailUrl: 'test.jpg',
      order: 1
    };

    expect(track.id).toBeDefined();
    expect(track.title).toBe('Test Track');
    expect(track.category).toMatch(/pop|rock|rap|cha3bi/);
  });
}); 