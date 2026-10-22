// Firefox has `Intl.Segmenter` from version 125, and Next.js builds for 111,
// so without it the first code point stands in for the first grapheme.
// `getInitials` applies NFC first, which makes a letter and its combining mark
// one code point, so the two ways only differ for a sequence such as an emoji
// joined from several.
function firstGrapheme(word: string) {
  const { Segmenter } = Intl as Partial<typeof Intl>;
  if (Segmenter === undefined) return Array.from(word)[0] ?? "";

  const [first] = new Segmenter(undefined, { granularity: "grapheme" }).segment(
    word,
  );
  return first?.segment ?? "";
}

// The first grapheme of the first and of the last word, in upper case.
export function getInitials(name: string) {
  const words = name.normalize("NFC").trim().split(/\s+/);
  const first = words[0] ?? "";
  const last = words.length > 1 ? (words.at(-1) ?? "") : "";

  return (firstGrapheme(first) + firstGrapheme(last)).toUpperCase();
}
