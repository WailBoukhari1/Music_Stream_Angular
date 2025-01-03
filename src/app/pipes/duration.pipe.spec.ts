import { DurationPipe } from './duration.pipe';

describe('DurationPipe', () => {
  let pipe: DurationPipe;

  beforeEach(() => {
    pipe = new DurationPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format seconds correctly', () => {
    expect(pipe.transform(61)).toBe('1:01');
    expect(pipe.transform(130)).toBe('2:10');
    expect(pipe.transform(3600)).toBe('60:00');
  });

  it('should handle zero', () => {
    expect(pipe.transform(0)).toBe('0:00');
  });

  it('should handle decimal numbers', () => {
    expect(pipe.transform(61.5)).toBe('1:01');
  });
}); 