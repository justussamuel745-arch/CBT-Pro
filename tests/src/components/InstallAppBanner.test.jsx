import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import UserContext from "../../../src/context/UserContext";
import { InstallAppBanner, InstallAppCard } from "../../../src/components/InstallAppBanner";

// Note: if your Vitest config doesn't already handle CSS imports
// (most Vite setups do by default), you may need:
// vi.mock("../../src/components/InstallAppBanner.css", () => ({}));

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DURATION = 24 * 60 * 60 * 1000;

/* --------------------------- User-agent fixtures --------------------------- */

const IOS_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const IOS_CHROME =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/119.0.6045.109 Mobile/15E148 Safari/604.1";
const ANDROID_CHROME =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36";
const ANDROID_SAMSUNG =
  "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36";
const ANDROID_FIREFOX =
  "Mozilla/5.0 (Android 13; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0";
const ANDROID_OPERA =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Mobile Safari/537.36 OPR/78.0.4093.72";
const DESKTOP_CHROME =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";
const DESKTOP_FIREFOX =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0";
const DESKTOP_SAFARI =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

function setUserAgent(ua) {
  Object.defineProperty(window.navigator, "userAgent", {
    value: ua,
    configurable: true,
  });
}

/* --------------------------------- Helpers --------------------------------- */

function makePwa(overrides = {}) {
  return {
    canInstall: false,
    isInstalled: false,
    install: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

function renderBanner(pwa = makePwa()) {
  return render(
    <UserContext.Provider value={{ pwa }}>
      <InstallAppBanner />
    </UserContext.Provider>
  );
}

function renderCard(pwa = makePwa()) {
  return render(
    <UserContext.Provider value={{ pwa }}>
      <InstallAppCard />
    </UserContext.Provider>
  );
}

beforeEach(() => {
  localStorage.clear();
  setUserAgent(DESKTOP_CHROME);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/* ================================ BANNER ================================ */

describe("InstallAppBanner", () => {
  test("renders nothing when the app is already installed", () => {
    const { container } = renderBanner(makePwa({ isInstalled: true }));
    expect(container).toBeEmptyDOMElement();
  });

  test("does not show while a recent dismissal is still active", async () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() - 1000));
    const { container } = renderBanner();
    await waitFor(() =>
      expect(container.querySelector(".pwa-install-banner")).not.toBeInTheDocument()
    );
  });

  test("shows again after an expired dismissal, once the delay elapses", async () => {
    const expired = Date.now() - DISMISS_DURATION - 1000;
    localStorage.setItem(DISMISS_KEY, String(expired));

    const { container } = renderBanner();

    await waitFor(() => expect(localStorage.getItem(DISMISS_KEY)).toBeNull());
    await waitFor(
      () =>
        expect(container.querySelector(".pwa-install-banner")).toHaveClass(
          "pwa-visible"
        ),
      { timeout: 3000 }
    );
  });

  test("becomes visible after the initial delay when nothing is dismissed", async () => {
    const { container } = renderBanner();
    const banner = container.querySelector(".pwa-install-banner");
    expect(banner).not.toHaveClass("pwa-visible");

    await waitFor(() => expect(banner).toHaveClass("pwa-visible"), {
      timeout: 3000,
    });
  });

  test("close button hides the banner and stores a dismissal timestamp", async () => {
    const { container } = renderBanner();
    fireEvent.click(screen.getByLabelText("Dismiss"));

    expect(localStorage.getItem(DISMISS_KEY)).not.toBeNull();
    await waitFor(
      () =>
        expect(container.querySelector(".pwa-install-banner")).not.toBeInTheDocument(),
      { timeout: 2000 }
    );
  });

  test("hides and marks itself dismissed when 'appinstalled' fires", async () => {
    const { container } = renderBanner();
    fireEvent(window, new Event("appinstalled"));

    expect(localStorage.getItem(DISMISS_KEY)).not.toBeNull();
    await waitFor(() =>
      expect(container.querySelector(".pwa-install-banner")).not.toBeInTheDocument()
    );
  });

  test("removes the 'appinstalled' listener on unmount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderBanner();
    const call = addSpy.mock.calls.find(([event]) => event === "appinstalled");
    expect(call).toBeDefined();

    unmount();
    expect(removeSpy).toHaveBeenCalledWith("appinstalled", call[1]);
  });

  describe("native install prompt (canInstall = true)", () => {
    test("triggers install() directly, with no manual guide", async () => {
      const install = vi.fn().mockResolvedValue(true);
      renderBanner(makePwa({ canInstall: true, install }));

      fireEvent.click(screen.getByText("Install"));
      await waitFor(() => expect(install).toHaveBeenCalledTimes(1));
    });

    test("dismisses the banner once the native install succeeds", async () => {
      const install = vi.fn().mockResolvedValue(true);
      const { container } = renderBanner(makePwa({ canInstall: true, install }));

      fireEvent.click(screen.getByText("Install"));

      await waitFor(() => expect(localStorage.getItem(DISMISS_KEY)).not.toBeNull());
      await waitFor(
        () =>
          expect(
            container.querySelector(".pwa-install-banner")
          ).not.toBeInTheDocument(),
        { timeout: 2000 }
      );
    });

    test("keeps the banner open if the native prompt is cancelled", async () => {
      const install = vi.fn().mockResolvedValue(false);
      const { container } = renderBanner(makePwa({ canInstall: true, install }));

      fireEvent.click(screen.getByText("Install"));
      await waitFor(() => expect(install).toHaveBeenCalledTimes(1));

      expect(localStorage.getItem(DISMISS_KEY)).toBeNull();
      expect(container.querySelector(".pwa-install-banner")).toBeInTheDocument();
    });
  });

  describe("manual installation guidance by platform/browser", () => {
    test("iOS Safari: shows Share / Add to Home Screen steps", () => {
      setUserAgent(IOS_SAFARI);
      renderBanner();
      fireEvent.click(screen.getByText("Installation Guide"));
      expect(screen.getByText("Share")).toBeInTheDocument();
      expect(screen.getByText("Add to Home Screen")).toBeInTheDocument();
    });

    test("iOS Safari: toggles the guide open and closed", () => {
      setUserAgent(IOS_SAFARI);
      renderBanner();
      const btn = screen.getByText("Installation Guide");
      fireEvent.click(btn);
      expect(screen.getByText("Add to Home Screen")).toBeInTheDocument();
      fireEvent.click(btn);
      expect(screen.queryByText("Add to Home Screen")).not.toBeInTheDocument();
    });

    test("iOS Chrome/Firefox/Edge: redirects to Safari", () => {
      setUserAgent(IOS_CHROME);
      renderBanner();
      fireEvent.click(screen.getByText("Open in Safari"));
      expect(
        screen.getByText(/Installing isn't supported in this browser on iPhone\/iPad/)
      ).toBeInTheDocument();
    });

    test("Android Samsung Internet: shows the Samsung-specific steps", () => {
      setUserAgent(ANDROID_SAMSUNG);
      renderBanner();
      fireEvent.click(screen.getByText("Installation Guide"));
      expect(screen.getByText(/Samsung Internet/)).toBeInTheDocument();
    });

    test("Android Firefox: shows the Firefox-specific steps", () => {
      setUserAgent(ANDROID_FIREFOX);
      renderBanner();
      fireEvent.click(screen.getByText("Installation Guide"));
      expect(screen.getByText("Add to Home screen")).toBeInTheDocument();
    });

    test("Android Opera: shows the Opera-specific steps", () => {
      setUserAgent(ANDROID_OPERA);
      renderBanner();
      fireEvent.click(screen.getByText("Installation Guide"));
      expect(screen.getByText("Opera")).toBeInTheDocument();
    });

    test("Android Chrome/Edge fallback: shows the default Android steps", () => {
      setUserAgent(ANDROID_CHROME);
      renderBanner();
      fireEvent.click(screen.getByText("Installation Guide"));
      expect(screen.getByText("Install app")).toBeInTheDocument();
    });

    test("Desktop Chrome/Edge/Opera: shows the address-bar steps", () => {
      setUserAgent(DESKTOP_CHROME);
      renderBanner();
      fireEvent.click(screen.getByText("Installation Guide"));
      expect(screen.getByText("install icon")).toBeInTheDocument();
    });

    test("Desktop Firefox: shows the unsupported message", () => {
      setUserAgent(DESKTOP_FIREFOX);
      renderBanner();
      fireEvent.click(screen.getByText("Not Supported Here"));
      expect(
        screen.getByText(/doesn't support installing web apps/)
      ).toBeInTheDocument();
    });

    test("Desktop Safari: shows the unsupported message", () => {
      setUserAgent(DESKTOP_SAFARI);
      renderBanner();
      fireEvent.click(screen.getByText("Not Supported Here"));
      expect(
        screen.getByText(/doesn't support installing web apps/)
      ).toBeInTheDocument();
    });
  });
});

/* ================================== CARD ================================= */

describe("InstallAppCard", () => {
  test("renders nothing when the app is already installed", () => {
    const { container } = renderCard(makePwa({ isInstalled: true }));
    expect(container).toBeEmptyDOMElement();
  });

  test("renders the marketing copy and feature chips", () => {
    renderCard();
    expect(screen.getByText("Get CBT Pro App")).toBeInTheDocument();
    expect(screen.getByText("Works offline")).toBeInTheDocument();
    expect(screen.getByText("Instant launch")).toBeInTheDocument();
    expect(screen.getByText("Exam reminders")).toBeInTheDocument();
  });

  test("shows 'Install App' as the button label when native install is available", () => {
    renderCard(makePwa({ canInstall: true }));
    expect(screen.getByText("Install App")).toBeInTheDocument();
  });

  test("shows the guidance label as the button text when native install isn't available", () => {
    setUserAgent(IOS_SAFARI);
    renderCard();
    expect(screen.getByText("Installation Guide")).toBeInTheDocument();
  });

  test("triggers install() directly without opening a guide", async () => {
    const install = vi.fn().mockResolvedValue(true);
    renderCard(makePwa({ canInstall: true, install }));

    fireEvent.click(screen.getByText("Install App"));
    await waitFor(() => expect(install).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("Share")).not.toBeInTheDocument();
  });

  test("toggles the manual guide open and closed", () => {
    setUserAgent(IOS_SAFARI);
    renderCard();
    const btn = screen.getByText("Installation Guide");
    fireEvent.click(btn);
    expect(screen.getByText("Add to Home Screen")).toBeInTheDocument();
    fireEvent.click(btn);
    expect(screen.queryByText("Add to Home Screen")).not.toBeInTheDocument();
  });

  test("shows the redirect message for iOS Chrome", () => {
    setUserAgent(IOS_CHROME);
    renderCard();
    fireEvent.click(screen.getByText("Open in Safari"));
    expect(
      screen.getByText(/Installing isn't supported in this browser on iPhone\/iPad/)
    ).toBeInTheDocument();
  });

  test("shows the unsupported message on desktop Firefox", () => {
    setUserAgent(DESKTOP_FIREFOX);
    renderCard();
    fireEvent.click(screen.getByText("Not Supported Here"));
    expect(
      screen.getByText(/doesn't support installing web apps/)
    ).toBeInTheDocument();
  });
});