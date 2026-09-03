import { url } from "../constant/url.js";

const BASE_URL = `${url}/api/push`;

class PushNotificationService {
  constructor() {
    this.registration = null;
  }

  /**
   * Check if push notifications are supported.
   */
  isSupported() {
    return (
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    );
  }

  /**
   * Get the registered service worker.
   */
  async getRegistration() {
    if (!this.isSupported()) {
      throw new Error("Push notifications are not supported.");
    }

    if (!this.registration) {
      this.registration = await navigator.serviceWorker.ready;
    }

    return this.registration;
  }

  /**
   * Get current notification permission.
   */
  getPermission() {
    if (!("Notification" in window)) {
      return "denied";
    }

    return Notification.permission;
  }

  /**
   * Request notification permission.
   */
  async requestPermission() {
    if (!("Notification" in window)) {
      throw new Error("Notifications are not supported.");
    }

    return Notification.requestPermission();
  }

  /**
   * Convert VAPID public key to Uint8Array.
   */
  urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat(
      (4 - (base64String.length % 4)) % 4
    );

    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = atob(base64);

    return Uint8Array.from(
      [ ...rawData ].map((char) => char.charCodeAt(0))
    );
  }

  /**
   * Get current push subscription.
   */
  async getSubscription() {
    const registration = await this.getRegistration();

    return registration.pushManager.getSubscription();
  }

  /**
   * Check whether the browser is subscribed.
   */
  async isSubscribed() {
    const subscription = await this.getSubscription();

    return subscription !== null;
  }

  /**
   * Subscribe the browser to push notifications.
   */
  async subscribe() {
    const registration = await this.getRegistration();

    let subscription =
      await registration.pushManager.getSubscription();

    if (!subscription) {
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

      if (!vapidKey) {
        throw new Error("VAPID public key is missing.");
      }

      subscription =
        await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey:
            this.urlBase64ToUint8Array(vapidKey),
        });
    }

    return subscription;
  }

  /**
   * Save subscription on backend.
   */
  async saveSubscription(subscription, token) {
    const response = await fetch(
      `${BASE_URL}/subscribe`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscription,
          userAgent: navigator.userAgent,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to save push subscription."
      );
    }

    return response.json();
  }

  /**
   * Remove subscription from backend and browser.
   */
  async unsubscribe(token) {
    const subscription =
      await this.getSubscription();

    if (!subscription) {
      return;
    }

    const response = await fetch(
      `${BASE_URL}/unsubscribe`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to remove push subscription."
      );
    }

    await subscription.unsubscribe();

    this.registration = null;
  }

  /**
   * Enable push notifications.
   */
  async enable(token) {
    if (!this.isSupported()) {
      throw new Error(
        "Push notifications are not supported."
      );
    }

    let permission = this.getPermission();

    if (permission === "default") {
      permission = await this.requestPermission();
    }

    if (permission !== "granted") {
      throw new Error(
        "Notification permission denied."
      );
    }

    const subscription =
      await this.subscribe();

    await this.saveSubscription(
      subscription,
      token
    );

    return subscription;
  }


  /**
 * Show a notification through the service worker.
 */
  async showNotification({
    title,
    body,
  }) {
    if (
      !("Notification" in window) ||
      Notification.permission !== "granted"
    ) {
      return false;
    }

    if (!("serviceWorker" in navigator)) {
      return false;
    }

    try {
      const registration =
        await navigator.serviceWorker.ready;

      await registration.showNotification(title, {
        body,
        icon: `${window.location.origin}/icons/pwa-512x512-circle.png`,
        badge: `${window.location.origin}/icons/badge-96x96.png`,
      });

      return true;
    } catch (err) {
      console.error(
        "showNotification failed:",
        err
      );

      return false;
    }
  }
}

export default new PushNotificationService();