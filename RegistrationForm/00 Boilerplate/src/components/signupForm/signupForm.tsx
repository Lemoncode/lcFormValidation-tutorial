import * as React from 'react';
import { Input } from '../common/input';
import { SignupEntity } from '../../entity/signupEntity';

interface Props extends React.Props<any> {
  signup: SignupEntity;
  onFieldChange(fieldName: string, value): void;
}

export class SignupForm extends React.Component<Props, {}> {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  private onChange(event) {
    const { name, value } = event.currentTarget;
    this.props.onFieldChange(name, value);
  }

  private onSave(event) {
    event.preventDefault();
    console.log('Form sent');
  }

  render() {
    return (
      <form>
        <h1>Signup Form</h1>
        <Input
          name="username"
          label="username"
          value={this.props.signup.username}
          onChange={this.onChange}
        />

        <Input
          type="password"
          name="password"
          label="password"
          value={this.props.signup.password}
          onChange={this.onChange}
        />

        <Input
          type="password"
          name="confirmPassword"
          label="confirm password"
          value={this.props.signup.confirmPassword}
          onChange={this.onChange}
        />
        <input type="submit" value="Save" className="btn btn-primary"
          onClick={this.onSave} />
      </form>
    );
  }
}
