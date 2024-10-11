import React from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { Layout } from "./Layout.tsx";

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
        height: "100vh",
      },
    },
  },
});

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <ChakraProvider
      theme={theme}
      toastOptions={{ defaultOptions: { position: "top" } }}
    >
      <Layout />
    </ChakraProvider>
  </React.StrictMode>,
);
