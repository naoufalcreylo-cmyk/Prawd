/** Splits an article body at its section markers: a line reading {/* section: some-id *\/}. */
export function splitSections(body: string) {
  const parts = body.split(/\{\/\* section: ([a-z0-9-]+) \*\/\}/);
  const sections: { id: string; source: string }[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    sections.push({ id: parts[i], source: parts[i + 1].trim() });
  }
  return { intro: parts[0].trim(), sections };
}
