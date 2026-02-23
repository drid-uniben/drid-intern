interface DescriptionSegment {
  type: "text" | "link";
  content: string;
  href?: string;
}

const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
const plainUrlPattern = /https?:\/\/[^\s<]+/g;

const isSafeHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const splitTrailingPunctuation = (value: string): { url: string; trailing: string } => {
  const match = value.match(/^(.*?)([).,;!?]+)?$/);
  if (!match) {
    return { url: value, trailing: "" };
  }

  return {
    url: match[1] ?? value,
    trailing: match[2] ?? "",
  };
};

const parsePlainTextLinks = (text: string): DescriptionSegment[] => {
  const segments: DescriptionSegment[] = [];
  let cursor = 0;
  plainUrlPattern.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = plainUrlPattern.exec(text)) !== null) {
    const rawUrl = match[0];
    const matchStart = match.index;
    const before = text.slice(cursor, matchStart);
    if (before) {
      segments.push({ type: "text", content: before });
    }

    const { url, trailing } = splitTrailingPunctuation(rawUrl);
    if (isSafeHttpUrl(url)) {
      segments.push({ type: "link", content: url, href: url });
    } else {
      segments.push({ type: "text", content: rawUrl });
    }

    if (trailing) {
      segments.push({ type: "text", content: trailing });
    }

    cursor = matchStart + rawUrl.length;
  }

  const rest = text.slice(cursor);
  if (rest) {
    segments.push({ type: "text", content: rest });
  }

  return segments;
};

export const validateChallengeDescriptionLinks = (description: string): string | null => {
  markdownLinkPattern.lastIndex = 0;
  let foundMarkdownLink = false;
  let match: RegExpExecArray | null;
  while ((match = markdownLinkPattern.exec(description)) !== null) {
    foundMarkdownLink = true;
    const label = match[1]?.trim();
    const url = match[2]?.trim();
    if (!label || !url || !isSafeHttpUrl(url)) {
      return "Invalid link detected. Use [text](https://example.com) with http/https URLs.";
    }
  }

  if (description.includes("](") && !foundMarkdownLink) {
    return "Invalid link format. Use [text](https://example.com).";
  }

  return null;
};

export const parseChallengeDescription = (description: string): DescriptionSegment[] => {
  const segments: DescriptionSegment[] = [];
  let cursor = 0;

  markdownLinkPattern.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = markdownLinkPattern.exec(description)) !== null) {
    const fullMatch = match[0];
    const index = match.index;
    const before = description.slice(cursor, index);
    if (before) {
      segments.push(...parsePlainTextLinks(before));
    }

    const label = match[1]?.trim();
    const url = match[2]?.trim();
    if (label && url && isSafeHttpUrl(url)) {
      segments.push({ type: "link", content: label, href: url });
    } else {
      segments.push({ type: "text", content: fullMatch });
    }

    cursor = index + fullMatch.length;
  }

  const rest = description.slice(cursor);
  if (rest) {
    segments.push(...parsePlainTextLinks(rest));
  }

  return segments;
};
