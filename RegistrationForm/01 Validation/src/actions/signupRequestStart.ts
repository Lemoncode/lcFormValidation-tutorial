import { FormValidationResult } from 'lc-form-validation';
import { signupRequestCompleted } from './signupRequestCompleted';
import { signupFormValidation } from '../components/signupForm/validations/signupFormValidation';

export function signupRequestStart(viewModel: any) {
  return (dispatch) => {
    signupFormValidation.validateForm(viewModel).then(
      (formValidationResult: FormValidationResult) => {
        if (formValidationResult.succeeded) {
          console.log("Sign up completed");
        }
        dispatch(signupRequestCompleted(formValidationResult));
      }
    );
  };
}
