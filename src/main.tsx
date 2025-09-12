import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";
import "./index.css";
import TokenRefreshSubscriber from "./services/TokenRefreshSubscriber";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div>Loading...</div>}>
        <AppRoutes />
        <Toaster />
        <TokenRefreshSubscriber />
      </Suspense>
    </QueryClientProvider>
  </StrictMode>
);
