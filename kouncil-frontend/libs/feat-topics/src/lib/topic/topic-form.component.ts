import {Component, Inject, OnInit} from '@angular/core';
import {TopicData} from "./topic-data";
import {ServersService} from "@app/common-servers";
import {first} from "rxjs/operators";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Observable} from "rxjs";
import {TopicService} from "./topic.service";

@Component({
  selector: 'app-topic-form',
  template: `
    <mat-dialog-content>
      <form [formGroup]="topicForm" (ngSubmit)="save()" class="form topic-form">
        <div class="drawer-header">
          <div class="drawer-title">
              {{model && model.name ? 'Update' : 'Create new'}} topic
          </div>
          <div class="spacer"></div>
          <mat-icon mat-dialog-close class="close">close</mat-icon>
        </div>

        <div class="topic-info">
          <div style="width: 100%; padding-bottom: 10px">
            <div class="label">Name</div>
            <mat-form-field [appearance]="'outline'">
              <input matInput [formControl]="getControl('name')" [required]="true">
            </mat-form-field>

            <mat-error class="error" *ngIf="isFieldInvalid(getControl('name'))">
              Field is <strong>required</strong>
            </mat-error>
          </div>

          <div style="width: 100%; padding-bottom: 10px">
            <div class="label">Partitions</div>
            <mat-form-field [appearance]="'outline'">
              <input matInput type="number" [formControl]="getControl('partitions')"
                     [required]="true"
              >
            </mat-form-field>

            <mat-error class="error" *ngIf="isFieldInvalid(getControl('partitions'))">
              Field is <strong>required</strong>
            </mat-error>
          </div>

          <div style="width: 100%; padding-bottom: 10px">
            <div class="label">Replication Factor</div>
            <mat-form-field [appearance]="'outline'">
              <input matInput type="number" [formControl]="getControl('replicationFactor')"
                     [required]="true">
            </mat-form-field>

            <mat-error class="error" *ngIf="isFieldInvalid(getControl('replicationFactor'))">
              Field is <strong>required</strong>
            </mat-error>
          </div>
        </div>

        <div class="actions">
          <button type="button" mat-dialog-close mat-button disableRipple
                  class="action-button-white">
            Cancel
          </button>
          <button mat-button disableRipple
                  class="action-button-black" type="submit" [disabled]="!topicForm.valid">
            Save
          </button>
        </div>
      </form>
    </mat-dialog-content>
  `,
  styleUrls: ['./topic-form.component.scss']
})
export class TopicFormComponent implements OnInit {

  model: TopicData;

  topicForm: FormGroup;

  constructor(private topicService: TopicService,
              private servers: ServersService,
              private dialog: MatDialog,
              private snackbar: MatSnackBar,
              private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: string
  ) {
    this.topicForm = this.fb.group({});
    this.topicForm.addControl('name', new FormControl('', [Validators.required]))
    this.topicForm.addControl('partitions', new FormControl('', [Validators.required]))
    this.topicForm.addControl('replicationFactor', new FormControl('', [Validators.required]))
  }

  ngOnInit(): void {
    if (this.data) {
      this.loadTopic(this.data);
    }
  }

  protected loadTopic(topicName: string): void {
    this.topicService.getTopic$(this.servers.getSelectedServerId(), topicName)
    .pipe(first())
    .subscribe((result: TopicData) => {
      this.model = result;

      Object.keys(this.topicForm.controls).forEach(controlName => {
        this.topicForm.controls[controlName].patchValue(this.model[controlName])
      })

      this.topicForm.controls['name'].disable();
      this.topicForm.controls['replicationFactor'].disable();
    });
  }

  save() {
    this.model = {} as TopicData;
    Object.keys(this.topicForm.controls).forEach(controlName => {
      this.model[controlName] = this.topicForm.controls[controlName].value
    })

    if (!this.data) {
      this.process(this.topicService.createTopic$(this.model, this.servers.selectedServerId),
        `Topic ${this.model.name} was successfully created`,
        `Error occurred while creating topic ${this.model.name}`)
    } else {
      this.process(this.topicService.updateTopic$(this.model, this.servers.selectedServerId),
        `Topic ${this.model.name} was successfully updated`,
        `Error occurred while updating topic ${this.model.name}`)
    }
  }

  getControl(controlName: string): FormControl {
    return this.topicForm.controls[controlName] as FormControl;
  }

  isFieldInvalid(control: FormControl) {
    return control.touched && control.invalid
  }

  private process(observable: Observable<void>, successMsg: string, errorMsg: string) {
    observable.pipe(first())
    .subscribe(() => {
      this.dialog.closeAll();
      this.snackbar.open(successMsg, '', {
        duration: 3000,
        panelClass: ['snackbar-success', 'snackbar'],
      });
    }, error => {
      console.error(error);
      this.snackbar.open(errorMsg, '', {
        duration: 3000,
        panelClass: ['snackbar-error', 'snackbar']
      });
    });
  }
}
