import { SignupEntity } from '../entity/signupEntity';
import { actionsDef } from '../actions/actionsDef';
import { ISignupUIOnInteractionCompletedAction } from '../actions/signupUIOnInteractionCompleted';

class SignupState {
  signup: SignupEntity;

  constructor() {
    this.signup = new SignupEntity();
  }
}

export const signupReducer = (state: SignupState = new SignupState(), action): SignupState => {
  switch (action.type) {
    case actionsDef.signup.SIGNUP_PROCESS_UI_INTERACTION_COMPLETED:
      return signupProcessCompleted(state, action);

    default:
      return state;
  }
};

function signupProcessCompleted(state: SignupState, action: ISignupUIOnInteractionCompletedAction): SignupState {
  const signup: SignupEntity = {
    ...state.signup,
    [action.fieldName]: action.value
  };

  return { signup };
}
