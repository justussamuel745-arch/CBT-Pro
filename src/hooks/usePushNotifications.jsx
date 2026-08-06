import { useEffect, useContext } from "react";
import pushNotificationService from "../services/pushNotificationService";
import UserContext from "../context/UserContext";

export default function usePushNotifications() {
  const { token } = useContext(UserContext)

  useEffect(() => {
    if (!token) {
      return;
    }

    const initialize = async () => {
      try {
        const permission =
          pushNotificationService.getPermission();

        if (permission === "default") {
          await pushNotificationService.enable();
        }
      } catch (error) {
        console.error(
          "Push notification initialization failed:",
          error
        );
      }
    };

    initialize();
  }, [token]);
}