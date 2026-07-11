import { createTheme } from "@mui/material/styles";

export const adminMuiTheme = createTheme({
  palette: {
    primary: {
      main: "#659287",
    },
    secondary: {
      main: "#88BDA4",
    },
    error: {
      main: "#dc2626",
    },
  },
  typography: {
    fontFamily: "inherit",
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: false,
      },
    },
    MuiPopover: {
      defaultProps: {
        container: () => document.body,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  },
});
