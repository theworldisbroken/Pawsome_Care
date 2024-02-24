import React from 'react';
import { applyMiddleware, createStore } from "redux";
import { Provider } from 'react-redux'
import rootReducer from "./react/RootReducer"
import thunk from 'redux-thunk'

import ReactDOM from 'react-dom/client';
import App from './react/App';
import reportWebVitals from './reportWebVitals';

const initialState = {
}

const middlewares = [thunk]

const store = createStore(rootReducer, initialState, applyMiddleware(...middlewares));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    {/* <React.StrictMode> */}
    <App />
    {/* </React.StrictMode> */}
  </Provider>
);

reportWebVitals();