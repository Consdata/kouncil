import {FormGroup, Validators} from '@angular/forms';

export class ClusterFormUtil {

  public static addFieldRequirement(fieldName: string, form: FormGroup): void {
    form.get(fieldName).addValidators([Validators.required]);
    this.cleanFieldValue(fieldName, form);
  }

  public static removeFieldRequirement(fieldName: string, form: FormGroup): void {
    form.get(fieldName).removeValidators([Validators.required]);
    this.cleanFieldValue(fieldName, form);
  }

  public static cleanFieldValue(fieldName: string, form: FormGroup): void {
    form.get(fieldName).patchValue(null);
    form.get(fieldName).markAsUntouched();
  }
}