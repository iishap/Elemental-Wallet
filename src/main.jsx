import React from "react";
import ReactDOM from "react-dom/client";
import Wallet from "./App.jsx";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Wallet />
    </ThemeProvider>
  </React.StrictMode>
);


