import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { TopicData } from './topic-data';
import { ServersService } from '@app/common-servers';
import { first } from 'rxjs/operators';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { TopicService } from './topic.service';
import { SnackBarComponent, SnackBarData, ViewMode } from '@app/common-utils';

@Component({
  selector: 'app-topic-form',
  template: `
    <div mat-dialog-title class="drawer-header">
      <div class="drawer-title">
        {{ header }}
      </div>
      <div class="spacer"></div>
      <mat-icon mat-dialog-close class="material-symbols-outlined close">close</mat-icon>
    </div>

    <form [formGroup]="topicForm" (ngSubmit)="save()" class="form topic-form">
      <div mat-dialog-content class="topic-info">
        <div class="topic-form-field">
          <app-common-text-field [form]="topicForm" [controlName]="'name'"
                                 [readonly]="ViewMode.CREATE !== viewMode"
                                 [label]="'Name'" [required]="true"></app-common-text-field>
        </div>

        <div class="topic-form-field">
          <app-common-number-field [form]="topicForm" [controlName]="'partitions'"
                                   [label]="'Partitions'"
                                   [required]="true"></app-common-number-field>
        </div>

        <div class="topic-form-field">
          <app-common-number-field [form]="topicForm" [controlName]="'replicationFactor'"
                                   [label]="'Replication Factor'"
                                   [readonly]="ViewMode.CREATE !== viewMode"
                                   [required]="true"></app-common-number-field>
        </div>
      </div>

      <div mat-dialog-actions class="actions">
        <button type="button" mat-dialog-close mat-button [disableRipple]="true"
                class="action-button-white">
          Cancel
        </button>
        <button mat-button [disableRipple]="true"
                class="action-button-blue" type="submit" [disabled]="!topicForm.valid">
          Save
        </button>
      </div>
    </form>
  `,
  styleUrls: ['./topic-form.component.scss']
})
export class TopicFormComponent implements OnInit, OnDestroy {

  model: TopicData;
  header: string = 'Create new topic';
  topicForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    partitions: new FormControl('', [Validators.required]),
    replicationFactor: new FormControl('', [Validators.required])
  });
  viewMode: ViewMode = ViewMode.CREATE;
  ViewMode: typeof ViewMode = ViewMode;

  private subscriptions: Subscription = new Subscription();

  constructor(private topicService: TopicService,
              private servers: ServersService,
              private dialog: MatDialog,
              private snackbar: MatSnackBar,
              @Inject(MAT_DIALOG_DATA) public data: string) {
  }

  ngOnInit(): void {
    if (this.data) {
      this.loadTopic(this.data);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  protected loadTopic(topicName: string): void {
    this.subscriptions.add(this.topicService.getTopic$(this.servers.getSelectedServerId(), topicName)
    .pipe(first())
    .subscribe((result: TopicData) => {
      this.viewMode = ViewMode.EDIT;
      this.model = result;
      this.header = `Update topic ${this.model.name}`;
      this.topicForm.patchValue(this.model);
      this.topicForm.controls['name'].disable();
      this.topicForm.controls['replicationFactor'].disable();
    }));
  }

  save(): void {
    this.model = Object.assign({}, this.topicForm.getRawValue());
    if (!this.data) {
      this.process(this.topicService.createTopic$(this.model, this.servers.selectedServerId),
        `Topic ${this.model.name} was successfully created`,
        `Error occurred while creating topic ${this.model.name}`);
    } else {
      this.process(this.topicService.updateTopic$(this.model, this.servers.selectedServerId),
        `Topic ${this.model.name} was successfully updated`,
        `Error occurred while updating topic ${this.model.name}`);
    }
  }

  private process(observable$: Observable<void>, successMsg: string, errorMsg: string) {
    this.subscriptions.add(observable$.pipe(first())
    .subscribe({
      next: () => {
        this.dialog.closeAll();
        this.snackbar.openFromComponent(SnackBarComponent, {
          data: new SnackBarData(successMsg, 'snackbar-success', ''),
          panelClass: ['snackbar'],
          duration: 3000,
        });
      },
      error: () => {
        this.snackbar.openFromComponent(SnackBarComponent, {
          data: new SnackBarData(errorMsg, 'snackbar-error', ''),
          panelClass: ['snackbar'],
          duration: 3000,
        });
      }
    }));
  }
}
