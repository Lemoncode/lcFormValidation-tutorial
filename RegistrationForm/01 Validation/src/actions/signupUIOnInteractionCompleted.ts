import { FieldValidationResult } from 'lc-form-validation';
import { actionsDef } from './actionsDef';

interface ISignupUIOnInteractionCompletedAction {
  type: string;
  fieldName: string;
  value: any;
  fieldValidationResult: FieldValidationResult;
}

const signupUIOnInteractionCompleted = (
  fieldName: string,
  value: any,
  fieldValidationResult: FieldValidationResult,
): ISignupUIOnInteractionCompletedAction => {
  return {
    type: actionsDef.signup.SIGNUP_PROCESS_UI_INTERACTION_COMPLETED,
    fieldName,
    value,
    fieldValidationResult,
  };
};

export {
  ISignupUIOnInteractionCompletedAction,
  signupUIOnInteractionCompleted
}
