import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {Schema} from "./schema";

declare var monaco: any;

@Injectable({
  providedIn: 'root',
})
export class MonacoEditorService {
  loaded: boolean = false;

  public loadingFinished: Subject<void> = new Subject<void>();
  public schemas: Array<Schema> = [];

  constructor() {
  }

  private finishLoading() {
    this.loaded = true;
    this.loadingFinished.next();
  }

  public load() {
    // load the assets
    const baseUrl = './assets' + '/monaco-editor/min/vs';
    if (typeof (<any>window).monaco === 'object') {
      this.finishLoading();
      return;
    }

    const onGotAmdLoader: any = () => {
      // load Monaco
      (<any>window).require.config({paths: {vs: `${baseUrl}`}});
      (<any>window).require([`vs/editor/editor.main`], () => {
        this.finishLoading();
      });
    };

    // load AMD loader, if necessary
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

  public addSchema(name: string, schema: object) {
    this.schemas.push({
      name, schema
    });
  }

  public clearSchemas() {
    this.schemas = [];
  }

  public registerSchemas() {
    let schemas = [];
    this.schemas.forEach(schema => {
      var modelUri = monaco.Uri.parse(`a://b/${schema.name}.json`);
      var schemaObj = {
        uri: `http://myserver/${schema.name}-schema.json`,
        fileMatch: [modelUri.toString()],
        schema: schema.schema
      }
      schemas.push(schemaObj);
    })
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: schemas
    });
  }
}
