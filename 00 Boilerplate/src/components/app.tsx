import * as React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import reducers from '../reducers';
import { SignupFormContainer } from './signupForm/signupFormContainer';
import { store } from '../store';

export default class App extends React.Component<{}, {}> {
  render() {
    return (
      <Provider store={store}>
        <div className="container">
          <SignupFormContainer />
        </div>
      </Provider>
    );
  }
}
