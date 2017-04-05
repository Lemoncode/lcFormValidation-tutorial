import { connect } from 'react-redux';
import { ValidationEventsFilter } from 'lc-form-validation';
import { SignupForm } from './signupForm';
import { SignupEntity } from '../../entity/signupEntity';
import { signupUIOnInteractionStart } from '../../actions/signupUIOnInteractionStart';
import { signupRequestStart } from '../../actions/signupRequestStart';

const mapStateToProps = (state) => {
  return {
    signup: state.signup.signup, // ViewModel
    errors: state.signup.signupErrors
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    fireValidationField: (viewModel: any, fieldName: string, value, filter?: ValidationEventsFilter) => {
      return dispatch(signupUIOnInteractionStart(viewModel, fieldName, value, filter));
    },
    performSignup: (signup: SignupEntity) => {
      return dispatch(signupRequestStart(signup));
    }
  };
};

export const SignupFormContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SignupForm);
