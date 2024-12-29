export interface Theme {
  background: string;
  boardColor: string;
  cardColor: string;
  primaryAccent: string;
  secondaryAccent: string;
  textPrimary: string;
  textSecondary: string;
  dropArea: {
    default: string;
    draggingOver: string;
    fromThis: string;
  };
  btnColor: {
    btnDefault: string;
    btnHover: string;
  };
  bigBtn: {
    default: string;
    hover: string;
  };
  boxShadow: string;
  borderRadius: string;
  gradients: {
    primary: string;
    secondary: string;
  };
  borders: {
    pixel: string;
    soft: string;
  };
}

export const theme: Theme = {
  background: "#e6e6fa", // Pastel purple
  boardColor: "#ffffff",
  cardColor: "#ffffff",
  primaryAccent: "#c8a2c8", // Soft lavender
  secondaryAccent: "#ffb6c1", // Light pink
  textPrimary: "#2d0066", // Deep purple
  textSecondary: "#666666",

  dropArea: {
    default: "#ffffff",
    draggingOver: "#ffe4e1", // Misty rose
    fromThis: "#e6e6fa",
  },

  btnColor: {
    btnDefault: "#c8a2c8",
    btnHover: "#dda0dd",
  },

  bigBtn: {
    default: "#ffb6c1",
    hover: "#ffc0cb",
  },

  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  borderRadius: "12px",

  // Y2K specific styles
  gradients: {
    primary: "linear-gradient(135deg, #e6e6fa 0%, #fff0f5 100%)",
    secondary: "linear-gradient(135deg, #ffb6c1 0%, #e6e6fa 100%)",
  },

  borders: {
    pixel: "2px solid #2d0066",
    soft: "1px solid rgba(45, 0, 102, 0.2)",
  },
};
