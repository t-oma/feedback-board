import type { ReactNode } from "react";

import { formClassName } from "./form-class-name";

type FormSkeletonProps = {
  children: ReactNode;
};

export function FormSkeleton({ children }: FormSkeletonProps) {
  return <div className={formClassName}>{children}</div>;
}
