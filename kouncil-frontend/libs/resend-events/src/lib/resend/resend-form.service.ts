import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {Injectable} from '@angular/core';
import {ResendDataModel, ResendService} from '@app/resend-events';
import {ServersService} from '@app/common-servers';
import {MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {MatLegacySnackBar as MatSnackBar} from '@angular/material/legacy-snack-bar';
import {ConfirmService} from '@app/feat-confirm';
import {filter, first} from 'rxjs/operators';

@Injectable()
export class ResendFormService {

  public resendForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private resendService: ResendService,
    private servers: ServersService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private confirmService: ConfirmService) {
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
      'destinationTopicPartition': new FormControl<number>(-1, {nonNullable: true}),
      'shouldFilterOutHeaders': new FormControl<boolean>(true)
    }, {
      validators: (control: AbstractControl): ValidationErrors | null => {
        const offsetBeginning = control.get('offsetBeginning')?.value;
        const offsetEnd = control.get('offsetEnd')?.value;

        const result = offsetBeginning > offsetEnd ? {offsetBeginningBiggerThanEnd: true} : null;
        return result;
      }
    });
  }

  submit(): void {
    const resendData: ResendDataModel = {...this.resendForm.value};
    const msgCount = resendData.offsetEnd - resendData.offsetBeginning + 1; // +1 - offset start from 0
    this.confirmService.openConfirmDialog$({
      title: 'Resend messages',
      subtitle: `Are you sure you want resend ${msgCount} message${msgCount > 1 ? 's' : ''}:`,
      sectionLine1: `from: ${resendData.sourceTopicName}`,
      sectionLine2: `to: ${resendData.destinationTopicName}`
    })
      .pipe(
        first(),
        filter((confirmed) => !!confirmed),
      )
      .subscribe(() => {
        this.resendMessages(resendData)
      });
  }

  private resendMessages(resendData: ResendDataModel): void {
    this.resendService.resend$(this.servers.getSelectedServerId(), resendData)
      .pipe(first())
      .subscribe({
        next: () => {
          this.dialog.closeAll();
          this.resendForm.reset();
          this.snackbar.open(
            `Successfully sent events from ${resendData.sourceTopicName} to ${resendData.destinationTopicName}`,
            '', {
              duration: 5000,
              panelClass: ['snackbar-success', 'snackbar'],
            });
        }, error: (e) => () => {
          this.snackbar.open(`Error occurred while resending events`, '', {
            duration: 5000,
            panelClass: ['snackbar-error', 'snackbar']
          });
        }
      });
  }

}
