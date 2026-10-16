"use client";

import { Button } from "@/components/button";
import { ErrorState } from "@/components/error-state";
import { Link } from "@/components/link";
import { PageMain } from "@/components/page-main";

type RouteErrorProps = {
  retry: () => void;
};

export default function RouteError({ retry }: RouteErrorProps) {
  return (
    <PageMain align="center">
      <ErrorState
        title="We couldn’t load this page. Please try again."
        headingLevel={1}
      >
        <Button onClick={retry}>Retry</Button>
        <Link variant="secondary" href="/">
          Go to the landing page
        </Link>
      </ErrorState>
    </PageMain>
  );
}
