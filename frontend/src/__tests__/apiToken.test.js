import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { clearToken, getToken, setToken } from "../utils/api.js";

const TOKEN_KEY = "bookworld_token";

function createLocalStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

describe("api token helpers", () => {
  beforeEach(() => {
    globalThis.localStorage = createLocalStorage();
  });

  afterEach(() => {
    delete globalThis.localStorage;
  });

  it("returns null when no token is stored", () => {
    expect(getToken()).toBeNull();
  });

  it("stores and reads a token from localStorage", () => {
    setToken("jwt-abc-123");
    expect(getToken()).toBe("jwt-abc-123");
    expect(localStorage.getItem(TOKEN_KEY)).toBe("jwt-abc-123");
  });

  it("overwrites an existing token", () => {
    setToken("old-token");
    setToken("new-token");
    expect(getToken()).toBe("new-token");
  });

  it("removes the stored token", () => {
    setToken("jwt-abc-123");
    clearToken();
    expect(getToken()).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
