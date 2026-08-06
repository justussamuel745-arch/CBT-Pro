import { url } from "../scripts/utilis/url.js";

const BASE_URL = `${url}/api/push`;

class PushNotificationService {
  constructor() {
    this.registration = null;
  }

  /**
   * Check if Push Notifications are supported.
   */
  isSupported() {
    return (
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    );
  }

  /**
   * Wait for the registered service worker.
   */
  async getRegistration() {
    if (!this.isSupported()) {
      throw new Error("Push notifications are not supported.");
    }

    if (this.registration) {
      return this.registration;
    }

    this.registration = await navigator.serviceWorker.ready;

    return this.registration;
  }

  /**
   * Current notification permission.
   */
  getPermission() {
    if (!("Notification" in window)) {
      return "denied";
    }

    return Notification.permission;
  }

  /**
   * Ask the user for permission.
   */
  async requestPermission() {
    if (!("Notification" in window)) {
      throw new Error("Notifications are not supported.");
    }

    return await Notification.requestPermission();
  }

  /**
   * Convert VAPID public key.
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
      [...rawData].map((char) => char.charCodeAt(0))
    );
  }

  /**
   * Returns current subscription.
   */
  async getSubscription() {
    const registration = await this.getRegistration();

    return await registration.pushManager.getSubscription();
  }

  /**
   * Check if already subscribed.
   */
  async isSubscribed() {
    const subscription = await this.getSubscription();

    return subscription !== null;
  }

  /**
   * Subscribe browser.
   */
  async subscribe() {
    const registration = await this.getRegistration();

    let subscription =
      await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription =
        await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey:
            this.urlBase64ToUint8Array(
              import.meta.env.VITE_VAPID_PUBLIC_KEY
            ),
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
          'Authorization': `Bearer ${token}`,
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

    return await response.json();
  }

  /**
   * Remove subscription.
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
   * Enable Push Notifications.
   */
  async enable(token) {
    if (!this.isSupported()) {
      throw new Error(
        "Push notifications are not supported."
      );
    }

    let permission = this.getPermission();

    if (permission === "default") {
      permission =
        await this.requestPermission();
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
}

export default new PushNotificationService();