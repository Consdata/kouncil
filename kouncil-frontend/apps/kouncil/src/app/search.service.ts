import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable()
export class SearchService {

  private phrase$: Subject<string> = new Subject<string>();
  private currentPhraseStore: Record<string, string> = {};
  private currentTabName?: string;
  currentPhrase?: string;

  phraseChangeHandle(state: string): void {
    this.currentPhrase = state;
    this.currentPhraseStore[this.currentTabName] = state;
    this.phrase$.next(state);
  }

  getPhraseState$(currentTabName: string): Observable<string> {
    this.currentTabName = currentTabName;
    this.currentPhrase = this.currentPhraseStore[currentTabName] ? this.currentPhraseStore[currentTabName] : '';
    return this.phrase$.asObservable();
  }

}
