import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("data-tema");
  try {
    localStorage.clear();
  } catch {
    // jsdom sempre tem localStorage; o try só protege de um teste que o tenha trocado.
  }
});
