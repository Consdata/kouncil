import {Component, OnInit} from '@angular/core';
import {MessageFormat, Schema, SchemaRegistryService} from '@app/schema-registry';
import {ServersService} from '@app/common-servers';
import {ActivatedRoute, Router} from '@angular/router';
import {TopicsService} from '@app/feat-topics';
import {Topics} from '@app/common-model';
import {SelectableItem} from '@app/common-components';

@Component({
  selector: 'app-schema-create',
  template: `
    <form *ngIf="model" (ngSubmit)="saveSchema()" class="form schema-edit-form">

      <div class="schema-base-info">
        <div>
          <div class="label">Topic</div>
          <mat-form-field [appearance]="'outline'">
            <mat-select name="topicName" [(ngModel)]="model.topicName">
              <mat-option *ngFor="let topic of topics" [value]="topic.value">
                {{ topic.label }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="checkbox-field">
          <mat-checkbox [checked]="model.isKey" [labelPosition]="'before'"
                        [(ngModel)]="model.isKey" name="isKey">
            isKey
          </mat-checkbox>
        </div>
        <div style="margin-bottom: 20px">
          <div class="label">Message format</div>
          <mat-form-field [appearance]="'outline'">
            <mat-select name="messageFormat" [(ngModel)]="model.messageFormat">
              <mat-option *ngFor="let messageFormat of messageFormats" [value]="messageFormat">
                {{ messageFormat }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <div style="margin-bottom: 20px">
        <div class="label">Schema</div>
        <app-common-editor [schemaType]="model.messageFormat" name="schema"
                           [(ngModel)]="model.plainTextSchema"></app-common-editor>
      </div>
      <div class="actions" style="float: right">
        <button mat-button disableRipple class="action-button-white" style="margin-right: 10px"
                [routerLink]="['/schemas']">
          Cancel
        </button>
        <button mat-button disableRipple
                class="action-button-black" type="submit">
          Save
        </button>
      </div>
    </form>

  `,
  styleUrls: ['./schema-create.component.scss']
})
export class SchemaCreateComponent implements OnInit {

  model: Schema = {
    isKey: false
  } as Schema;

  topics: SelectableItem[] = [];

  messageFormats: string[] = Object.keys(MessageFormat).map(format => format);

  constructor(private schemaRegistry: SchemaRegistryService,
              private servers: ServersService,
              private route: ActivatedRoute,
              private router: Router,
              private topicsService: TopicsService) {
  }

  ngOnInit(): void {
    this.topicsService
    .getTopics$(this.servers.getSelectedServerId())
    .subscribe((topics: Topics) => {
      this.topics = topics.topics.map((tm) => new SelectableItem(tm.name, tm.name, false));
    });
  }

  saveSchema(): void {
    this.schemaRegistry.addNewSchema$(this.model, this.servers.getSelectedServerId())
    .pipe()
    .subscribe(() => {
      this.router.navigate(['/schemas']);
    });
  }
}
