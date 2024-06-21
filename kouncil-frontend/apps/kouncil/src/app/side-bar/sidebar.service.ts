import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class SidebarService {

  currentState: string = 'opened';

  private isOpened$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.checkIfOpened());

  changeState(): void {
    this.currentState === 'opened'
      ? this.currentState = ' closed'
      : this.currentState = 'opened';


    this.isOpened$.next(this.checkIfOpened());
  }

  get isOpened(): Observable<boolean> {
    return this.isOpened$.asObservable();
  }

  checkIfOpened(){
    return this.currentState === 'opened';
  }
}
