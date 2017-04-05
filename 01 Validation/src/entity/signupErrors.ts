import { FieldValidationResult } from 'lc-form-validation';

export class SignupErrors {
  username: FieldValidationResult;
  password: FieldValidationResult;
  confirmPassword: FieldValidationResult;
}
