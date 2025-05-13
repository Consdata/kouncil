import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { ProgressBarService, ViewMode } from '@app/common-utils';
import {
  Compatibility,
  MessageFormat,
  Schema,
  SchemaRegistryService, SchemaStateService,
  SubjectType
} from '@app/schema-registry';
import { ServersService } from '@app/common-servers';
import {ActivatedRoute, Router} from '@angular/router';
import { TopicsService } from '@app/feat-topics';
import { SelectableItem } from '@app/common-components';
import { Topics } from '@app/common-model';
import { first } from 'rxjs/operators';
import { MatSelectChange } from '@angular/material/select';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-schema-form',
  template: `
    <form [formGroup]="schemaForm" (ngSubmit)="saveSchema()" class="form schema-form">

      <div class="schema-form-header">
        <div class="schema-form-title">
          {{ getHeaderMessage() }}
        </div>
      </div>

      <div class="schema-base-info">
        <div>
          <app-common-select-field [form]="schemaForm" [controlName]="'topicName'"
                                   [label]="'Topic'"
                                   [options]="topics"
                                   [required]="!isVisible([ViewMode.VIEW])"></app-common-select-field>
        </div>

        <div>
          <app-common-select-field [form]="schemaForm" [controlName]="'subjectType'"
                                   [label]="'Subject type'"
                                   [options]="subjectTypes"
                                   [required]="!isVisible([ViewMode.VIEW])"></app-common-select-field>
        </div>

        <div *ngIf="isVisible([ViewMode.VIEW]) && model">

          <app-common-select-field [form]="schemaForm" [controlName]="'version'"
                                   [label]="'Versions'"
                                   [options]="versionsNo"
                                   (selectionChangeEvent)="changeSchemaVersion($event)"
          ></app-common-select-field>
        </div>

        <div>
          <app-common-select-field [form]="schemaForm" [controlName]="'messageFormat'"
                                   [label]="'Message format'"
                                   [options]="messageFormats"
                                   [required]="!isVisible([ViewMode.VIEW])"></app-common-select-field>
        </div>

        <div>
          <app-common-select-field [form]="schemaForm" [controlName]="'compatibility'"
                                   [label]="'Compatibility'"
                                   [options]="compatibilities" class="compatibilityInput"
                                   [readonly]="isDisabled([ViewMode.VIEW])"
                                   [clearValueBtn]="!isVisible([ViewMode.VIEW])"></app-common-select-field>
        </div>
      </div>

      <div>
        <div class="label">
          Schema
          <span class="required-field" *ngIf="!isVisible([ViewMode.VIEW])">*</span>
        </div>
        <app-common-editor [schemaType]="getControl('messageFormat').value"
                           [editorHeight]="400"
                           [formControl]="getControl('plainTextSchema')"></app-common-editor>
      </div>

      <div class="actions">
        <button mat-button [disableRipple]="true" class="action-button-white"
                [routerLink]="['/schemas']">
          Cancel
        </button>
        <button mat-button [disableRipple]="true" class="action-button-blue"
                *ngIf="isVisible([ViewMode.VIEW]) && model"
                [routerLink]="['/schemas/edit/', model.subjectName, model.version]">
          Edit
        </button>
        <button mat-button [disableRipple]="true"
                *ngIf="isVisible([ViewMode.CREATE, ViewMode.EDIT])"
                class="action-button-blue" type="submit"
                [disabled]="!schemaForm.valid">
          Save
        </button>
      </div>
    </form>
  `,
  styleUrls: ['./schema-form.component.scss']
})
export class SchemaFormComponent implements OnInit, OnDestroy {

  model: Schema;
  subjectTypes: SelectableItem[] = Object.keys(SubjectType).map(format => new SelectableItem(format, format, false));
  messageFormats: SelectableItem[] = [
    new SelectableItem(MessageFormat.JSON, MessageFormat.JSON, false),
    new SelectableItem(MessageFormat.AVRO, MessageFormat.AVRO, false),
    new SelectableItem(MessageFormat.PROTOBUF, MessageFormat.PROTOBUF, false)
  ];
  compatibilities: SelectableItem[] = Object.keys(Compatibility).map(format => new SelectableItem(format, format, false));
  topics: SelectableItem[] = [];
  versionsNo: SelectableItem[] = [];

  ViewMode: typeof ViewMode = ViewMode;

  @Input() viewMode: ViewMode;
  @Output() saveEvent: EventEmitter<Schema> = new EventEmitter<Schema>();

  schemaForm: FormGroup = new FormGroup({
    topicName: new FormControl(''),
    subjectType: new FormControl(''),
    version: new FormControl(''),
    messageFormat: new FormControl(''),
    compatibility: new FormControl(),
    plainTextSchema: new FormControl('')
  });
  private readonly subscription: Subscription = new Subscription();

  constructor(private schemaRegistry: SchemaRegistryService,
              private servers: ServersService,
              private progressBarService: ProgressBarService,
              private route: ActivatedRoute,
              private topicsService: TopicsService,
              private cdr: ChangeDetectorRef,
              private schemaStateService: SchemaStateService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.progressBarService.setProgress(true);
    this.route.params.subscribe((params) => {
      const subjectName = params['subjectName'];
      const version = params['version'];
      if (subjectName && version) {
        this.loadSchema(subjectName, version);
      }

      this.defineRequired();
      this.defineDisabled();
    });

    this.schemaForm.controls['plainTextSchema'].valueChanges.subscribe(() => {
      this.schemaForm.updateValueAndValidity();
      this.cdr.detectChanges();
    });

    this.topicsService
    .getTopics$(this.servers.getSelectedServerId())
    .subscribe((topics: Topics) => {
      this.topics = topics.topics.map((tm) => new SelectableItem(tm.name, tm.name, false));
      this.progressBarService.setProgress(false);
    });

    this.subscription.add(this.schemaStateService.isSchemaConfigured$(this.servers.getSelectedServerId()).subscribe((hasSchemaConnected) => {
        if (!hasSchemaConnected) {
          this.router.navigate(['/schemas']);
        }
      }));
  }

  ngOnDestroy(): void  {
    this.subscription.unsubscribe();
  }

  private defineDisabled() {
    Object.keys(this.schemaForm.controls).forEach(key => {
      if (
        (ViewMode.VIEW === this.viewMode && key !== 'version')
        || (ViewMode.EDIT === this.viewMode && ['topicName', 'subjectType', 'messageFormat'].includes(key))
      ) {
        this.schemaForm.controls[key].disable();
      }
    });
  }

  private defineRequired() {
    Object.keys(this.schemaForm.controls).forEach(key => {
      if (
        (ViewMode.CREATE === this.viewMode && ['topicName', 'subjectType', 'messageFormat', 'plainTextSchema'].includes(key))
        || ViewMode.EDIT === this.viewMode && key === 'plainTextSchema'
      ) {
        this.schemaForm.controls[key].addValidators(Validators.required);
      }
    });
  }

  saveSchema(): void {
    this.model = Object.assign({}, this.schemaForm.getRawValue());
    this.saveEvent.emit(this.model);
  }

  protected loadSchema(subjectName: string, version: number): void {
    this.schemaRegistry.getSchemaVersion$(this.servers.getSelectedServerId(), subjectName, version)
    .pipe(first())
    .subscribe((result: Schema) => {
      this.model = result;
      this.versionsNo = this.model.versionsNo.map((vn) => new SelectableItem(`${vn}`, vn, false));
      this.schemaForm.patchValue(this.model);
      this.progressBarService.setProgress(false);
    });
  }

  isDisabled(viewModes: ViewMode[]): boolean {
    return viewModes.includes(this.viewMode);
  }

  isVisible(viewModes: ViewMode[]): boolean {
    return viewModes.includes(this.viewMode);
  }

  changeSchemaVersion($event: MatSelectChange): void {
    this.loadSchema(this.model.subjectName, $event.value);
  }

  getControl(controlName: string): FormControl {
    return this.schemaForm.get(controlName) as FormControl;
  }

  getHeaderMessage(): string {
    if (this.model) {
      switch (this.viewMode) {
        case ViewMode.CREATE:
          return `Add new schema`;
        case ViewMode.EDIT:
          return `Editing schema for ${this.model.topicName}-${this.model.subjectType.toLowerCase()}`;
        case ViewMode.VIEW:
          return `Details of schema for ${this.model.topicName}-${this.model.subjectType.toLowerCase()}`;
      }
    }
    return '';
  }
}
