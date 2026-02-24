import { Fragment } from "react";
import { parseChallengeDescription } from "@/lib/challengeLinks";

export function ChallengeDescription({ description }: { description: string }) {
  const segments = parseChallengeDescription(description);

  return (
    <>
      {segments.map((segment, index) =>
        segment.type === "link" && segment.href ? (
          <a
            key={`${segment.href}-${index}`}
            href={segment.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--accent-start)] hover:underline break-all [overflow-wrap:anywhere]"
          >
            {segment.content}
          </a>
        ) : (
          <Fragment key={`text-${index}`}>{segment.content}</Fragment>
        ),
      )}
    </>
  );
}
