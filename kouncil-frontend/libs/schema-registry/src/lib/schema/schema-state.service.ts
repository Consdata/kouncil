import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SchemaStateService {
  private schemaConfiguredSub$: Subject<{ [id: string]: boolean }> = new BehaviorSubject<{ [id: string]: boolean }>({});

  isSchemaConfigured$(serverId: string): Observable<boolean> {
    return this.schemaConfiguredSub$.pipe(
      map(schemaConfiguration => schemaConfiguration[serverId])
    );
  }

  setSchemaConfiguration(schemaConfiguration: {[id: string]: boolean}): void {
    this.schemaConfiguredSub$.next(schemaConfiguration);
  }
}
