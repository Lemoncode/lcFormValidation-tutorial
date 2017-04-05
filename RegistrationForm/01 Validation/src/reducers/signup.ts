import { SignupEntity } from '../entity/signupEntity';
import { SignupErrors } from '../entity/signupErrors';
import { actionsDef } from '../actions/actionsDef';
import { ISignupUIOnInteractionCompletedAction } from '../actions/signupUIOnInteractionCompleted';
import { ISignupRequestCompletedAction } from '../actions/signupRequestCompleted';

class SignupState {
  signup: SignupEntity;
  signupErrors: SignupErrors;

  constructor() {
    this.signup = new SignupEntity();
    this.signupErrors = new SignupErrors();
  }
}

export const signupReducer = (state: SignupState = new SignupState(), action): SignupState => {
  switch (action.type) {
    case actionsDef.signup.SIGNUP_PROCESS_UI_INTERACTION_COMPLETED:
      return signupProcessCompleted(state, action);

    case actionsDef.signup.SIGNUP_REQUEST_COMPLETED:
      return performSignupCompleted(state, action);

    default:
      return state;
  }
};

function signupProcessCompleted(state: SignupState, action: ISignupUIOnInteractionCompletedAction): SignupState {
  const signup: SignupEntity = {
    ...state.signup,
    [action.fieldName]: action.value
  };

  const signupErrors: SignupErrors = {
    ...state.signupErrors,
    [action.fieldName]: action.fieldValidationResult
  };

  return { ...state, signup, signupErrors };
}

function performSignupCompleted(state: SignupState, action: ISignupRequestCompletedAction): SignupState {
  const signupErrors: SignupErrors = { ...state.signupErrors };

  action.formValidationResult.fieldErrors.forEach(fieldValidationResult => {
    signupErrors[fieldValidationResult.key] = fieldValidationResult;
  });

  return {
    ...state,
    signupErrors,
  };
}
