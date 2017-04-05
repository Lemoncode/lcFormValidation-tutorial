import {
  createFormValidation,
  FieldValidationResult,
  ValidationConstraints,
  Validators,
} from 'lc-form-validation';
import { gitHub } from '../../../api/gitHub';

function passwordAndConfirmPasswordValidationHandler(value: any, vm: any): FieldValidationResult {
  const passwordAndConfirmPasswordAreEqual = vm.password === value;
  const errorInfo = (passwordAndConfirmPasswordAreEqual) ? '' : 'Passwords do not match';

  const fieldValidationResult: FieldValidationResult = new FieldValidationResult();
  fieldValidationResult.type = 'PASSWORD_MATCH';
  fieldValidationResult.succeeded = passwordAndConfirmPasswordAreEqual;
  fieldValidationResult.errorMessage = errorInfo;

  return fieldValidationResult;
}

function usernameExistOnGitHubValidationHandler(value: any, vm: any): Promise<FieldValidationResult> {
  return gitHub.doesUsernameExists(value)
    .then((usernameExists) => resolveUsernameExists(usernameExists))
    .catch(error => console.log('ERROR', error));
}

function resolveUsernameExists(usernameExists: boolean): Promise<FieldValidationResult> {
  const fieldValidationResult: FieldValidationResult = new FieldValidationResult();
  fieldValidationResult.type = 'USER_GITHUB';
  fieldValidationResult.succeeded = !usernameExists;
  fieldValidationResult.errorMessage = (usernameExists) ? 'This user exists on GitHub' : '';
  return Promise.resolve(fieldValidationResult);
}

const signupValidationConstraints: ValidationConstraints = {
  fields: {
    password: [
      { validator: Validators.required },
      {
        validator: Validators.minLength,
        customParams: { length: 4 },
      },
    ],
    confirmPassword: [
      { validator: Validators.required },
      { validator: passwordAndConfirmPasswordValidationHandler },
    ],
    username: [
      {
        validator: Validators.required,
        eventsFilter: { onChange: true, onBlur: true },
      },
      {
        validator: usernameExistOnGitHubValidationHandler,
        eventsFilter: { onBlur: true }
      },
    ]
  }
};

export const signupFormValidation = createFormValidation(signupValidationConstraints);
