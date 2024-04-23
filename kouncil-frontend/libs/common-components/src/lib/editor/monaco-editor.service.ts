import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Schema} from './schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let monaco: any;

@Injectable({
  providedIn: 'root',
})
export class MonacoEditorService {
  loaded: boolean = false;

  private _loadingFinished$: Subject<void> = new Subject<void>();
  public schemas: Array<Schema> = [];

  constructor() {
  }

  get loadingFinished$(): Observable<void> {
    return this._loadingFinished$.asObservable();
  }

  private finishLoading(): void {
    this.loaded = true;
    this._loadingFinished$.next();
  }

  public load(): void {
    // load the assets
    const baseUrl: string = './assets' + '/monaco-editor/min/vs';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (<any>window).monaco === 'object') {
      this.finishLoading();
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onGotAmdLoader: any = (): void => {
      // load Monaco
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (<any>window).require.config({paths: {vs: `${baseUrl}`}});
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (<any>window).require([`vs/editor/editor.main`], () => {
        this.finishLoading();
      });
    };

    // load AMD loader, if necessary
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(<any>window).require) {
      const loaderScript: HTMLScriptElement = document.createElement('script');
      loaderScript.type = 'text/javascript';
      loaderScript.src = `${baseUrl}/loader.js`;
      loaderScript.addEventListener('load', onGotAmdLoader);
      document.body.appendChild(loaderScript);
    } else {
      onGotAmdLoader();
    }
  }

  public addSchema(name: string, schema: object): void {
    this.schemas.push({
      name, schema
    });
  }

  public clearSchemas(): void {
    this.schemas = [];
  }

  public registerSchemas(): void {
    const schemas = [];
    this.schemas.forEach(schema => {
      const modelUri = monaco.Uri.parse(`a://b/${schema.name}.json`);
      const schemaObj = {
        uri: `http://myserver/${schema.name}-schema.json`,
        fileMatch: [modelUri.toString()],
        schema: schema.schema
      };
      schemas.push(schemaObj);
    });
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: schemas
    });
  }
}
