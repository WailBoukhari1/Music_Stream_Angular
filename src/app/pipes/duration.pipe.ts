import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  standalone: true
})
export class DurationPipe implements PipeTransform {
  transform(value: number | string | null | undefined, format: string = 'mm:ss'): string {
    let seconds = 0;
    
    if (typeof value === 'string') {
      seconds = parseInt(value, 10);
    } else if (typeof value === 'number') {
      seconds = value;
    }

    if (!seconds || isNaN(seconds)) {
      return '0:00';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (format === 'mm:ss') {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes} min ${remainingSeconds} sec`;
  }
} 