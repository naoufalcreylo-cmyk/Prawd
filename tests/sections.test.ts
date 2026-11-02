import assert from "node:assert/strict";
import { test } from "node:test";
import { splitSections } from "../src/lib/sections.ts";

test("splits a body at its markers and keeps the order", () => {
  const { intro, sections } = splitSections("Hello.\n\n{/* section: one */}\n\nFirst.\n\n{/* section: two-b */}\n\nSecond.\n");
  assert.equal(intro, "Hello.");
  assert.deepEqual(sections, [
    { id: "one", source: "First." },
    { id: "two-b", source: "Second." },
  ]);
});

test("a body with no markers is all intro", () => {
  assert.deepEqual(splitSections("Just text."), { intro: "Just text.", sections: [] });
});
