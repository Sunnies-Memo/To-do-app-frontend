
import ReactDOM from 'react-dom/client';
import App from './App';
import { RecoilRoot } from 'recoil';
import { defaultTheme } from './theme';
import { Reset } from './GlobalStyle';
import { ThemeProvider } from 'styled-components';
import React from 'react';



const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <RecoilRoot>
      <ThemeProvider theme = {defaultTheme}>
        <Reset/>
        <App />
      </ThemeProvider>
    </RecoilRoot>
  </React.StrictMode>
);
