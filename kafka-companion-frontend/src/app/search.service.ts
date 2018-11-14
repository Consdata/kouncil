import { Injectable } from '@angular/core';
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";

@Injectable()
export class SearchService {

  private phrase = new Subject<string>();
  private currentPhrase;

  setState(state: string) {
    this.phrase.next(state);
    this.currentPhrase = state;
  }

  getState(): Observable<string> {
    return this.phrase.asObservable();
  }

  getCurrentPhrase() {
    return this.currentPhrase;
  }

}
