import { ThemeProvider } from "styled-components";
import { Reset } from "./GlobalStyle";
import { darkTheme } from "./theme";

function App() {
  return (
    <>
    <ThemeProvider theme={darkTheme}>
      <Reset/>
    </ThemeProvider>
    </>
  );
}

export default App;
