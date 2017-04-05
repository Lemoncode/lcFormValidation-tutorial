# 01 Validation

In this example we'll refactor the sign up form to support form validations. We'll add the next validations to our sign up entity:

- **username** is mandatory and can not be in the Lemoncode organization people list in GitHub. We'll apply the GitHub validation on blur to make a request on every keystroke.
- **password** is mandatory and needs to have at least 4 characters.
- **confirm password** is mandatory and has to be the same password as **password** field.

## Prerequisites
You will need [Node.js + npm](https://nodejs.org/en/) installed in your computer. We'll take as starting point the sample [00 Boilerplate](../00%20Boilerplate).

## Applying validation.

To apply validation in a React + Redux application we'll need to:
- implement errors in the state to notify our components if we're free of validation errors to submit the form, so we'll need to change our reducer.
- implement actions that trigger the validation service to get the errors to pass to the reducer.
- change the container component to implement the new actions.
- change the form component to display errors in the UI.

Let's get started.

First let's install [`lc-form-validation`](https://www.npmjs.com/package/lc-form-validation) library using `npm`:

```shell
npm install --save lc-form-validation
```

We'll create a validation service beside our `SignupForm` component, in `src/components/signupForm/validations/` called `signupFormValidation.ts`. In this file we'll create the constraints and the validation service for our sign up form:

```ts
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
```

We'll implement a entity under `src/entity` that reflect each field error. Actually `lc-form-validation` library provides a field error entity we can take advantage of, so let's create a `signupErrors.ts`:

```ts
import { FieldValidationResult } from 'lc-form-validation';

export class SignupErrors {
  username: FieldValidationResult;
  password: FieldValidationResult;
  confirmPassword: FieldValidationResult;
}
```

We'll refactor our `signup` reducer under `src/reducers/` folder to implement the error entity in the state. We'll also change for now the `signupProcessCompleted` return to also accept the current `signupErrors` state:

```diff
  import { SignupEntity } from '../entity/signupEntity';
+ import { SignupErrors } from '../entity/signupErrors';
  import { actionsDef } from '../actions/actionsDef';
  import { ISignupUIOnInteractionCompletedAction } from '../actions/signupUIOnInteractionCompleted';

  class SignupState {
    signup: SignupEntity;
+   signupErrors: SignupErrors;

    constructor() {
      this.signup = new SignupEntity();
+     this.signupErrors = new SignupErrors();
    }
  }

  ...

  function signupProcessCompleted(state: SignupState, action: ISignupUIOnInteractionCompletedAction): SignupState {
    const signup: SignupEntity = {
      ...state.signup,
      [action.fieldName]: action.value
    };

-   return { signup };
+   return { ...state, signup };
  }
```

Let's split the action `signupUIOnInteractionCompleted` into two actions, a `start` action that will take the field and the value and validate them, and the actual `completed` action creator that passes the validation, field, and value to the reducer. Let's create first a `signupUIOnInteractionStart.ts` inside `src/actions/`. This action will take the field, value and a events filter and use the validation service we've created to validate the field. Once it is validated it will dispatch the validation result with the field and value:

```ts
import { FieldValidationResult, ValidationEventsFilter } from 'lc-form-validation';
import { signupUIOnInteractionCompleted } from './signupUIOnInteractionCompleted';
import { signupFormValidation } from '../components/signupForm/validations/signupFormValidation';

export function signupUIOnInteractionStart(viewModel: any, fieldName: string, value: any, eventsFilter?: ValidationEventsFilter) {
  return (dispatcher) => {
    signupFormValidation.validateField(viewModel, fieldName, value, eventsFilter).then(
      (fieldValidationResult: FieldValidationResult) => {
        dispatcher(signupUIOnInteractionCompleted(fieldName, value, fieldValidationResult));
      }
    );
  };
}
```

We'll change the `signupUIOnInteractionCompleted.ts` action to accept the field, value and the validation result and pass them to the reducer:

```diff
+ import { FieldValidationResult } from 'lc-form-validation';
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
+   fieldValidationResult: FieldValidationResult,
  ): ISignupUIOnInteractionCompletedAction => {
    return {
      type: actionsDef.signup.SIGNUP_PROCESS_UI_INTERACTION_COMPLETED,
      fieldName,
      value,
+     fieldValidationResult,
    };
  };

  export {
    ISignupUIOnInteractionCompletedAction,
    signupUIOnInteractionCompleted
  }
```

We'll change the `signupFormContainer.ts` to dispatch a `signupUIOnInteractionCompleted` action instead of `signupUIOnInteractionCompleted`:

```diff
  import { connect } from 'react-redux';
+ import { ValidationEventsFilter } from 'lc-form-validation';
  import { SignupForm } from './signupForm';
- import { signupUIOnInteractionCompleted } from '../../actions/signupUIOnInteractionCompleted';
+ import { signupUIOnInteractionStart } from '../../actions/signupUIOnInteractionStart';

  const mapStateToProps = (state) => {
    return {
      signup: state.signup.signup, // ViewModel
    }
  };

  const mapDispatchToProps = (dispatch) => {
    return {
-     onFieldChange: (fieldName: string, value) => {
+     fireValidationField: (viewModel: any, fieldName: string, value, filter?: ValidationEventsFilter) => {
-       return dispatch(signupUIOnInteractionCompleted(fieldName, value));
+       return dispatch(signupUIOnInteractionStart(viewModel, fieldName, value, filter));
      },
    };
  };

  export const SignupFormContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(SignupForm);
```

We need to change the `signupForm.tsx` component to use the new `onFieldChange` signature. We'll call it `fireValidationField`. We'll also add a private method to get the field name and value of a field and trigger the `fireValidationField` method:

```diff
  import * as React from 'react';
  import { Input } from '../common/input';
  import { SignupEntity } from '../../entity/signupEntity';
+ import { ValidationEventsFilter } from 'lc-form-validation';

  interface Props extends React.Props<any> {
    signup: SignupEntity;
-   onFieldChange(fieldName: string, value): void;
+   fireValidationField: (viewModel: any, fieldName: string, value: string, filter?: ValidationEventsFilter) => void;
  }

  export class SignupForm extends React.Component<Props, {}> {
    constructor(props) {
      super(props);
-     this.onChange = this.onChange.bind(this);
    }

+   private applyFieldValidation(event, filter?: ValidationEventsFilter) {
+     const { name, value } = event.target;
+     this.props.fireValidationField(this.props.signup, name, value, filter);
+   }

-   private onChange(event) {
-     const { name, value } = event.currentTarget;
-     // this.props.onFieldChange(name, value);
-   }

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
-           onChange={this.onChange}
+           onBlur={(event) => {
+             this.applyFieldValidation(event, { onBlur: true });
+           }}
+           onChange={(event) => {
+             this.applyFieldValidation(event);
+           }}
          />

          <Input
            type="password"
            name="password"
            label="password"
            value={this.props.signup.password}
-           onChange={this.onChange}
+           onChange={(event) => {
+             this.applyFieldValidation(event);
+           }}
          />

          <Input
            type="password"
            name="confirmPassword"
            label="confirm password"
            value={this.props.signup.confirmPassword}
-           onChange={this.onChange}
+           onChange={(event) => {
+             this.applyFieldValidation(event);
+           }}
+         />
          <input type="submit" value="Save" className="btn btn-primary"
            onClick={this.onSave} />
        </form>
      );
    }
  }
```

We'll also add the onBlur validation against our GitHub service so we'll add `onBlur` optional property in the `input.tsx` component under `src/components/common`:

```diff
  interface Props {
    name: string;
    label: string;
+   onBlur?(event): void;
    onChange(event): void;
    placeholder?: string;
    value: string;
    type?: string;
  }

  export const Input: React.StatelessComponent<Props> = (props) => {
    return (
      <div className="form-group">
        <label htmlFor={props.name}>{props.label}</label>
        <input
          id={props.name}
          type={props.type}
          name={props.name}
          className="form-control"
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
+         onBlur={props.onBlur}
        />
      </div>
    );
  };
```

We need to change now the `signupReducer` to add the field validation in the corresponding field in the state:

```diff
  function signupProcessCompleted(state: SignupState, action: ISignupUIOnInteractionCompletedAction): SignupState {
    const signup: SignupEntity = {
      ...state.signup,
      [action.fieldName]: action.value
    };

+   const signupErrors: SignupErrors = {
+     ...state.signupErrors,
+     [action.fieldName]: action.fieldValidationResult
+   };

-   return { ...state, signup };
+   return { ...state, signup, signupErrors };
  }
```

We have not a validation result per field in the state. It's time to show the proper error when a field is not valid. To do that let's add a property called `error` in the `input.tsx` component that will hold the error message. First let's inject the errors state in the `mapStateToProps` of our `signupFormContainer.ts` component under `src/components/signupForm`:

```diff
  const mapStateToProps = (state) => {
    return {
      signup: state.signup.signup, // ViewModel
+     errors: state.signup.signupErrors
    }
  };
```

Then we'll add the errors property in `signupForm.tsx` component and pass each error if any to each `<Input />` component.

```diff
  import * as React from 'react';
  import { Input } from '../common/input';
  import { SignupEntity } from '../../entity/signupEntity';
+ import { SignupErrors } from '../../entity/signupErrors';
  import { ValidationEventsFilter } from 'lc-form-validation';

  interface Props {
    signup: SignupEntity;
+   errors: SignupErrors;
    fireValidationField: (viewModel: any, fieldName: string, value: string, filter?: ValidationEventsFilter) => void;
  }

  export class SignupForm extends React.Component<Props, {}> {
    ...

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
+           error={(this.props.errors.username) ? this.props.errors.username.errorMessage : ''}
          />

          <Input
            type="password"
            name="password"
            label="password"
            value={this.props.signup.password}
            onChange={(event) => {
              this.applyFieldValidation(event);
            }}
+           error={(this.props.errors.password) ? this.props.errors.password.errorMessage : ''}
          />

          <Input
            type="password"
            name="confirmPassword"
            label="confirm password"
            value={this.props.signup.confirmPassword}
            onChange={(event) => {
              this.applyFieldValidation(event);
            }}
+           error={(this.props.errors.confirmPassword) ? this.props.errors.confirmPassword.errorMessage : ''}
          />
          <input type="submit" value="Save" className="btn btn-primary"
            onClick={this.onSave} />
        </form>
      );
    }
  }
```

Finally let's refactor the `input.tsx` component under `src/components/common` to implement the error property:

```diff
  interface Props {
    name: string;
    label: string;
    onBlur?(event): void;
    onChange(event): void;
    placeholder?: string;
    value: string;
    type?: string;
+   error: string;
  }

  export const Input: React.StatelessComponent<Props> = (props) => {
+   let className = 'form-group';
+   if (props.error) {
+     className = `${className} has-error`;
+   }
    return (
-     <div className="form-group">
+     <div className={className}>
        <label htmlFor={props.name}>{props.label}</label>
        <input
          id={props.name}
          type={props.type}
          name={props.name}
          className="form-control"
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
          onBlur={props.onBlur}
        />
+       <div className="help-block">{props.error}</div>
      </div>
    );
  };
```

We've almost finished, the remaining task is to change the button to validate the entire form when pressed. To do that we'll need to create a new action that validates the entire sign up entity. First let's create a constant for that action in `actionDefs.ts` under `src/actions`:

```diff
  export const actionsDef = {
    signup: {
      SIGNUP_PROCESS_UI_INTERACTION_COMPLETED: 'SIGNUP_PROCESS_UI_INTERACTION_COMPLETED',
+     SIGNUP_REQUEST_COMPLETED: 'SIGNUP_REQUEST_COMPLETED',
    }
  };
```
Let's start by creating an action creator that receives a complete form validation result and return an action. We'll create a file named `signupRequestCompleted.ts` under `src/actions` folder:

```ts
import { actionsDef } from './actionsDef';
import { FormValidationResult } from 'lc-form-validation';

interface ISignupRequestCompletedAction {
  type: string;
  formValidationResult: FormValidationResult;
}

const signupRequestCompleted = (formValidationResult: FormValidationResult): ISignupRequestCompletedAction => {
  return {
    type: actionsDef.signup.SIGNUP_REQUEST_COMPLETED,
    formValidationResult
  }
};

export {
  ISignupRequestCompletedAction,
  signupRequestCompleted
}
```

Then we'll create a _thunk_ to validate the entire sign up entity. We'll create a new file called `signupRequestStart.ts` under `src/actions`:

```ts
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
```

Next we'll refactor our reducer to handle the new action. It will read every field validation from the global validation result and it will inject it into each signupError in the state:

```diff
  import { SignupEntity } from '../entity/signupEntity';
  import { SignupErrors } from '../entity/signupErrors';
  import { actionsDef } from '../actions/actionsDef';
  import { ISignupUIOnInteractionCompletedAction } from '../actions/signupUIOnInteractionCompleted';
+ import { ISignupRequestCompletedAction } from '../actions/signupRequestCompleted';

  ...

  export const signupReducer = (state: SignupState = new SignupState(), action): SignupState => {
    switch (action.type) {
      case actionsDef.signup.SIGNUP_PROCESS_UI_INTERACTION_COMPLETED:
        return signupProcessCompleted(state, action);

+     case actionsDef.signup.SIGNUP_REQUEST_COMPLETED:
+       return performSignupCompleted(state, action);
+
      default:
        return state;
    }
  };

  function signupProcessCompleted(state: SignupState, action: ISignupUIOnInteractionCompletedAction): SignupState {
    ...
  }

+ function performSignupCompleted(state: SignupState, action: ISignupRequestCompletedAction): SignupState {
+   const signupErrors: SignupErrors = { ...state.signupErrors };

+   action.formValidationResult.fieldErrors.forEach(fieldValidationResult => {
+     signupErrors[fieldValidationResult.key] = fieldValidationResult;
+   });

+   return {
+     ...state,
+     signupErrors,
+   };
+ }
```

Let's use the new action in a new method caled `performSignup` in the `signupFormContainer.ts` component inside `src/components/signupForm/` folder:

```diff
  import { connect } from 'react-redux';
  import { ValidationEventsFilter } from 'lc-form-validation';
  import { SignupForm } from './signupForm';
+ import { SignupEntity } from '../../entity/signupEntity';
  import { signupUIOnInteractionStart } from '../../actions/signupUIOnInteractionStart';
+ import { signupRequestStart } from '../../actions/signupRequestStart';

  ...

  const mapDispatchToProps = (dispatch) => {
    return {
      fireValidationField: (viewModel: any, fieldName: string, value, filter?: ValidationEventsFilter) => {
        return dispatch(signupUIOnInteractionStart(viewModel, fieldName, value, filter));
      },
+     performSignup: (signup: SignupEntity) => {
+       return dispatch(signupRequestStart(signup));
+     }
    };
  };
```

Finally let's add the new `performSignup` property to the `signupForm.tsx` component under `src/components/signupForm/` folder:

```diff
  interface Props {
    signup: SignupEntity;
    errors: SignupErrors;
    fireValidationField: (viewModel: any, fieldName: string, value: string, filter?: ValidationEventsFilter) => void;
+   performSignup: (signup: SignupEntity) => void;
  }

  export class SignupForm extends React.Component<Props, {}> {
    constructor(props) {
      super(props);
+     this.onSave = this.onSave.bind(this);
    }

    private applyFieldValidation(event, filter?: ValidationEventsFilter) {
      const { name, value } = event.target;
      this.props.fireValidationField(this.props.signup, name, value, filter);
    }

    private onSave(event) {
      event.preventDefault();
-     console.log('Form sent');
+     this.props.performSignup(this.props.signup);
    }

    ...

  }
```

To run this example simply:
- open a command prompt and locate yourself into the root of the project folder.
- perform a `npm install` if you didn't.
- perform a `npm start` to bootstrap the app.
- Open your favourite browser and go to [http://localhost:8080](http://localhost:8080) to see the result.

# About Lemoncode
We are a team of long-term experienced freelance developers, established as a group in 2010. We specialize in Front End technologies and .NET. [Click here](http://lemoncode.net/services/en/#en-home) to get more info about us.
