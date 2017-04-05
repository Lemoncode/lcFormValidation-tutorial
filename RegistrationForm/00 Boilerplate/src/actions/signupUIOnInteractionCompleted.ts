import { actionsDef } from './actionsDef';

interface ISignupUIOnInteractionCompletedAction {
  type: string;
  fieldName: string;
  value: any;
}

const signupUIOnInteractionCompleted = (
  fieldName: string,
  value: any,
): ISignupUIOnInteractionCompletedAction => {
  return {
    type: actionsDef.signup.SIGNUP_PROCESS_UI_INTERACTION_COMPLETED,
    fieldName,
    value,
  };
};

export {
  ISignupUIOnInteractionCompletedAction,
  signupUIOnInteractionCompleted
}
