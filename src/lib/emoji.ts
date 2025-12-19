const emojiMap: Record<string, string> = {
  "<3": "❤️",
  ":)": "😊",
  ":(": "🙁",
  ":P": "😛",
  ":D": "😄",
};

const patterns: Record<string, RegExp> = {
  ":)": /:\)(?!\))/g,
  ":(": /:\((?!\()/g,
  ":P": /:P(?!P)/g,
  ":D": /:D(?!D)/g,
  "<3": /<3(?!3)/g,
};

export function parseEmoji(text: string): string {
  let result = text;
  // 👇 normalize HTML escaped trước
  result = result.replace(/&lt;3/g, "<3");
  for (const [key, pattern] of Object.entries(patterns)) {
    result = result.replace(pattern, emojiMap[key]);
  }
  return result;
}
