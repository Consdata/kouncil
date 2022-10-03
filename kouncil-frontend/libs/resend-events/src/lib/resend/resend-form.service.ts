import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Injectable} from '@angular/core';


@Injectable()
export class ResendFormService {

  public resendForm: FormGroup = new FormGroup({
    'sourceTopicName': new FormControl<string>('', Validators.required),
    'sourceTopicPartition': new FormControl<number>(0, Validators.required),
    'offsetBeginning': new FormControl<number>(0, [Validators.min(0), Validators.required]),
    'offsetEnd': new FormControl<number>(0, [Validators.min(0), Validators.required]),
    'destinationTopicName': new FormControl<string>('', Validators.required),
    'destinationTopicPartition': new FormControl<number>(-1)
  });
}
