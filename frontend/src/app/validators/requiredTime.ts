import {AbstractControl, FormGroup, ValidationErrors, ValidatorFn} from "@angular/forms";

export const requiredTimeValidator: ValidatorFn  = (
  control: AbstractControl): ValidationErrors | null => {
    const start = control.get('startTime')?.value;
    const end = control.get('endTime')?.value;
    const startBeforeEnd = start > end;

    return start && end && startBeforeEnd ? {wrongTime: true} : null;
  };

