import React from "react";
import ReactDOM from "react-dom";
import { extendTheme, ChakraProvider } from "@chakra-ui/react";
import { Layout } from "./Layout";
import { BrowserRouter } from "react-router-dom";
import { AppbarProvider } from "./contexts/AppbarContext";
import { RouterProvider } from "./contexts/RouterContext";

const theme = extendTheme({
  colors: {
    main: {
      darkPurple: "#232131",
      greyAccent: "#4E4C60",
      greyText: "#B9B9B9",
      lightPurple: "#383651",
      primaryOrange: "#ED9B60",
      regularPurple: "#2C2A41",
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "orange",
      },
    },
  },
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
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
        <RouterProvider>
          <AppbarProvider>
            <Layout />
          </AppbarProvider>
        </RouterProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);
