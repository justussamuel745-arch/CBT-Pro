import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

/* -------------------------------------------------------------------------
 * Hoisted mocks — needed because vi.mock() factories are hoisted above
 * regular imports/consts by Vitest.
 * ---------------------------------------------------------------------- */
const { mockDecrypt, mockEncrypt, mockSaveUser, mockSaveHistory } = vi.hoisted(() => ({
  mockDecrypt: vi.fn(),
  mockEncrypt: vi.fn(),
  mockSaveUser: vi.fn(),
  mockSaveHistory: vi.fn(),
}));

vi.mock("../../../src/scripts/utilis/url.js", () => ({
  url: "https://api.test",
}));

vi.mock("../../../src/scripts/utilis/crypto.js", () => ({
  decrypt: mockDecrypt,
  encrypt: mockEncrypt,
}));

vi.mock("../../../src/hooks/services/indexedDB/users.js", () => ({
  saveUser: mockSaveUser,
}));

vi.mock("../../../src/hooks/services/indexedDB/history.js", () => ({
  saveHistory: mockSaveHistory,
}));

import {
  fetchDataPost,
  fetchDataGet,
  fetchWithAuth,
  fetchUserInfo,
  fetchHistory,
} from "../../../src/scripts/utilis/fetch.js";

/* --------------------------------- Helpers -------------------------------- */

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  };
}

function badJsonResponse({ ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: vi.fn().mockRejectedValue(new Error("invalid json")),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/* ============================== fetchDataPost ============================== */

describe("fetchDataPost", () => {
  test("sends a POST request with the correct url, method, headers, and body", async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ ok: true, id: 1 }));

    await fetchDataPost({ foo: "bar" }, "/api/thing");

    expect(fetch).toHaveBeenCalledWith("https://api.test/api/thing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ foo: "bar" }),
    });
  });

  test("returns the parsed response body on success", async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ id: 42 }));
    const result = await fetchDataPost({}, "/api/thing");
    expect(result).toEqual({ id: 42 });
  });

  test("throws data.error when the response is not ok", async () => {
    fetch.mockResolvedValueOnce(
      jsonResponse({ error: "Invalid input" }, { ok: false, status: 400 })
    );

    await expect(fetchDataPost({}, "/api/thing")).rejects.toEqual({
      status: 400,
      errors: "Invalid input",
    });
  });

  test("falls back to data.errors when data.error is absent", async () => {
    fetch.mockResolvedValueOnce(
      jsonResponse({ errors: "Validation failed" }, { ok: false, status: 422 })
    );

    await expect(fetchDataPost({}, "/api/thing")).rejects.toEqual({
      status: 422,
      errors: "Validation failed",
    });
  });

  test("falls back to data.message when error/errors are absent", async () => {
    fetch.mockResolvedValueOnce(
      jsonResponse({ message: "Something broke" }, { ok: false, status: 500 })
    );

    await expect(fetchDataPost({}, "/api/thing")).rejects.toEqual({
      status: 500,
      errors: "Something broke",
    });
  });

  test("falls back to 'network' when no error field is present", async () => {
    fetch.mockResolvedValueOnce(jsonResponse({}, { ok: false, status: 503 }));

    await expect(fetchDataPost({}, "/api/thing")).rejects.toEqual({
      status: 503,
      errors: "network",
    });
  });

  test("still throws with the 'network' fallback when the error body isn't valid JSON", async () => {
    fetch.mockResolvedValueOnce(badJsonResponse({ ok: false, status: 500 }));

    await expect(fetchDataPost({}, "/api/thing")).rejects.toEqual({
      status: 500,
      errors: "network",
    });
  });
});

/* ============================== fetchDataGet ============================== */

describe("fetchDataGet", () => {
  test("sends a GET request with the correct url, method, headers, and credentials", async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ hello: "world" }));

    await fetchDataGet("/api/thing");

    expect(fetch).toHaveBeenCalledWith("https://api.test/api/thing", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
  });

  test("returns the parsed response body on success", async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ hello: "world" }));
    const result = await fetchDataGet("/api/thing");
    expect(result).toEqual({ hello: "world" });
  });

  test("resolves to {} when the body isn't valid JSON but the response is ok", async () => {
    fetch.mockResolvedValueOnce(badJsonResponse());
    const result = await fetchDataGet("/api/thing");
    expect(result).toEqual({});
  });

  test("throws status and message when the response is not ok", async () => {
    fetch.mockResolvedValueOnce(jsonResponse({}, { ok: false, status: 404 }));

    await expect(fetchDataGet("/api/thing")).rejects.toEqual({
      status: 404,
      error: "HTTP error! status: 404 ",
    });
  });
});

/* ============================== fetchWithAuth ============================== */

describe("fetchWithAuth", () => {
  test("makes the initial request with the current token and returns it when status isn't 403", async () => {
    const response = jsonResponse({ data: "ok" }, { status: 200 });
    fetch.mockResolvedValueOnce(response);

    const setToken = vi.fn();
    const result = await fetchWithAuth("old-token", setToken, "/api/protected");

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("https://api.test/api/protected", {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer old-token",
      },
    });
    expect(result).toBe(response);
    expect(setToken).not.toHaveBeenCalled();
  });

  // NOTE: as written, when `options.headers` is truthy the code REPLACES it
  // entirely with just `{ authorization: ... }`, discarding whatever custom
  // headers were passed in. That's almost certainly not intended — flagging
  // it here since this test locks in the *current* behavior, not the
  // probably-intended one (merging authorization into the custom headers).
  test("current behavior: passing options.headers drops those headers, keeping only Authorization", async () => {
    fetch.mockResolvedValueOnce(jsonResponse({}, { status: 200 }));

    await fetchWithAuth("tok", vi.fn(), "/api/thing", {
      headers: { "X-Custom": "value" },
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.test/api/thing",
      expect.objectContaining({
        headers: { authorization: "Bearer tok" },
      })
    );
  });

  test("refreshes the token and retries once when the response status is 403", async () => {
    const firstResponse = jsonResponse({}, { status: 403 });
    const refreshResponse = jsonResponse({ data: "encrypted-token-payload" }, { status: 200 });
    const retryResponse = jsonResponse({ data: "ok" }, { status: 200 });

    fetch
      .mockResolvedValueOnce(firstResponse)
      .mockResolvedValueOnce(refreshResponse)
      .mockResolvedValueOnce(retryResponse);

    mockDecrypt.mockReturnValue({ accessToken: "new-token" });

    const setToken = vi.fn();
    const result = await fetchWithAuth("old-token", setToken, "/api/protected");

    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch).toHaveBeenNthCalledWith(2, "https://api.test/api/refresh", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    expect(mockDecrypt).toHaveBeenCalledWith("encrypted-token-payload");
    expect(setToken).toHaveBeenCalledWith("new-token");
    expect(fetch).toHaveBeenNthCalledWith(
      3,
      "https://api.test/api/protected",
      expect.objectContaining({
        headers: expect.objectContaining({ authorization: "Bearer new-token" }),
      })
    );
    expect(result).toBe(retryResponse);
  });

  test("throws 'Refresh failed' when the refresh request itself is not ok", async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse({}, { status: 403 }))
      .mockResolvedValueOnce(jsonResponse({}, { ok: false, status: 500 }));

    await expect(
      fetchWithAuth("old-token", vi.fn(), "/api/protected")
    ).rejects.toThrow("Refresh failed");
  });

  test("throws 'No new token' when the refresh response has no data", async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse({}, { status: 403 }))
      .mockResolvedValueOnce(jsonResponse({ data: null }, { status: 200 }));

    await expect(
      fetchWithAuth("old-token", vi.fn(), "/api/protected")
    ).rejects.toThrow("No new token");
  });

  test("does not attempt a refresh for non-403, non-ok statuses (e.g. 500)", async () => {
    const response = jsonResponse({}, { ok: false, status: 500 });
    fetch.mockResolvedValueOnce(response);

    const result = await fetchWithAuth("old-token", vi.fn(), "/api/protected");

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toBe(response);
  });
});

/* ============================== fetchUserInfo ============================== */

describe("fetchUserInfo", () => {
  test("fetches settings, decrypts, and populates user info + profile fields (no profile pic)", async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ data: "encrypted-blob" }, { status: 200 }));
    mockDecrypt.mockReturnValue({
      fullName: "Jane Doe",
      phoneNumber: "08012345678",
      targetExam: "JAMB UTME 2027",
      targetScore: "300",
    });
    mockEncrypt.mockReturnValue("re-encrypted-payload");

    const setUserInfo = vi.fn();
    const setProfileFields = vi.fn();

    await fetchUserInfo("token-123", setUserInfo, setProfileFields);

    expect(fetch).toHaveBeenCalledWith("https://api.test/api/settings", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer token-123",
      },
      credentials: "include",
    });

    expect(setUserInfo).toHaveBeenCalledWith({
      fullName: "Jane Doe",
      phoneNumber: "08012345678",
      targetExam: "JAMB UTME 2027",
      targetScore: "300",
      blob: undefined,
      id: "current-user",
    });

    expect(setProfileFields).toHaveBeenCalledWith({
      fullName: "Jane Doe",
      phoneNumber: "08012345678",
      targetExam: "JAMB UTME 2027",
      targetScore: "300",
    });

    expect(mockEncrypt).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: "Jane Doe", accessToken: "token-123" })
    );
    expect(mockSaveUser).toHaveBeenCalledWith({
      info: "re-encrypted-payload",
      blob: undefined,
      id: "current-user",
    });
  });

  test("fetches and attaches the profile picture blob when profilePic is present", async () => {
    const imageBlob = { size: 123 };
    fetch
      .mockResolvedValueOnce(jsonResponse({ data: "encrypted-blob" }, { status: 200 }))
      .mockResolvedValueOnce({ ok: true, blob: vi.fn().mockResolvedValue(imageBlob) });

    mockDecrypt.mockReturnValue({
      fullName: "Jane Doe",
      profilePic: "https://cdn.test/avatar.png",
    });

    const setUserInfo = vi.fn();
    await fetchUserInfo("token-123", setUserInfo, vi.fn());

    expect(fetch).toHaveBeenNthCalledWith(2, "https://cdn.test/avatar.png");
    expect(setUserInfo).toHaveBeenCalledWith(
      expect.objectContaining({ blob: imageBlob })
    );
    expect(mockSaveUser).toHaveBeenCalledWith(
      expect.objectContaining({ blob: imageBlob })
    );
  });

  test("leaves blob undefined when the profile picture fetch fails", async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse({ data: "encrypted-blob" }, { status: 200 }))
      .mockResolvedValueOnce({ ok: false });

    mockDecrypt.mockReturnValue({
      fullName: "Jane Doe",
      profilePic: "https://cdn.test/avatar.png",
    });

    const setUserInfo = vi.fn();
    await fetchUserInfo("token-123", setUserInfo, vi.fn());

    expect(setUserInfo).toHaveBeenCalledWith(
      expect.objectContaining({ blob: undefined })
    );
  });

  test("falls back to default profile field values when fields are missing", async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ data: "encrypted-blob" }, { status: 200 }));
    mockDecrypt.mockReturnValue({});

    const setProfileFields = vi.fn();
    await fetchUserInfo("token-123", vi.fn(), setProfileFields);

    expect(setProfileFields).toHaveBeenCalledWith({
      fullName: "",
      phoneNumber: "",
      targetExam: "JAMB UTME 2027",
      targetScore: "",
    });
  });

  test("throws { status } when the settings response is not ok", async () => {
    fetch.mockResolvedValueOnce(jsonResponse({}, { ok: false, status: 401 }));

    await expect(fetchUserInfo("token-123", vi.fn(), vi.fn())).rejects.toEqual({
      status: 401,
    });
  });
});

/* ============================== fetchHistory ============================== */

describe("fetchHistory", () => {
  test("sets and saves history data on success", async () => {
    const historyData = [{ id: "h1" }, { id: "h2" }];
    fetch.mockResolvedValueOnce(jsonResponse(historyData, { status: 200 }));

    const setHistoryData = vi.fn();
    await fetchHistory("token-123", setHistoryData);

    expect(fetch).toHaveBeenCalledWith("https://api.test/api/history", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer token-123",
      },
      credentials: "include",
    });
    expect(setHistoryData).toHaveBeenCalledWith(historyData);
    expect(mockSaveHistory).toHaveBeenCalledWith(historyData);
  });

  test("sets an empty array and skips saveHistory on a 204 response", async () => {
    fetch.mockResolvedValueOnce(jsonResponse(null, { status: 204 }));

    const setHistoryData = vi.fn();
    await fetchHistory("token-123", setHistoryData);

    expect(setHistoryData).toHaveBeenCalledWith([]);
    expect(mockSaveHistory).not.toHaveBeenCalled();
  });

  test("throws { status } when the response is not ok", async () => {
    fetch.mockResolvedValueOnce(jsonResponse({}, { ok: false, status: 500 }));

    await expect(fetchHistory("token-123", vi.fn())).rejects.toEqual({
      status: 500,
    });
  });
});