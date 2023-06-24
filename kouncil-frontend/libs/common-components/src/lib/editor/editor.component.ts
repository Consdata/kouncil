import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {MessageFormat} from "@app/schema-registry";
import {first} from "rxjs";
import {MonacoEditorService} from "./monaco-editor.service";
import {NG_VALUE_ACCESSOR} from "@angular/forms";

declare var monaco: any;

@Component({
  selector: 'app-common-editor',
  template: `
    <div class="editor-container" #editor></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./editor.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => EditorComponent),
    multi: true
  }]
})
export class EditorComponent implements AfterViewInit, OnDestroy {

  @Input() schemaName: any;
  @Input() schemaType: MessageFormat;
  @ViewChild('editor', {static: false}) _editorContainer: ElementRef;

  editor: any;
  value: any;

  propagateChange = (_: any) => {
  };
  onTouched = () => {
  };

  constructor(private monacoEditorService: MonacoEditorService) {
  }

  ngAfterViewInit(): void {
    this.initMonaco()
  }

  ngOnDestroy() {
    monaco.editor.getModels().forEach(model => model.dispose());
  }

  private initMonaco(): void {
    if (!this.monacoEditorService.loaded) {
      this.monacoEditorService.loadingFinished.pipe(first()).subscribe(() => {
        this.initMonaco();
      });
      return;
    }
    let model: any
    switch (this.schemaType) {
      case MessageFormat.JSON:
      case MessageFormat.AVRO:
        let modelUri = monaco.Uri.parse(`a://b/${this.schemaName}.json`);
        model = monaco.editor.createModel(this.value, "json", modelUri);
        break;
      case MessageFormat.PROTOBUF:
        model = monaco.editor.createModel(this.value, "proto");
        break;
      case MessageFormat.STRING:
        model = monaco.editor.createModel(this.value, "plaintext");
        break;
    }

    this.editor = monaco.editor.create(this._editorContainer.nativeElement,
      {
        model: model
      }
    );

    this.editor.onDidChangeModelContent(() => {
      const value = this.editor.getValue();
      this.propagateChange(value);
      this.value = value;
    });

    this.editor.onDidBlurEditorWidget(() => {
      this.onTouched();
    });
  }

  writeValue(value: any): void {
    this.value = value || '';

    setTimeout(() => {
      if (this.editor) {
        this.editor.setValue(this.value);
      }
    });
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
