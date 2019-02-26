import React, { Component } from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import AppContainer from './src/AppContainer';
import reducer from './src/components/RootReducer';

const store = createStore(reducer);
console.log(store.getState());

export default class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <AppContainer />
            </Provider>
        );
    }
}