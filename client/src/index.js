import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import Auth0ProviderWithHistory from './Auth0ProviderWithHistory';

import './index.css';

const domain = 'dev-uuzc8f4uhchmjfcb.us.auth0.com';
const clientId = 'o3kKxoiIwrQYLJXtE9lS7yeu40RxZyAl';

ReactDOM.render(
  <BrowserRouter>
    <Auth0ProviderWithHistory>
      <App />
    </Auth0ProviderWithHistory>
  </BrowserRouter>,
  document.getElementById('root')
);
