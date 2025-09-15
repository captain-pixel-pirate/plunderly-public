"use client";

import {
  useState,
  useContext,
  createContext,
  useCallback,
  ReactNode,
} from "react";
import { v4 } from "uuid";

import { Stack, Box } from "@mui/material";

import { Alert } from "@components/ux";

export type AlertMessage = {
  id: string;
  severity: "error" | "info" | "success" | "warning";
  variant: "filled" | "outlined" | "standard";
  text: string;
  alertTitle?: string;
};

export type NewAlertMessage = {
  text: string;
  severity?: "error" | "info" | "success" | "warning";
  variant?: "filled" | "outlined" | "standard";
  alertTitle?: string;
};

export const NotificationContext = createContext({
  addAlertMessage: (alertMessage: NewAlertMessage) => {},
});

export const useNotificationContext = () => {
  const notificationContext = useContext(NotificationContext);
  if (notificationContext === null) {
    throw new Error("Error retrieving context for notification");
  }
  return notificationContext;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [alertMessages, setAlertMessages] = useState<AlertMessage[]>([]);

  const addAlertMessage = ({
    text,
    severity = "info",
    variant = "filled",
    alertTitle = "",
  }: NewAlertMessage) => {
    const newAlert: AlertMessage = {
      id: v4(),
      text,
      severity,
      variant,
      alertTitle,
    };

    setAlertMessages((prevAlerts) => {
      const trimmedAlerts = prevAlerts.slice(-1);
      return [...trimmedAlerts, newAlert];
    });
  };

  const removeAlertMessage = useCallback((id: string) => {
    setAlertMessages((prevAlertMessages) =>
      prevAlertMessages.filter((alertMessage) => alertMessage.id !== id)
    );
  }, []);

  return (
    <NotificationContext.Provider value={{ addAlertMessage }}>
      {children}
      <Box
        sx={{
          position: "fixed",
          bottom: 25,
          left: 25,
          zIndex: (theme) => theme.zIndex.tooltip,
          paddingBottom: 1,
          paddingLeft: 1,
        }}
      >
        <Stack spacing={1}>
          {alertMessages.map((alertMessage) => (
            <Alert
              key={alertMessage.id}
              id={alertMessage.id}
              severity={alertMessage.severity}
              variant={alertMessage.variant}
              text={alertMessage.text}
              alertTitle={alertMessage.alertTitle}
              removeSelf={(id) => {
                removeAlertMessage(id);
              }}
            />
          ))}
        </Stack>
      </Box>
    </NotificationContext.Provider>
  );
};
