import { describe, expect, it } from "vitest";
import { CURATED_SERVERS } from "./catalog";

describe("catalog official flag", () => {
  const byId = (name: string) => CURATED_SERVERS.find(server => server.id.endsWith(`/${name}`));

  it("marks vendor-published servers as official", () => {
    expect(byId("stripe")?.isOfficial).toBe(true);
    expect(byId("sem")?.isOfficial).toBe(true);
  });

  it("marks third-party packages as community", () => {
    expect(byId("airtable")?.isOfficial).toBe(false);
    expect(byId("clickup")?.isOfficial).toBe(false);
  });

  it("declares official on every entry", () => {
    expect(CURATED_SERVERS.length).toBeGreaterThan(0);
    expect(CURATED_SERVERS.every(server => typeof server.isOfficial === "boolean")).toBe(true);
  });
});
