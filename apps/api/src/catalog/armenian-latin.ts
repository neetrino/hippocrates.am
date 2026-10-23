const LETTERS: Record<string, string> = {
  ա: "a",
  բ: "b",
  գ: "g",
  դ: "d",
  ե: "e",
  զ: "z",
  է: "e",
  ը: "y",
  թ: "t",
  ժ: "zh",
  ի: "i",
  լ: "l",
  խ: "kh",
  ծ: "ts",
  կ: "k",
  հ: "h",
  ձ: "dz",
  ղ: "gh",
  ճ: "ch",
  մ: "m",
  յ: "y",
  ն: "n",
  շ: "sh",
  ո: "o",
  չ: "ch",
  պ: "p",
  ջ: "j",
  ռ: "r",
  ս: "s",
  վ: "v",
  տ: "t",
  ր: "r",
  ց: "ts",
  ւ: "v",
  փ: "p",
  ք: "k",
  օ: "o",
  ֆ: "f",
  և: "ev",
};

/** Latin reading of Armenian text. Letters outside the alphabet stay as written. */
export function latinizeArmenian(text: string): string {
  if (!/[\u0531-\u0587]/.test(text)) return text;
  let out = "";
  for (let index = 0; index < text.length; index += 1) {
    const pair = digraph(text, index);
    if (pair) {
      out += pair.latin;
      index += 1;
      continue;
    }
    out += letterAt(text, index);
  }
  return out;
}

function digraph(text: string, index: number): { latin: string } | null {
  const current = text[index] ?? "";
  const next = text[index + 1] ?? "";
  if (current.toLowerCase() !== "ո" || next.toLowerCase() !== "ւ") return null;
  return { latin: isUpper(current) ? "U" : "u" };
}

function letterAt(text: string, index: number): string {
  const current = text[index] ?? "";
  const lower = current.toLowerCase();
  if (lower === "ե" && wordStart(text, index)) return isUpper(current) ? "Ye" : "ye";
  const mapped = LETTERS[lower];
  if (!mapped) return current;
  return isUpper(current) ? capitalize(mapped) : mapped;
}

function wordStart(text: string, index: number): boolean {
  if (index === 0) return true;
  return !/\p{L}/u.test(text[index - 1] ?? "");
}

function isUpper(char: string): boolean {
  const code = char.charCodeAt(0) ?? 0;
  return code >= 0x0531 && code <= 0x0556;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
