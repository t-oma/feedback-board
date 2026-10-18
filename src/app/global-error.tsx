"use client";

import "./globals.css";

import { clsx } from "clsx";

import { Button } from "@/components/button";
import { ErrorState } from "@/components/error-state";
import { PageMain } from "@/components/page-main";

import { sourceSerif } from "./fonts";

type GlobalErrorProps = {
  retry: () => void;
};

// Replaces the root layout, so it brings its own document, styles and serif
// font. Without the font's variable, `font-serif` does not fall back to
// Georgia: an undefined `var()` voids the whole `font-family` declaration, and
// the heading inherits the body's sans.
export default function GlobalError({ retry }: GlobalErrorProps) {
  return (
    <html
      lang="en"
      className={clsx(sourceSerif.variable, "h-full antialiased")}
    >
      <body className="flex min-h-full flex-col">
        <title>Feedback Board</title>
        <PageMain align="center">
          <ErrorState
            title="We couldn’t load this page. Please try again."
            headingLevel={1}
          >
            <Button onClick={retry}>Retry</Button>
          </ErrorState>
        </PageMain>
      </body>
    </html>
  );
}
