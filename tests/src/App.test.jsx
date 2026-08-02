import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import UserContext from "../../src/context/UserContext";
import App from "../../src/App";

/* -------------------------------------------------------------------------
 * Hoisted mock functions.
 * These must be created with vi.hoisted() because vi.mock() factories are
 * hoisted above regular imports/consts by Vitest. Referencing a plain
 * top-level `const mockFn = vi.fn()` inside a vi.mock() factory would throw
 * a "Cannot access before initialization" error without this.
 * ---------------------------------------------------------------------- */
const {
  mockFetchDataGet,
  mockFetchUserInfo,
  mockFetchHistory,
  mockOn,
  mockDecrypt,
  mockGetUser,
  mockDeleteUser,
  mockGetHistory,
  mockDeleteAllQuestions,
} = vi.hoisted(() => ({
  mockFetchDataGet: vi.fn(),
  mockFetchUserInfo: vi.fn(),
  mockFetchHistory: vi.fn(),
  mockOn: vi.fn(),
  mockDecrypt: vi.fn(),
  mockGetUser: vi.fn(),
  mockDeleteUser: vi.fn(),
  mockGetHistory: vi.fn(),
  mockDeleteAllQuestions: vi.fn(),
}));

/* ---------------------------- Service mocks ------------------------------ */

vi.mock("../../src/scripts/utilis/fetch", () => ({
  fetchDataGet: mockFetchDataGet,
  fetchUserInfo: mockFetchUserInfo,
  fetchHistory: mockFetchHistory,
}));

vi.mock("../../src/scripts/utilis/submitHistory", () => ({
  on: mockOn,
}));

vi.mock("../../src/scripts/utilis/crypto", () => ({
  decrypt: mockDecrypt,
}));

vi.mock("../../src/hooks/services/indexedDB/users", () => ({
  getUser: mockGetUser,
  deleteUser: mockDeleteUser,
}));

vi.mock("../../src/hooks/services/indexedDB/history", () => ({
  getHistory: mockGetHistory,
}));

vi.mock("../../src/hooks/services/indexedDB/questions", () => ({
  deleteAllQuestions: mockDeleteAllQuestions,
}));

/* ------------------------- Page / component mocks ------------------------
 * App pulls in a large tree of real pages. For a focused unit test of App's
 * own logic (loading gate, routing, auth branching, lifecycle effects) we
 * replace every child route element with a trivial stand-in.
 * ---------------------------------------------------------------------- */

vi.mock("../../src/components/Loading", () => ({
  Loading: () => <div>Loading...</div>,
}));

vi.mock("../../src/components/Invalid", () => ({
  Invalid: () => <div>Invalid-404</div>,
}));

vi.mock("../../src/components/PWAUpdateToast", () => ({
  default: () => <div>PWAUpdateToast</div>,
}));

vi.mock("../../src/pages/HomePage", () => ({
  HomePage: () => <div>HomePage</div>,
}));

vi.mock("../../src/pages/Dashboard", () => ({
  Dashboard: () => <div>Dashboard</div>,
}));

vi.mock("../../src/pages/study/Study", () => ({
  Study: () => <div>Study</div>,
}));

vi.mock("../../src/pages/simulator/Simulator", () => ({
  Simulator: () => <div>Simulator</div>,
}));

vi.mock("../../src/pages/About", () => ({
  About: () => <div>About</div>,
}));

vi.mock("../../src/pages/Feedback", () => ({
  Feedback: () => <div>Feedback</div>,
}));

vi.mock("../../src/pages/Legal", () => ({
  Legal: () => <div>Legal</div>,
}));

vi.mock("../../src/pages/Payment", () => ({
  Payment: () => <div>Payment</div>,
}));

vi.mock("../../src/pages/Settings", () => ({
  Settings: () => <div>Settings</div>,
}));

vi.mock("../../src/pages/Bookmark", () => ({
  Bookmark: () => <div>Bookmark</div>,
}));

vi.mock("../../src/pages/History", () => ({
  History: () => <div>History</div>,
}));

vi.mock("../../src/pages/Syllabus", () => ({
  Syllabus: () => <div>Syllabus</div>,
}));

vi.mock("../../src/pages/auth/Auth", () => ({
  default: () => <div>Auth</div>,
}));

// ProtectedRoutes normally guards nested routes with redirects. For App's
// own unit tests we let everything through via <Outlet /> so we can assert
// on which nested page rendered; ProtectedRoutes' own auth logic should be
// covered by its own dedicated test file.
vi.mock("../../src/routes/ProtectedRoutes", async () => {
  const { Outlet } = await import("react-router");
  return {
    ProtectedRoutes: () => <Outlet />,
  };
});

// Lazy-loaded routes
vi.mock("../../src/pages/games/Games.jsx", () => ({
  default: () => <div>Games</div>,
}));
vi.mock("../../src/pages/Delete.jsx", () => ({
  default: () => <div>Delete</div>,
}));
vi.mock("../../src/pages/admin/Admin.jsx", () => ({
  default: () => <div>Admin</div>,
}));

/* --------------------------------- Helpers -------------------------------- */

function makeContextValue(overrides = {}) {
  return {
    token: null,
    setToken: vi.fn(),
    setIsActivated: vi.fn(),
    setIsAdmin: vi.fn(),
    setUserInfo: vi.fn(),
    setProfileFields: vi.fn(),
    setHistoryData: vi.fn(),
    ...overrides,
  };
}

function renderApp({ route = "/", contextValue = makeContextValue() } = {}) {
  const utils = render(
    <MemoryRouter initialEntries={[route]}>
      <UserContext.Provider value={contextValue}>
        <App />
      </UserContext.Provider>
    </MemoryRouter>
  );
  return { ...utils, contextValue };
}

function setOnline(value) {
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    value,
  });
}

async function waitForLoadingToFinish() {
  await waitFor(() =>
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
  );
}

/* ---------------------------------------------------------------------- */

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    setOnline(true);

    // Sensible defaults so tests that don't care about the refresh
    // payload's exact shape don't blow up on undefined access.
    mockFetchDataGet.mockResolvedValue({ data: "encrypted-refresh-payload" });
    mockDecrypt.mockReturnValue({
      accessToken: null,
      isActivated: false,
      isAdmin: false,
      activationExpired: false,
    });
    mockFetchUserInfo.mockResolvedValue(undefined);
    mockFetchHistory.mockResolvedValue(undefined);
    mockOn.mockResolvedValue(undefined);
    mockGetUser.mockResolvedValue(null);
    mockGetHistory.mockResolvedValue([]);
  });

  afterEach(() => {
    cleanup();
  });

  /* ------------------------------ Loading gate ------------------------------ */

  test("shows loading while app is initializing", () => {
    mockFetchDataGet.mockImplementation(() => new Promise(() => {}));

    renderApp();

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("hides the loading screen once initialization resolves", async () => {
    renderApp();

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    await waitForLoadingToFinish();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  /* -------------------------------- Routing --------------------------------- */

  test("renders HomePage at '/' when there is no token", async () => {
    renderApp({ route: "/", contextValue: makeContextValue({ token: null }) });

    await waitForLoadingToFinish();
    expect(screen.getByText("HomePage")).toBeInTheDocument();
  });

  test("renders Dashboard at '/' when a token is present", async () => {
    renderApp({
      route: "/",
      contextValue: makeContextValue({ token: "valid-token" }),
    });

    await waitForLoadingToFinish();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  test("renders public routes without a token", async () => {
    renderApp({ route: "/about", contextValue: makeContextValue({ token: null }) });
    await waitForLoadingToFinish();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  test("renders the Legal page", async () => {
    renderApp({ route: "/legal", contextValue: makeContextValue({ token: null }) });
    await waitForLoadingToFinish();
    expect(screen.getByText("Legal")).toBeInTheDocument();
  });

  test("renders the Auth page under /auth/*", async () => {
    renderApp({
      route: "/auth/sign-in",
      contextValue: makeContextValue({ token: null }),
    });
    await waitForLoadingToFinish();
    expect(screen.getByText("Auth")).toBeInTheDocument();
  });

  test("renders protected pages once ProtectedRoutes lets the request through", async () => {
    renderApp({
      route: "/settings",
      contextValue: makeContextValue({ token: "valid-token" }),
    });
    await waitForLoadingToFinish();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  test("renders the Bookmark page", async () => {
    renderApp({
      route: "/bookmark",
      contextValue: makeContextValue({ token: "valid-token" }),
    });
    await waitForLoadingToFinish();
    expect(screen.getByText("Bookmark")).toBeInTheDocument();
  });

  test("renders the History page", async () => {
    renderApp({
      route: "/history",
      contextValue: makeContextValue({ token: "valid-token" }),
    });
    await waitForLoadingToFinish();
    expect(screen.getByText("History")).toBeInTheDocument();
  });

  test("renders the Syllabus page", async () => {
    renderApp({
      route: "/syllabus",
      contextValue: makeContextValue({ token: "valid-token" }),
    });
    await waitForLoadingToFinish();
    expect(screen.getByText("Syllabus")).toBeInTheDocument();
  });

  test("renders the Payment page", async () => {
    renderApp({
      route: "/payment",
      contextValue: makeContextValue({ token: "valid-token" }),
    });
    await waitForLoadingToFinish();
    expect(screen.getByText("Payment")).toBeInTheDocument();
  });

  test("renders the Feedback page", async () => {
    renderApp({
      route: "/feedback",
      contextValue: makeContextValue({ token: "valid-token" }),
    });
    await waitForLoadingToFinish();
    expect(screen.getByText("Feedback")).toBeInTheDocument();
  });

  test("lazy-loads and renders the Games route", async () => {
    renderApp({
      route: "/game/some-mode",
      contextValue: makeContextValue({ token: "valid-token" }),
    });
    await waitForLoadingToFinish();
    await waitFor(() => expect(screen.getByText("Games")).toBeInTheDocument());
  });

  test("lazy-loads and renders the Admin route", async () => {
    renderApp({
      route: "/admin/reports",
      contextValue: makeContextValue({ token: "valid-token" }),
    });
    await waitForLoadingToFinish();
    await waitFor(() => expect(screen.getByText("Admin")).toBeInTheDocument());
  });

  test("lazy-loads and renders the Delete route", async () => {
    renderApp({
      route: "/delete",
      contextValue: makeContextValue({ token: "valid-token" }),
    });
    await waitForLoadingToFinish();
    await waitFor(() => expect(screen.getByText("Delete")).toBeInTheDocument());
  });

  test("renders the Invalid/404 page for an unknown route", async () => {
    renderApp({
      route: "/this-route-does-not-exist",
      contextValue: makeContextValue({ token: null }),
    });
    await waitForLoadingToFinish();
    expect(screen.getByText("Invalid-404")).toBeInTheDocument();
  });

  test("always renders PWAUpdateToast alongside the routed page", async () => {
    renderApp({ route: "/", contextValue: makeContextValue({ token: null }) });
    await waitForLoadingToFinish();
    expect(screen.getByText("PWAUpdateToast")).toBeInTheDocument();
  });

  /* ---------------------------- Online init flow ----------------------------- */

  test("fetches the session, user info, and history on mount while online", async () => {
    const contextValue = makeContextValue();
    mockDecrypt.mockReturnValue({
      accessToken: "fresh-token",
      isActivated: true,
      isAdmin: false,
      activationExpired: false,
    });

    renderApp({ contextValue });

    await waitFor(() => expect(mockFetchDataGet).toHaveBeenCalledWith("/api/refresh"));
    await waitFor(() =>
      expect(contextValue.setToken).toHaveBeenCalledWith("fresh-token")
    );
    expect(contextValue.setIsActivated).toHaveBeenCalledWith(true);
    expect(contextValue.setIsAdmin).toHaveBeenCalledWith(false);
    expect(mockFetchUserInfo).toHaveBeenCalledWith(
      "fresh-token",
      contextValue.setUserInfo,
      contextValue.setProfileFields
    );
    expect(mockFetchHistory).toHaveBeenCalledWith(
      "fresh-token",
      contextValue.setHistoryData
    );

    await waitForLoadingToFinish();
  });

  test("syncs offline history via on() after a successful refresh", async () => {
    mockDecrypt.mockReturnValue({
      accessToken: "fresh-token",
      isActivated: true,
      isAdmin: false,
      activationExpired: false,
    });

    const contextValue = makeContextValue();
    renderApp({ contextValue });

    await waitFor(() =>
      expect(mockOn).toHaveBeenCalledWith(
        "fresh-token",
        contextValue.setToken,
        contextValue.setHistoryData
      )
    );
  });

  test("clears cached questions when the server reports activation expired", async () => {
    mockDecrypt.mockReturnValue({
      accessToken: "fresh-token",
      isActivated: false,
      isAdmin: false,
      activationExpired: true,
    });

    renderApp();

    await waitFor(() => expect(mockDeleteAllQuestions).toHaveBeenCalled());
  });

  test("does not clear cached questions when activation has not expired", async () => {
    mockDecrypt.mockReturnValue({
      accessToken: "fresh-token",
      isActivated: true,
      isAdmin: false,
      activationExpired: false,
    });

    renderApp();

    await waitForLoadingToFinish();
    expect(mockDeleteAllQuestions).not.toHaveBeenCalled();
  });

  test("deletes the local user when refresh fails with a 401", async () => {
    mockFetchDataGet.mockRejectedValueOnce({ status: 401, error: "unauthorized" });

    renderApp();

    await waitFor(() => expect(mockDeleteUser).toHaveBeenCalled());
    await waitForLoadingToFinish();
  });

  test("does not delete the local user when refresh fails with a non-401 error", async () => {
    mockFetchDataGet.mockRejectedValueOnce({ status: 500, error: "server error" });

    renderApp();

    await waitForLoadingToFinish();
    expect(mockDeleteUser).not.toHaveBeenCalled();
  });

  test("still stops loading if refresh throws unexpectedly", async () => {
    mockFetchDataGet.mockRejectedValueOnce(new Error("network exploded"));

    renderApp();

    await waitForLoadingToFinish();
  });

  /* ---------------------------- Offline init flow ---------------------------- */

  test("loads the cached user from IndexedDB when offline", async () => {
    setOnline(false);

    mockGetUser.mockResolvedValue({
      info: "encrypted-cached-user",
      blob: "avatar-blob",
      id: "current user",
    });
    mockDecrypt.mockReturnValue({
      _id: "user-123",
      accessToken: "cached-token",
      fullName: "Jane Doe",
      phoneNumber: "08012345678",
      targetExam: "JAMB UTME 2027",
      targetScore: "300",
      isActivated: true,
    });
    mockGetHistory.mockResolvedValue([{ id: "h1" }]);

    const contextValue = makeContextValue();
    renderApp({ contextValue });

    await waitFor(() =>
      expect(contextValue.setToken).toHaveBeenCalledWith("cached-token")
    );
    expect(contextValue.setUserInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "Jane Doe",
        blob: "avatar-blob",
        _id: "user-123",
      })
    );
    expect(contextValue.setProfileFields).toHaveBeenCalledWith({
      fullName: "Jane Doe",
      phoneNumber: "08012345678",
      targetExam: "JAMB UTME 2027",
      targetScore: "300",
    });
    expect(contextValue.setIsActivated).toHaveBeenCalledWith(true);
    expect(mockGetHistory).toHaveBeenCalledWith("user-123");
    expect(contextValue.setHistoryData).toHaveBeenCalledWith([{ id: "h1" }]);

    await waitForLoadingToFinish();
    // Offline path must never touch the network.
    expect(mockFetchDataGet).not.toHaveBeenCalled();
  });

  test("falls back to default profile field values when cached user is missing them", async () => {
    setOnline(false);

    mockGetUser.mockResolvedValue({
      info: "encrypted-cached-user",
      blob: "avatar-blob",
      id: "user-123",
    });
    mockDecrypt.mockReturnValue({
      accessToken: "cached-token",
      // fullName, phoneNumber, targetExam, targetScore intentionally omitted
    });

    const contextValue = makeContextValue();
    renderApp({ contextValue });

    await waitFor(() =>
      expect(contextValue.setProfileFields).toHaveBeenCalledWith({
        fullName: "",
        phoneNumber: "",
        targetExam: "JAMB UTME 2027",
        targetScore: "",
      })
    );
  });

  test("stops loading gracefully when offline with no cached user", async () => {
    setOnline(false);
    mockGetUser.mockResolvedValue(null);

    const contextValue = makeContextValue();
    renderApp({ contextValue });

    await waitForLoadingToFinish();
    expect(contextValue.setToken).not.toHaveBeenCalled();
    expect(mockGetHistory).not.toHaveBeenCalled();
  });

  test("stops loading gracefully when offline and the cached user is an empty object", async () => {
    setOnline(false);
    mockGetUser.mockResolvedValue({});

    const contextValue = makeContextValue();
    renderApp({ contextValue });

    await waitForLoadingToFinish();
    expect(contextValue.setToken).not.toHaveBeenCalled();
  });

  /* ------------------------------ 'online' event ------------------------------ */

  test("re-syncs history via on() when the browser regains connectivity", async () => {
    const contextValue = makeContextValue({ token: "existing-token" });
    renderApp({ contextValue });

    await waitForLoadingToFinish();
    mockOn.mockClear();

    fireEvent(window, new Event("online"));

    await waitFor(() =>
      expect(mockOn).toHaveBeenCalledWith(
        "existing-token",
        contextValue.setToken,
        contextValue.setHistoryData
      )
    );
  });

  test("removes the 'online' event listener on unmount", async () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderApp();
    await waitForLoadingToFinish();

    const onlineCall = addSpy.mock.calls.find(([event]) => event === "online");
    expect(onlineCall).toBeDefined();
    const registeredHandler = onlineCall[1];

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("online", registeredHandler);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
