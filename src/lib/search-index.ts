import type { SearchEntry } from "./types";

let request: Promise<SearchEntry[]> | null = null;

/** Fetched once per visit, on first use, then shared by search and "Load more". */
export function loadSearchIndex() {
  request ??= fetch("/search-index.json").then((response) => {
    if (!response.ok) throw new Error(String(response.status));
    return response.json() as Promise<SearchEntry[]>;
  });
  request.catch(() => {
    request = null;
  });
  return request;
}
