import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProgressBarService {
  private progressSub$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get loading$(): Observable<boolean> {
    return this.progressSub$.asObservable();
  }

  setProgress(progress: boolean): void {
    this.progressSub$.next(progress);
  }
}
