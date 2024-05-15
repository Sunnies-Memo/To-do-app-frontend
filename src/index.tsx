
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from 'react-query';
import { RecoilRoot } from 'recoil';
import { darkTheme } from './theme';
import { Reset } from './GlobalStyle';
import { ThemeProvider } from 'styled-components';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  // <React.StrictMode>
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <RecoilRoot>
          <ThemeProvider theme = {darkTheme}>
            <Reset/>
            <App />
          </ThemeProvider>
        </RecoilRoot>
      </QueryClientProvider>
    </RecoilRoot>
  // </React.StrictMode>
);
