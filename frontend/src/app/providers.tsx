"use client";

import "@fontsource/poppins";

import {
  GlobalProvider,
  LoadingContextProvider,
  NotificationProvider,
  ThemeModeProvider,
} from "@context";
import { AppBar } from "@components/appbar";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NotificationProvider>
        <ThemeModeProvider>
          <LoadingContextProvider>
            <GlobalProvider>
              <AppBar />
              {children}
            </GlobalProvider>
          </LoadingContextProvider>
        </ThemeModeProvider>
      </NotificationProvider>
    </>
  );
}
