import * as React from 'react';
import { Input } from '../common/input';
import { SignupEntity } from '../../entity/signupEntity';
import { SignupErrors } from '../../entity/signupErrors';
import { ValidationEventsFilter } from 'lc-form-validation';

interface Props {
  signup: SignupEntity;
  errors: SignupErrors;
  fireValidationField: (viewModel: any, fieldName: string, value: string, filter?: ValidationEventsFilter) => void;
  performSignup: (signup: SignupEntity) => void;
}

export class SignupForm extends React.Component<Props, {}> {
  constructor(props) {
    super(props);
    this.onSave = this.onSave.bind(this);
  }

  private applyFieldValidation(event, filter?: ValidationEventsFilter) {
    const { name, value } = event.target;
    this.props.fireValidationField(this.props.signup, name, value, filter);
  }

  private onSave(event) {
    event.preventDefault();
    this.props.performSignup(this.props.signup);
  }

  render() {
    return (
      <form>
        <h1>Signup Form</h1>
        <Input
          name="username"
          label="username"
          value={this.props.signup.username}
          onBlur={(event) => {
            this.applyFieldValidation(event, { onBlur: true });
          }}
          onChange={(event) => {
            this.applyFieldValidation(event);
          }}
          error={(this.props.errors.username) ? this.props.errors.username.errorMessage : ''}
        />

        <Input
          type="password"
          name="password"
          label="password"
          value={this.props.signup.password}
          onChange={(event) => {
            this.applyFieldValidation(event);
          }}
          error={(this.props.errors.password) ? this.props.errors.password.errorMessage : ''}
        />

        <Input
          type="password"
          name="confirmPassword"
          label="confirm password"
          value={this.props.signup.confirmPassword}
          onChange={(event) => {
            this.applyFieldValidation(event);
          }}
          error={(this.props.errors.confirmPassword) ? this.props.errors.confirmPassword.errorMessage : ''}
        />
        <input type="submit" value="Save" className="btn btn-primary"
          onClick={this.onSave} />
      </form>
    );
  }
}
