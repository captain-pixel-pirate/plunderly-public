"use client";

import { useState, useContext, createContext } from "react";

import { PageLoading } from "@components/ux";

export const LoadingContext = createContext({
  setIsPageLoading: (values: boolean) => {},
  isPageLoading: false,
  togglePageLoading: () => {},
});

export const useLoadingContext = () => {
  const loadingContext = useContext(LoadingContext);

  if (loadingContext === null) {
    throw new Error("Error retrieving loading context.");
  }
  return loadingContext;
};

export default function LoadingContextProvider({ children }: any) {
  const [isPageLoading, setIsPageLoading] = useState(false);

  function togglePageLoading() {
    setIsPageLoading((prev) => !prev);
  }

  return (
    <LoadingContext.Provider
      value={{ setIsPageLoading, isPageLoading, togglePageLoading }}
    >
      {isPageLoading && <PageLoading />}
      {children}
    </LoadingContext.Provider>
  );
}
