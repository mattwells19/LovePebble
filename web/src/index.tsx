import React from "react";
import ReactDOM from "react-dom";
import { extendTheme, ChakraProvider } from "@chakra-ui/react";
import { Layout } from "./Layout";
import { BrowserRouter } from "react-router-dom";
import { AppbarProvider } from "./contexts/AppbarContext";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  colors: {
    main: {
      darkPurple: "#232131",
      regularPurple: "#2C2A41",
      lightPurple: "#383651",
      greyText: "#B9B9B9",
      greyAccent: "#4E4C60",
      primaryOrange: "#ED9B60",
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "orange",
      },
    },
  },
  styles: {
    global: {
      body: {
        backgroundColor: "main.regularPurple",
      },
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AppbarProvider>
          <Layout />
        </AppbarProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);
