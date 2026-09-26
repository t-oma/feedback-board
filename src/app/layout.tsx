import "./globals.css";

import type { Metadata } from "next";

import { jetbrainsMono, sourceSerif } from "./fonts";

export const metadata: Metadata = {
  title: {
    default: "Feedback Board",
    template: "%s · Feedback Board",
  },
  description:
    "One public board where your users post and vote on what to build next.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
