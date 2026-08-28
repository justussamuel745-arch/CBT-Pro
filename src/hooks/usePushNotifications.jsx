import { useEffect } from "react";
import pushNotificationService from "../services/pushNotificationService";
import { authStore } from '../stores/authStore';

export default function usePushNotifications() {
  const token  = authStore(state => state.token)

  useEffect(() => {
    if (!token) {
      return;
    }

    const initialize = async () => {
      try {
        const permission =
          pushNotificationService.getPermission();

        if (permission === "default") {
          await pushNotificationService.enable(token);
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