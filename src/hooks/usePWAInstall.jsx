import { useEffect, useState } from "react";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export default function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(isStandalone());

  useEffect(() => {
    setIsInstalled(isStandalone());

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt((prev) => prev ?? e);
      setCanInstall(true);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setCanInstall(false);
      setIsInstalled(true);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstall
    );

    window.addEventListener(
      "appinstalled",
      handleInstalled
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstall
      );

      window.removeEventListener(
        "appinstalled",
        handleInstalled
      );
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setCanInstall(false);

    return outcome === "accepted";
  };

  return {
    canInstall,
    isInstalled,
    install,
  };
}