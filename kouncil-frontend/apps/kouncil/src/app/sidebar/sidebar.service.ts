import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {SidebarState} from './sidebar-state';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {

  currentState: SidebarState = SidebarState.OPENED;

  private opened$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.checkIfOpened());

  changeState(): void {
    if (SidebarState.OPENED === this.currentState) {
      this.currentState = SidebarState.CLOSED;
    } else {
      this.currentState = SidebarState.OPENED;
    }
    this.opened$.next(this.checkIfOpened());
  }

  get isOpened$(): Observable<boolean> {
    return this.opened$.asObservable();
  }

  checkIfOpened(): boolean {
    return SidebarState.OPENED === this.currentState;
  }
}
