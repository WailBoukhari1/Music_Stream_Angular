import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map, switchMap } from 'rxjs';

interface GeniusSearchResponse {
  hits: Array<{
    result: {
      id: number;
      title: string;
      artist_names: string;
      url: string;
    };
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class LyricsService {
  private readonly BASE_URL = 'https://genius-song-lyrics1.p.rapidapi.com';
  private readonly RAPID_API_KEY = '1bb28e4daamsh1d1199e75972aa4p17d364jsn1fb7bd442074';

  constructor(private http: HttpClient) {}

  searchLyrics(trackTitle: string, artist: string): Observable<string> {
    const headers = {
      'x-rapidapi-host': 'genius-song-lyrics1.p.rapidapi.com',
      'x-rapidapi-key': this.RAPID_API_KEY,
    };

    const searchQuery = `${trackTitle} ${artist}`.trim();

    return this.http
      .get<GeniusSearchResponse>(`${this.BASE_URL}/search/`, {
        headers,
        params: {
          q: searchQuery,
          per_page: '10',
          page: '1',
        },
      })
      .pipe(
        switchMap((response) => {
          if (!response?.hits?.length) {
            return of('No results found for this track.');
          }

          // Get the first result (best match)
          const bestMatch = response.hits[0].result;

          // Return the song URL or other details
          return of(
            `Title: ${bestMatch.title}\nArtist: ${bestMatch.artist_names}\nView on Genius: ${bestMatch.url}`
          );
        }),
        catchError(() => of('Error searching for lyrics.'))
      );
  }
}