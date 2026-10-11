"use client";

import { CircleCheck, Info, X } from "lucide-react";
import { type RefObject, useEffect, useRef, useState } from "react";

import { useCreateProduct } from "./create-product-provider";

type OwnerHeadingProps = {
  productName: string;
};

// The page heading, and under it what the create-product action just did, if
// this visit ran it.
export function OwnerHeading({ productName }: OwnerHeadingProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  return (
    <>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="rounded-sm font-serif text-2xl font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {productName}
      </h1>
      <CreateProductNotice headingRef={headingRef} />
    </>
  );
}

type CreateProductNoticeProps = {
  headingRef: RefObject<HTMLHeadingElement | null>;
};

function CreateProductNotice({ headingRef }: CreateProductNoticeProps) {
  const { state } = useCreateProduct();
  const [dismissed, setDismissed] = useState(false);
  const noticeRef = useRef<HTMLDivElement>(null);

  // A board just created, or the one that already existed when a second was
  // refused. Anything else leaves the owner state to speak for itself.
  const notice =
    state === null
      ? null
      : state.ok
        ? { text: "Your board is live", Icon: CircleCheck }
        : state.message === undefined
          ? null
          : { text: state.message, Icon: Info };

  // The submit button that had focus is gone with the form, and focus would
  // fall to the page body.
  const shown = notice !== null && !dismissed;
  useEffect(() => {
    if (shown) noticeRef.current?.focus();
  }, [shown]);

  if (!shown) return null;

  const { text, Icon } = notice;

  return (
    <div
      ref={noticeRef}
      role="status"
      tabIndex={-1}
      className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-muted py-2 pr-2 pl-3 text-sm text-foreground-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Icon aria-hidden="true" className="size-4 shrink-0 text-accent" />
      <p className="flex-1 font-medium">{text}</p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          setDismissed(true);
          headingRef.current?.focus();
        }}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-foreground-subtle hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
      >
        <X aria-hidden="true" size={18} />
      </button>
    </div>
  );
}
