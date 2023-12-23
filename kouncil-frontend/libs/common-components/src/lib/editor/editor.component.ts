import {
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
    <div #editor [style.height.px]="editorHeight"></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./editor.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => EditorComponent),
    multi: true
  }]
})
export class EditorComponent implements OnDestroy {

  @Input() schemaName: any;
  _schemaType: MessageFormat;
  @Input() editorHeight: number = 200;
  @Input() disabled: boolean = false;

  _schemaType: MessageFormat;
  @ViewChild('editor', {static: false}) _editorContainer: ElementRef;

  editor: any;
  value: any;

  propagateChange = (_: any) => {
  };
  onTouched = () => {
  };

  constructor(private monacoEditorService: MonacoEditorService) {
  }

  @Input()
  set schemaType(schemaType: MessageFormat) {
    if (schemaType) {
      this._schemaType = schemaType;
      this.initMonaco();
    }
  ngAfterViewInit(): void {
    this.initMonaco();
  }

  ngOnDestroy() {
    monaco.editor.getModels().forEach(model => model.dispose());
  }

  @Input()
  set schemaType(schemaType: MessageFormat) {
    this._schemaType = schemaType;
    if (this.editor) {
      let language;
      switch (this._schemaType) {
        case MessageFormat.JSON:
        case MessageFormat.AVRO:
          language = "json";
          break;
        case MessageFormat.PROTOBUF:
          language = "proto";
          break;
        case MessageFormat.STRING:
          language = "plaintext";
          break;
      }
      monaco.editor.setModelLanguage(this.editor.getModel(), language)
      this.format();
    }
  }

  private initMonaco(): void {
    if (!this.monacoEditorService.loaded) {
      this.monacoEditorService.loadingFinished.pipe(first()).subscribe(() => {
        this.initMonaco();
      });
      return;
    }
    let model: any
    switch (this._schemaType) {
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

    this.format();

    this.editor.onDidChangeModelContent(() => {
      const value = this.editor.getValue();
      this.propagateChange(value);
      this.value = value;
    });

    this.editor.onDidBlurEditorWidget(() => {
      this.onTouched();
      this.format();
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

  private format(): void {
    setTimeout(() => {
      this.editor.getAction('editor.action.formatDocument').run().then(() => {
        this.markEditorReadonly();
      });
    }, 100);
  }

  private markEditorReadonly(): void {
    this.editor.updateOptions({readOnly: this.disabled});
  }
}
