import { vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

vi.stubEnv('VITE_ENV', 'test')

// Automatically clean up the DOM after each test
afterEach(() => {
  cleanup();
});

afterAll(() => {
  vi.unstubAllEnvs()
})