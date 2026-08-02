import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

/* -------------------------------------------------------------------------
 * Hoisted mock — needed because vi.mock() factories are hoisted above
 * regular imports/consts by Vitest.
 * ---------------------------------------------------------------------- */
const { mockUpdateSW } = vi.hoisted(() => ({
  mockUpdateSW: vi.fn(),
}));

vi.mock("../../../src/main", () => ({
  updateSW: mockUpdateSW,
}));

import PWAUpdateToast from "../../../src/components/PWAUpdateToast";

beforeEach(() => {
  vi.clearAllMocks();
  mockUpdateSW.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
});

describe("PWAUpdateToast", () => {
  test("renders nothing until an update becomes available", () => {
    const { container } = render(<PWAUpdateToast />);
    expect(container).toBeEmptyDOMElement();
  });

  test("shows the toast when 'pwa-update-available' fires on window", async () => {
    render(<PWAUpdateToast />);

    fireEvent(window, new Event("pwa-update-available"));

    expect(await screen.findByText("🚀 Update Available")).toBeInTheDocument();
    expect(
      screen.getByText("A newer version of CBT Pro is available.")
    ).toBeInTheDocument();
    expect(screen.getByText("Later")).toBeInTheDocument();
    expect(screen.getByText("Update")).toBeInTheDocument();
  });

  test("clicking 'Later' hides the toast without calling updateSW", async () => {
    render(<PWAUpdateToast />);
    fireEvent(window, new Event("pwa-update-available"));
    await screen.findByText("🚀 Update Available");

    fireEvent.click(screen.getByText("Later"));

    expect(screen.queryByText("🚀 Update Available")).not.toBeInTheDocument();
    expect(mockUpdateSW).not.toHaveBeenCalled();
  });

  test("clicking 'Update' calls updateSW(true)", async () => {
    render(<PWAUpdateToast />);
    fireEvent(window, new Event("pwa-update-available"));
    await screen.findByText("🚀 Update Available");

    fireEvent.click(screen.getByText("Update"));

    await waitFor(() => expect(mockUpdateSW).toHaveBeenCalledWith(true));
  });

  test("clicking 'Update' does not immediately hide the toast", async () => {
    // updateSW is expected to trigger a page reload in real usage, so the
    // component doesn't call setShow(false) itself on update — it just
    // awaits updateSW. This locks in that current behavior.
    mockUpdateSW.mockImplementation(() => new Promise(() => { })); // never resolves

    render(<PWAUpdateToast />);
    fireEvent(window, new Event("pwa-update-available"));
    await screen.findByText("🚀 Update Available");

    fireEvent.click(screen.getByText("Update"));

    await waitFor(() => expect(mockUpdateSW).toHaveBeenCalledWith(true));
    expect(screen.getByText("🚀 Update Available")).toBeInTheDocument();
  });

  test("still shows the toast (doesn't crash) if updateSW rejects", async () => {
    const rejection = new Error("service worker update failed");
    mockUpdateSW.mockImplementation(() => Promise.reject(rejection));

    render(<PWAUpdateToast />);
    fireEvent(window, new Event("pwa-update-available"));
    await screen.findByText("🚀 Update Available");

    fireEvent.click(screen.getByText("Update"));

    // Grab the exact promise the component is awaiting and attach a handler
    // to it right away, before any other awaits give Node a chance to flag
    // it as unhandled.
    await expect(mockUpdateSW.mock.results[0].value).rejects.toThrow(
      "service worker update failed"
    );

    expect(screen.getByText("🚀 Update Available")).toBeInTheDocument();
  });

  test("removes the 'pwa-update-available' listener on unmount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(<PWAUpdateToast />);

    const call = addSpy.mock.calls.find(
      ([event]) => event === "pwa-update-available"
    );
    expect(call).toBeDefined();
    const registeredHandler = call[1];

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("pwa-update-available", registeredHandler);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  test("does not duplicate the toast if the event fires multiple times", async () => {
    render(<PWAUpdateToast />);

    fireEvent(window, new Event("pwa-update-available"));
    fireEvent(window, new Event("pwa-update-available"));

    await waitFor(() =>
      expect(screen.getAllByText("🚀 Update Available")).toHaveLength(1)
    );
  });
});