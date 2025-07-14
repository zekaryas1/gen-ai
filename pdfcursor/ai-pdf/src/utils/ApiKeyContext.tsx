"use client";
import { createContext, useState } from "react";

export const ApiKeyContext = createContext({
  apiKey: "",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update: (key: string) => {},
});

export function ApiKeyContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [apiKey, setApiKey] = useState("");

  return (
    <ApiKeyContext.Provider
      value={{
        apiKey: apiKey,
        update: (key) => {
          setApiKey(key);
        },
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}
