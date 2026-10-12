import type { ReactNode } from "react";

import { formStyles } from "./styles";

type FormSkeletonProps = {
  children: ReactNode;
};

export function FormSkeleton({ children }: FormSkeletonProps) {
  return <div className={formStyles()}>{children}</div>;
}
