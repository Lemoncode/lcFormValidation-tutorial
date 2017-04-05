import { connect } from 'react-redux';
import { SignupForm } from './signupForm';
import { signupUIOnInteractionCompleted } from '../../actions/signupUIOnInteractionCompleted';

const mapStateToProps = (state) => {
  return {
    signup: state.signup.signup, // ViewModel
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    onFieldChange: (fieldName: string, value) => {
      return dispatch(signupUIOnInteractionCompleted(fieldName, value));
    },
  };
};

export const SignupFormContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SignupForm);
