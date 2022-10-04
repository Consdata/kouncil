import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Injectable} from '@angular/core';
import {ResendDataModel, ResendService} from '@app/resend-events';
import {ServersService} from '@app/common-servers';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {first} from 'rxjs/operators';

@Injectable()
export class ResendFormService {

  public resendForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private resendService: ResendService,
    private servers: ServersService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar) {
    this.resendForm = this.formBuilder.group({
      'sourceTopicName': new FormControl<string>('', {nonNullable: true}),
      'sourceTopicPartition': new FormControl<number>(0, {nonNullable: true, validators: Validators.required}),
      'offsetBeginning': new FormControl<number>(0, {
        nonNullable: true,
        validators: [Validators.min(0), Validators.required]
      }),
      'offsetEnd': new FormControl<number>(0, {
        nonNullable: true,
        validators: [Validators.min(0), Validators.required]
      }),
      'destinationTopicName': new FormControl<string>('', {nonNullable: true, validators: Validators.required}),
      'destinationTopicPartition': new FormControl<number>(-1, {nonNullable: true})
    });
  }

  submit(): void {
    const resendData: ResendDataModel = {...this.resendForm.value};
    this.resendService.resend$(this.servers.getSelectedServerId(), resendData)
      .pipe(first())
      .subscribe(() => {
        this.dialog.closeAll();
        this.resendForm.reset();
        this.snackbar.open(
          `Successfully sent events from ${resendData.sourceTopicName} to ${resendData.destinationTopicName}`,
          '', {
            duration: 5000,
            panelClass: ['snackbar-success', 'snackbar'],
          });
      }, () => {
        this.snackbar.open(`Error occurred while resending events`, '', {
          duration: 5000,
          panelClass: ['snackbar-error', 'snackbar']
        });
      });
  }

}
