"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/button";

type CopyResult = "copied" | "failed";

const CONFIRMATION_MS = 2000;

const labels = {
  copied: "Copied",
  failed: "Couldn’t copy",
} satisfies Record<CopyResult, string>;

type CopyLinkButtonProps = {
  url: string;
};

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [result, setResult] = useState<CopyResult | null>(null);

  useEffect(() => {
    if (result === null) return;

    const timeout = setTimeout(() => {
      setResult(null);
    }, CONFIRMATION_MS);
    return () => {
      clearTimeout(timeout);
    };
  }, [result]);

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => {
          navigator.clipboard.writeText(url).then(
            () => {
              setResult("copied");
            },
            () => {
              setResult("failed");
            },
          );
        }}
      >
        {result === null ? "Copy link" : labels[result]}
      </Button>
      {/* The result is announced from a live region that exists before it
          changes, rather than left to the button's new label. */}
      <span role="status" className="sr-only">
        {result === "copied" ? "Link copied" : ""}
        {result === "failed" ? "The link couldn’t be copied" : ""}
      </span>
    </>
  );
}
