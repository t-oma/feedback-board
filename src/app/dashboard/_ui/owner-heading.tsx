"use client";

import { useEffect, useRef, useState } from "react";

import { Notice, type NoticeMessage } from "@/components/notice";

type OwnerHeadingProps = {
  productName: string;
  notice: NoticeMessage | null;
};

export function OwnerHeading({ productName, notice }: OwnerHeadingProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState(false);
  const shown = notice !== null && !dismissed;

  // A notice reports what an action on this page just did, and the control
  // that ran it is gone by the time the notice appears, so focus would fall
  // to the page body.
  useEffect(() => {
    if (shown) noticeRef.current?.focus();
  }, [shown]);

  return (
    <>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="rounded-sm font-serif text-2xl font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {productName}
      </h1>
      {shown && (
        <Notice
          ref={noticeRef}
          message={notice}
          onDismiss={() => {
            setDismissed(true);
            // The notice had focus and leaves with it.
            headingRef.current?.focus();
          }}
        />
      )}
    </>
  );
}
