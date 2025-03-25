import React from 'react';
import ReactDOM from 'react-dom';
import './assets/styles/global.css';  // Importing global CSS
import { Provider } from 'react-redux';
import App from './App';
import store from './store';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
