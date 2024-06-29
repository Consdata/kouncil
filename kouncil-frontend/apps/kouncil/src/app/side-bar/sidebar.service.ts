import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {

  currentState: string = 'opened';

  private opened$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.checkIfOpened());

  changeState(): void {
    if (this.currentState === 'opened') {
      this.currentState = ' closed';
    } else {
      this.currentState = 'opened';
    }
    this.opened$.next(this.checkIfOpened());
  }

  get isOpened$(): Observable<boolean> {
    return this.opened$.asObservable();
  }

  checkIfOpened(): boolean {
    return this.currentState === 'opened';
  }
}
