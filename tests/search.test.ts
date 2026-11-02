import assert from "node:assert/strict";
import { test } from "node:test";
import { searchEntries } from "../src/lib/search.ts";

const entry = (title: string, text = "", tags: string[] = []) => ({
  title,
  excerpt: "",
  categoryLabel: "Stories",
  tags,
  author: "PRAWD Desk",
  text,
});

const entries = [
  entry("What old boots remember", "leather and studs"),
  entry("The walls remember", "a mural in Łódź", ["Murals"]),
  entry("Goals in the school yard", "boots left by the gate"),
];

test("title matches rank above body matches", () => {
  assert.deepEqual(
    searchEntries(entries, "boots").map((e) => e.title),
    ["What old boots remember", "Goals in the school yard"],
  );
});

test("every word has to match", () => {
  assert.equal(searchEntries(entries, "boots mural").length, 0);
  assert.equal(searchEntries(entries, "remember walls").length, 1);
});

test("search ignores accents and case", () => {
  assert.equal(searchEntries(entries, "LODZ")[0].title, "The walls remember");
});

test("an empty query returns nothing", () => {
  assert.deepEqual(searchEntries(entries, "   "), []);
});
