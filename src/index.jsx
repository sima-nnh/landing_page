import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Design } from "./screens/Design";

createRoot(document.getElementById("app")).render(
  <StrictMode>
    <Design />
    <SpeedInsights />
  </StrictMode>,
);
