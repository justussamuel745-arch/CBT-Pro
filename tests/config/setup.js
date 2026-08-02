import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Automatically clean up the DOM after each test
afterEach(() => {
  cleanup();
});