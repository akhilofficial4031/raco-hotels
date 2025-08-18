import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { SWRConfig } from "swr";

import "./index.css";
import router from "./routes";
import { SidebarProvider } from "./shared/providers/SidebarProvider";
import { fetcher } from "./utils/swrFetcher";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element with id "root" not found');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <SidebarProvider>
      <SWRConfig value={{ fetcher }}>
        <RouterProvider router={router} />
      </SWRConfig>
    </SidebarProvider>
  </React.StrictMode>,
);
