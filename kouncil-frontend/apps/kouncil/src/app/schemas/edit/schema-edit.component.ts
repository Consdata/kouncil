import {Component, OnInit} from '@angular/core';
import {ProgressBarService} from '@app/common-utils';
import {MessageFormat, Schema, SchemaRegistryService} from '@app/schema-registry';
import {ServersService} from '@app/common-servers';
import {ActivatedRoute, Router} from '@angular/router';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-schema-edit',
  template: `
    <form *ngIf="model" (ngSubmit)="saveSchema()" class="form schema-edit-form">

      <div class="schema-base-info">
        <div>
          <div class="label">Topic</div>
          <mat-form-field [appearance]="'outline'">
            <input matInput
                   disabled
                   type="text"
                   name="topicName"
                   [(ngModel)]="model.topicName"
            />
          </mat-form-field>
        </div>

        <div class="checkbox-field">
          <mat-checkbox disabled [checked]="true" [labelPosition]="'before'">isKey</mat-checkbox>
        </div>
        <div style="margin-bottom: 20px">
          <div class="label">Message format</div>
          <mat-form-field [appearance]="'outline'">
            <mat-select name="operator" [(ngModel)]="model.messageFormat" disabled>
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
  styleUrls: ['./schema-edit.component.scss']
})
export class SchemaEditComponent implements OnInit {

  model: Schema;

  messageFormats: string[] = Object.keys(MessageFormat).map(format => format);

  constructor(private schemaRegistry: SchemaRegistryService,
              private servers: ServersService,
              private progressBarService: ProgressBarService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit(): void {
    this.progressBarService.setProgress(true);
    this.route.params.subscribe((params) => {
      const subjectName = params['subjectName'];
      this.loadSchema(subjectName);
    });
  }

  saveSchema(): void {
    this.schemaRegistry.addNewSchemaVersion$(this.model, this.servers.getSelectedServerId())
    .pipe()
    .subscribe(() => {
      this.router.navigate(['/schemas']);
    });
  }

  private loadSchema(subjectName: string): void {
    this.schemaRegistry.getLatestSchema$(this.servers.getSelectedServerId(), subjectName)
    .pipe(first())
    .subscribe((result: Schema) => {
      this.model = result;
      this.progressBarService.setProgress(false);
    });
  }
}
