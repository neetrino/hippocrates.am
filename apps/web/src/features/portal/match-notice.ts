type NoticeQuery = { text: string; nameSpellings: string[] };

function wordsOf(value: string): string[] {
  return value.trim().toLocaleLowerCase().split(/[\s·,./-]+/).filter(Boolean);
}

/** Name words use prefix match in every stored spelling; notice text uses contains. */
export function matchesNotice(row: NoticeQuery, query: string): boolean {
  const tokens = wordsOf(query);
  if (tokens.length === 0) return true;
  const text = row.text.toLocaleLowerCase();
  const names = row.nameSpellings.flatMap(wordsOf);
  return tokens.every((token) => text.includes(token) || names.some((word) => word.startsWith(token)));
}
