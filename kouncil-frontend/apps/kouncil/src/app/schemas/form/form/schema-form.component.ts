import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProgressBarService} from '@app/common-utils';
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
import {ViewMode} from '../view-mode';
import {MatSelectChange} from '@angular/material/select';

@Component({
  selector: 'app-schema-form',
  template: `
    <form *ngIf="model" (ngSubmit)="saveSchema()" class="form schema-form"
          #schemaForm="ngForm">

      <div class="schema-base-info">
        <div>
          <div class="label">Topic</div>
          <mat-form-field [appearance]="'outline'">
            <mat-select name="topicName" [(ngModel)]="model.topicName"
                        [disabled]="isDisabled([ViewMode.VIEW, ViewMode.EDIT])"
                        [required]="isRequired([ViewMode.CREATE])"
                        #topicName="ngModel">
              <mat-option *ngFor="let topic of topics" [value]="topic.value">
                {{ topic.label }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div>
          <div class="label">Subject type</div>
          <mat-form-field [appearance]="'outline'">
            <mat-select name="subjectType" [(ngModel)]="model.subjectType"
                        [disabled]="isDisabled([ViewMode.VIEW, ViewMode.EDIT])"
                        [required]="isRequired([ViewMode.CREATE])">
              <mat-option *ngFor="let subjectType of subjectTypes" [value]="subjectType">
                {{ subjectType }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <div *ngIf="isVisible([ViewMode.VIEW])">
          <div class="label">Versions</div>
          <mat-form-field [appearance]="'outline'">
            <mat-select name="version" [(ngModel)]="model.version" (selectionChange)="changeSchemaVersion($event)">
              <mat-option *ngFor="let version of model.versionsNo" [value]="version">
                {{ version }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <div>
          <div class="label">Message format</div>
          <mat-form-field [appearance]="'outline'">
            <mat-select name="messageFormat" [(ngModel)]="model.messageFormat"
                        [disabled]="isDisabled([ViewMode.VIEW, ViewMode.EDIT])"
                        [required]="isRequired([ViewMode.CREATE])">
              <mat-option *ngFor="let messageFormat of messageFormats" [value]="messageFormat">
                {{ messageFormat }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <div>
          <div class="label">Compatibility</div>
          <mat-form-field [appearance]="'outline'" style="width: 250px">
            <mat-select name="compatibility" [(ngModel)]="model.compatibility"
                        [disabled]="isDisabled([ViewMode.VIEW])">
              <mat-option *ngFor="let compatibility of compatibilities" [value]="compatibility">
                {{ compatibility }}
              </mat-option>
            </mat-select>
            <button *ngIf="model.compatibility && !isDisabled([ViewMode.VIEW])"
                    mat-icon-button matSuffix type="button" class="clear-btn"
                    (click)="$event.stopPropagation(); model.compatibility=null">
              <mat-icon class="clear-icon">close</mat-icon>
            </button>

          </mat-form-field>
        </div>
      </div>

      <div>
        <div class="label">Schema</div>
        <app-common-editor [schemaType]="model.messageFormat" name="schema" [editorHeight]="400"
                           [(ngModel)]="model.plainTextSchema"
                           [disabled]="isDisabled([ViewMode.VIEW])"
                           [required]="isRequired([ViewMode.CREATE, ViewMode.EDIT])"></app-common-editor>
      </div>
      <div class="actions">
        <button mat-button disableRipple class="action-button-white"
                [routerLink]="['/schemas']">
          Cancel
        </button>
        <button mat-button disableRipple *ngIf="isVisible([ViewMode.CREATE, ViewMode.EDIT])"
                class="action-button-black" type="submit"
                [disabled]="!schemaForm.form.valid">
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
  messageFormats: string[] = Object.keys(MessageFormat).map(format => format);
  compatibilities: string[] = Object.keys(Compatibility).map(format => format);
  topics: SelectableItem[] = [];
  ViewMode: typeof ViewMode = ViewMode;

  @Input() viewMode: ViewMode;
  @Output() saveEvent: EventEmitter<Schema> = new EventEmitter<Schema>();

  constructor(private schemaRegistry: SchemaRegistryService,
              private servers: ServersService,
              private progressBarService: ProgressBarService,
              private route: ActivatedRoute,
              private topicsService: TopicsService) {
  }

  ngOnInit(): void {
    this.progressBarService.setProgress(true);
    this.route.params.subscribe((params) => {
      const subjectName = params['subjectName'];
      const version = params['version'];
      if (subjectName && version) {
        this.loadSchema(subjectName, version);
      } else {
        this.model = {} as Schema;
      }
    });

    this.topicsService
    .getTopics$(this.servers.getSelectedServerId())
    .subscribe((topics: Topics) => {
      this.topics = topics.topics.map((tm) => new SelectableItem(tm.name, tm.name, false));
      this.progressBarService.setProgress(false);
    });
  }

  saveSchema(): void {
    this.saveEvent.emit(this.model);
  }

  protected loadSchema(subjectName: string, version: number): void {
    this.schemaRegistry.getSchemaVersion$(this.servers.getSelectedServerId(), subjectName, version)
    .pipe(first())
    .subscribe((result: Schema) => {
      this.model = result;
      this.progressBarService.setProgress(false);
    });
  }

  isDisabled(viewModes: ViewMode[]): boolean {
    return viewModes.includes(this.viewMode);
  }

  isRequired(viewModes: ViewMode[]): boolean {
    return viewModes.includes(this.viewMode);
  }

  isVisible(viewModes: ViewMode[]): boolean {
    return viewModes.includes(this.viewMode);
  }

  changeSchemaVersion($event: MatSelectChange): void {
    this.loadSchema(this.model.subjectName, $event.value);
  }
}
