import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {MessageFormat} from '@app/schema-registry';
import {first} from 'rxjs';
import {MonacoEditorService} from './monaco-editor.service';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let monaco: any;

@Component({
  selector: 'app-common-editor',
  template: `
    <div #editor class="editor-container" [style.height.px]="editorHeight"></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: EditorComponent
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: EditorComponent
    }
  ]
})
export class EditorComponent implements AfterViewInit, OnDestroy, ControlValueAccessor, Validator {

  @Input() schemaName: string;
  _schemaType: MessageFormat;
  @Input() editorHeight: number = 200;
  disabled: boolean = false;

  @ViewChild('editor', {static: false}) _editorContainer: ElementRef;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;

  constructor(private monacoEditorService: MonacoEditorService) {
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (_: any) => void = (_: any) => {
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onTouched: () => void = () => {
  };

  ngAfterViewInit(): void {
    this.initMonaco();
  }

  @Input()
  set schemaType(schemaType: MessageFormat) {
    this._schemaType = schemaType;
    if (this.editor) {
      let language;
      switch (this._schemaType) {
        case MessageFormat.JSON:
        case MessageFormat.AVRO:
          language = 'json';
          break;
        case MessageFormat.PROTOBUF:
          language = 'proto';
          break;
        case MessageFormat.STRING:
          language = 'plaintext';
          break;
      }
      monaco.editor.setModelLanguage(this.editor.getModel(), language);
      this.format();
    }
  }

  ngOnDestroy(): void {
    monaco.editor.getModels().forEach(model => model.dispose());
  }

  private initMonaco(): void {
    if (!this.monacoEditorService.loaded) {
      this.monacoEditorService.loadingFinished$.pipe(first()).subscribe(() => {
        this.initMonaco();
      });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let model: any;
    switch (this._schemaType) {
      case MessageFormat.JSON:
      case MessageFormat.AVRO: {
        const modelUri = monaco.Uri.parse(`a://b/${this.schemaName}.json`);
        model = monaco.editor.createModel(this.value, 'json', modelUri);
        break;
      }
      case MessageFormat.PROTOBUF: {
        model = monaco.editor.createModel(this.value, 'proto');
        break;
      }
      case MessageFormat.STRING: {
        model = monaco.editor.createModel(this.value, 'plaintext');
        break;
      }
    }

    this.editor = monaco.editor.create(this._editorContainer.nativeElement,
      {
        model: model
      }
    );

    this.format();

    this.editor.onDidChangeModelContent(() => {
      const value = this.editor.getValue();
      this.onChange(value);
      this.value = value;
    });

    this.editor.onDidBlurEditorWidget(() => {
      this.onTouched();
      this.format();
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  writeValue(value: any): void {
    this.value = value || '';

    setTimeout(() => {
      if (this.editor) {
        this.editor.setValue(this.value);
        this.format();
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  private format(): void {
    setTimeout(() => {
      this.editor.updateOptions({readOnly: false});
      this.editor.getAction('editor.action.formatDocument').run().then(() => {
        this.markEditorReadonly();
      });
    }, 100);
  }

  private markEditorReadonly(): void {
    this.editor.updateOptions({readOnly: this.disabled});
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value === '') {
      return {required: true};
    }
    return null;
  }
}
