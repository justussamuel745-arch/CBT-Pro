export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission =
    await Notification.requestPermission();

  return permission === 'granted';
};

export const showNotification = async ({ title, body }) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      icon: '/icons/pwa-512x512.png',
      badge: '/icons/pwa-512x512.png',
    });
    return true;
  } catch (err) {
    console.error('showNotification failed:', err);
    return false;
  }
};



