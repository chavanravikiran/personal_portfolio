import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const COUNTED_FLAG = 'portfolio-visit-counted';

@Injectable({
  providedIn: 'root'
})
export class VisitorCounterService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Returns the total visit count, or null if the counter service is unreachable.
   * A visit is counted once per browser session (reloads don't add to it).
   */
  getVisits(): Observable<number | null> {
    const { baseUrl, namespace, key } = environment.visitorCounter;
    const shouldCount = !this.alreadyCounted();
    const action = shouldCount ? 'hit' : 'get';

    return this.http.get<{ value: number }>(`${baseUrl}/${action}/${namespace}/${key}`).pipe(
      timeout(8000),
      map(res => {
        if (shouldCount) {
          this.markCounted();
        }
        return typeof res?.value === 'number' && res.value >= 0 ? res.value : null;
      }),
      catchError(() => of(null))
    );
  }

  private alreadyCounted(): boolean {
    try {
      return sessionStorage.getItem(COUNTED_FLAG) === '1';
    } catch {
      return false;
    }
  }

  private markCounted(): void {
    try {
      sessionStorage.setItem(COUNTED_FLAG, '1');
    } catch {
      // storage blocked (private mode etc.) - the visit was still counted once
    }
  }
}
