import { render, screen, act, cleanup, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import UserContext from "../../../src/context/UserContext";
import { CountdownTimer } from "../../../src/components/CountdownTimer";

const {
  mockNavigate,
  mockFetchWithAuth,
  mockCalculateScore,
  mockSaveHistory,
  mockEncrypt,
  mockDecrypt,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockFetchWithAuth: vi.fn(),
  mockCalculateScore: vi.fn(),
  mockSaveHistory: vi.fn(),
  mockEncrypt: vi.fn((v) => v),
  mockDecrypt: vi.fn((v) => v),
}));

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../../src/scripts/utilis/fetch", () => ({
  fetchWithAuth: mockFetchWithAuth,
}));

vi.mock("../../../src/scripts/utilis/calculateScore", () => ({
  calculateScore: mockCalculateScore,
}));

vi.mock("../../../src/hooks/services/indexedDB/history", () => ({
  saveHistory: mockSaveHistory,
}));

vi.mock("../../../src/scripts/utilis/crypto", () => ({
  encrypt: mockEncrypt,
  decrypt: mockDecrypt,
}));

/* --------------------------------- Helpers -------------------------------- */

function makeContextValue(overrides = {}) {
  return {
    token: "token-abc",
    setToken: vi.fn(),
    answers: [{ id: "q1", subject: "mathematics", userAnswers: ["a"], isBookmarked: false }],
    setExamResults: vi.fn(),
    examQuestions: [{ id: "q1" }],
    userInfo: { _id: "user-1" },
    setHistoryData: vi.fn(),
    ...overrides,
  };
}

function renderTimer({ contextValue = makeContextValue(), ...props } = {}) {
  const skipAutoSubmit = props.skipAutoSubmit ?? { current: false };
  const utils = render(
    <UserContext.Provider value={contextValue}>
      <CountdownTimer hours={0} minutes={0} {...props} skipAutoSubmit={skipAutoSubmit} />
    </UserContext.Provider>
  );
  return { ...utils, contextValue, skipAutoSubmit };
}

function setOnline(value) {
  Object.defineProperty(navigator, "onLine", { configurable: true, value });
}

beforeEach(() => {
  vi.clearAllMocks();
  setOnline(true);
  localStorage.clear();
  mockDecrypt.mockImplementation((v) => v);
  mockEncrypt.mockImplementation((v) => v);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("CountdownTimer — rendering & countdown", () => {
  test("renders the formatted time based on hours and minutes", () => {
    renderTimer({ hours: 1, minutes: 30 });
    expect(screen.getByText("1:30:00")).toBeInTheDocument();
  });

  test("counts down by one second at a time", () => {
    vi.useFakeTimers();
    renderTimer({ hours: 0, minutes: 1 });
    expect(screen.getByText("0:01:00")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText("0:00:59")).toBeInTheDocument();
  });

  test("calls onFinish immediately when the configured duration is zero", () => {
    const onFinish = vi.fn();
    renderTimer({ hours: 0, minutes: 0, onFinish });
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  test("data-status is 'normal' when plenty of time remains", () => {
    const { container } = renderTimer({ hours: 1, minutes: 0 });
    expect(container.querySelector(".countdown-timer")).toHaveAttribute("data-status", "normal");
  });

  test("data-status is 'danger' once under 5 minutes remain", () => {
    const { container } = renderTimer({ hours: 0, minutes: 4 });
    expect(container.querySelector(".countdown-timer")).toHaveAttribute("data-status", "danger");
  });

  test("data-status is 'warning' once under 20% remains but 5+ minutes are left", () => {
    vi.useFakeTimers();
    const { container } = renderTimer({ hours: 1, minutes: 0 }); // 3600s total, 20% = 720s
    act(() => vi.advanceTimersByTime(3000 * 1000)); // 600s left: <720 (warning), >=300 (not danger)
    expect(container.querySelector(".countdown-timer")).toHaveAttribute("data-status", "warning");
  });

  test("clears the countdown interval on unmount", () => {
    const clearSpy = vi.spyOn(global, "clearInterval");
    const { unmount } = renderTimer({ hours: 0, minutes: 5, skipAutoSubmit: { current: true } });
    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});

describe("CountdownTimer — auto-submit on unmount", () => {
  test("calculates score, updates context, and navigates to the score page", () => {
    const contextValue = makeContextValue({
      examQuestions: [{ id: "q1" }, { id: "q2" }],
    });
    mockCalculateScore.mockReturnValue({
      subjects: [], score: 1, timeTaken: 10, performance: "ok",
    });
    mockFetchWithAuth.mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({}) });

    const { unmount } = renderTimer({ contextValue, hours: 1, minutes: 0 });
    unmount();

    expect(mockCalculateScore).toHaveBeenCalledWith(
      "user-1",
      [{ id: "q1" }, { id: "q2" }],
      contextValue.answers,
      expect.any(Number),
      3600
    );
    expect(contextValue.setExamResults).toHaveBeenCalledWith({
      subjects: [], score: 1, timeTaken: 10, performance: "ok",
    });
    expect(mockNavigate).toHaveBeenCalledWith("/simulator/score");
  });

  test("does nothing when skipAutoSubmit.current is true", () => {
    const { unmount } = renderTimer({ skipAutoSubmit: { current: true } });
    unmount();
    expect(mockCalculateScore).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("does nothing when there are no exam questions", () => {
    const contextValue = makeContextValue({ examQuestions: [] });
    const { unmount } = renderTimer({ contextValue });
    unmount();
    expect(mockCalculateScore).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe("CountdownTimer — submitHistory behavior (via auto-submit)", () => {
  test("offline: saves the unsynced result to localStorage instead of fetching", () => {
    setOnline(false);
    mockCalculateScore.mockReturnValue({ subjects: [], score: 5, timeTaken: 1, performance: "x" });

    const { unmount } = renderTimer();
    unmount();

    expect(mockFetchWithAuth).not.toHaveBeenCalled();
    const stored = JSON.parse(localStorage.getItem("unsavedHistory"));
    expect(stored).toEqual([expect.objectContaining({ score: 5 })]);
  });

  test("online success: updates history state and persists it via saveHistory", async () => {
    const contextValue = makeContextValue();
    mockCalculateScore.mockReturnValue({ subjects: [], score: 10, timeTaken: 5, performance: "good" });
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: "history-1" }),
    });

    const { unmount } = renderTimer({ contextValue });
    unmount();

    await waitFor(() => expect(contextValue.setHistoryData).toHaveBeenCalledWith({ id: "history-1" }));
    expect(mockSaveHistory).toHaveBeenCalledWith({ id: "history-1" });
  });

  test("online error response: falls back to localStorage", async () => {
    mockCalculateScore.mockReturnValue({ subjects: [], score: 1, timeTaken: 1, performance: "x" });
    mockFetchWithAuth.mockResolvedValue({
      ok: false, status: 500, json: vi.fn().mockResolvedValue({}),
    });

    const { unmount } = renderTimer();
    unmount();

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem("unsavedHistory"));
      expect(stored).toEqual([expect.objectContaining({ score: 1 })]);
    });
  });

  test("network failure (fetchWithAuth throws): still falls back to localStorage without crashing", async () => {
    mockCalculateScore.mockReturnValue({ subjects: [], score: 2, timeTaken: 1, performance: "x" });
    mockFetchWithAuth.mockRejectedValue(new Error("network down"));

    const { unmount } = renderTimer();
    unmount();

    // err.error is undefined for a plain Error (no {status, error} shape), so
    // the current code pushes `undefined` — documenting that as-is rather
    // than silently correcting it.
    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem("unsavedHistory"));
      expect(stored).toEqual([null]); // JSON round-trips `undefined` -> `null`
    });
  });
});