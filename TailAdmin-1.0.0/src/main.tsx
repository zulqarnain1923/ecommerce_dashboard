import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import Footer from "./components/footer/Footer.tsx";

import FullSiteProvider from "../src/context/fullsitecontext.tsx";


createRoot(document.getElementById("root")!).render(

  <FullSiteProvider>
    <StrictMode>
      <ThemeProvider>
        <AppWrapper>
          <App />
          <Footer />
        </AppWrapper>
      </ThemeProvider>
    </StrictMode>
  </FullSiteProvider>
);
