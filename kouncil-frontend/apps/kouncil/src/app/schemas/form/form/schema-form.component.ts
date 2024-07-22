import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProgressBarService, ViewMode} from '@app/common-utils';
import {
  Compatibility,
  MessageFormat,
  Schema,
  SchemaRegistryService,
  SubjectType
} from '@app/schema-registry';
import {ServersService} from '@app/common-servers';
import {ActivatedRoute} from '@angular/router';
import {TopicsService} from '@app/feat-topics';
import {SelectableItem} from '@app/common-components';
import {Topics} from '@app/common-model';
import {first} from 'rxjs/operators';
import {MatSelectChange} from '@angular/material/select';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-schema-form',
  template: `
    <form [formGroup]="schemaForm" (ngSubmit)="saveSchema()" class="form schema-form">

      <div class="schema-base-info">

        <div>
          <div class="label">
            Topic
            <span class="required-field">*</span>
          </div>
          <mat-form-field [appearance]="'outline'">
            <mat-select [formControl]="getControl('topicName')">
              <mat-option *ngFor="let topic of topics" [value]="topic.value">
                {{ topic.label }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div>
          <div class="label">
            Subject type
            <span class="required-field">*</span>
          </div>
          <mat-form-field [appearance]="'outline'">
            <mat-select [formControl]="getControl('subjectType')">
              <mat-option *ngFor="let subjectType of subjectTypes" [value]="subjectType">
                {{ subjectType }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div *ngIf="isVisible([ViewMode.VIEW]) && model">
          <div class="label">Versions</div>
          <mat-form-field [appearance]="'outline'">
            <mat-select [formControl]="getControl('version')"
                        (selectionChange)="changeSchemaVersion($event)">
              <mat-option *ngFor="let version of model.versionsNo" [value]="version">
                {{ version }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div>
          <div class="label">
            Message format
            <span class="required-field">*</span>
          </div>
          <mat-form-field [appearance]="'outline'">
            <mat-select [formControl]="getControl('messageFormat')">
              <mat-option *ngFor="let messageFormat of messageFormats" [value]="messageFormat">
                {{ messageFormat }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div>
          <div class="label">Compatibility</div>
          <mat-form-field [appearance]="'outline'" class="compatibilityInput">
            <mat-select [formControl]="getControl('compatibility')">
              <mat-option *ngFor="let compatibility of compatibilities" [value]="compatibility">
                {{ compatibility }}
              </mat-option>
            </mat-select>
            <button *ngIf="getControl('compatibility').value && !isDisabled([ViewMode.VIEW])"
                    mat-icon-button matSuffix type="button" class="clear-btn"
                    (click)="$event.stopPropagation(); getControl('compatibility').patchValue(null)">
              <mat-icon class="material-symbols-outlined clear-icon">close</mat-icon>
            </button>

          </mat-form-field>
        </div>
      </div>

      <div>
        <div class="label">
          Schema
          <span class="required-field">*</span>
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
        <button mat-button [disableRipple]="true"
                *ngIf="isVisible([ViewMode.CREATE, ViewMode.EDIT])"
                class="action-button-black" type="submit"
                [disabled]="!schemaForm.valid">
          Save
        </button>
      </div>
    </form>
  `,
  styleUrls: ['./schema-form.component.scss']
})
export class SchemaFormComponent implements OnInit {

  model: Schema;
  subjectTypes: string[] = Object.keys(SubjectType).map(format => format);
  messageFormats: string[] = [MessageFormat.JSON, MessageFormat.AVRO, MessageFormat.PROTOBUF];
  compatibilities: string[] = Object.keys(Compatibility).map(format => format);
  topics: SelectableItem[] = [];
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

  constructor(private schemaRegistry: SchemaRegistryService,
              private servers: ServersService,
              private progressBarService: ProgressBarService,
              private route: ActivatedRoute,
              private topicsService: TopicsService,
              private cdr: ChangeDetectorRef) {
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
    this.model = {} as Schema;
    Object.keys(this.schemaForm.controls).forEach(controlName => {
      this.model[controlName] = this.schemaForm.controls[controlName].value;
    });

    this.saveEvent.emit(this.model);
  }

  protected loadSchema(subjectName: string, version: number): void {
    this.schemaRegistry.getSchemaVersion$(this.servers.getSelectedServerId(), subjectName, version)
    .pipe(first())
    .subscribe((result: Schema) => {
      this.model = result;
      Object.keys(this.schemaForm.controls).forEach(controlName => {
        this.schemaForm.controls[controlName].patchValue(this.model[controlName]);
      });
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
    return this.schemaForm.controls[controlName] as FormControl;
  }
}
