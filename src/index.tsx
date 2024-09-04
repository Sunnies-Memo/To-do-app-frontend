import ReactDOM from "react-dom/client";
import { RecoilRoot } from "recoil";
import { defaultTheme } from "./theme";
import { Reset } from "./GlobalStyle";
import { ThemeProvider } from "styled-components";
import React from "react";
import Router from "./Router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
const queryClient = new QueryClient();
root.render(
  <React.StrictMode>
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={defaultTheme}>
          <Reset />
          <Router />
        </ThemeProvider>
      </QueryClientProvider>
    </RecoilRoot>
  </React.StrictMode>
);
