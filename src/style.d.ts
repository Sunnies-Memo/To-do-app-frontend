import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    bgColor: string;
    boardColor: string;
    cardColor: string;
    btnColor: {
      btnDefault: string;
      btnHover: string;
    };
    themeBlue: {
      ligthBlue: string;
    };
    themeGray: {
      thickGray: string;
      lightGray: string;
    };
  }
}
