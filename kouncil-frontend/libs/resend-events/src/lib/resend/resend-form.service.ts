import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import {Injectable} from '@angular/core';
import {ServersService} from '@app/common-servers';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ConfirmService} from '@app/feat-confirm';
import {filter, first} from 'rxjs/operators';
import {SnackBarComponent, SnackBarData} from '@app/common-utils';
import {ResendDataModel} from './resend.data.model';
import {ResendService} from './resend.service';

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
      'sourceTopicPartition': new FormControl<number>(0, {
        nonNullable: true,
        validators: Validators.required
      }),
      'offsetBeginning': new FormControl<number>(0, {
        nonNullable: true,
        validators: [Validators.min(0), Validators.required]
      }),
      'offsetEnd': new FormControl<number>(0, {
        nonNullable: true,
        validators: [Validators.min(0), Validators.required]
      }),
      'destinationTopicName': new FormControl<string>('', {
        nonNullable: true,
        validators: Validators.required
      }),
      'destinationTopicPartition': new FormControl<number>(-1, {nonNullable: true}),
      'shouldFilterOutHeaders': new FormControl<boolean>(true)
    }, {
      validators: (control: AbstractControl): ValidationErrors | null => {
        const offsetBeginning = control.get('offsetBeginning')?.value;
        const offsetEnd = control.get('offsetEnd')?.value;

        return offsetBeginning > offsetEnd ? {offsetBeginningBiggerThanEnd: true} : null;
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
      this.resendMessages(resendData);
    });
  }

  private resendMessages(resendData: ResendDataModel): void {
    this.resendService.resend$(this.servers.getSelectedServerId(), resendData)
    .pipe(first())
    .subscribe({
      next: () => {
        this.dialog.closeAll();
        this.resendForm.reset();
        this.snackbar.openFromComponent(SnackBarComponent, {
          data: new SnackBarData(`Successfully sent events from ${resendData.sourceTopicName} to ${resendData.destinationTopicName}`,
            'snackbar-success', ''),
          panelClass: ['snackbar'],
          duration: 5000
        });
      }, error: () => () => {
        this.snackbar.openFromComponent(SnackBarComponent, {
          data: new SnackBarData(`Error occurred while resending events`, 'snackbar-success', ''),
          panelClass: ['snackbar'],
          duration: 5000
        });
      }
    });
  }

}
