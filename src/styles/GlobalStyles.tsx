import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'VT323', monospace;
    background: ${({ theme }) => theme.background};
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px);
    background-size: 20px 20px;
    color: ${({ theme }) => theme.textPrimary};
  }

  * {
    box-sizing: border-box;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    font-family: 'VT323', monospace;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-1px);
    }
  }

  input {
    font-family: 'VT323', monospace;
  }
`;
