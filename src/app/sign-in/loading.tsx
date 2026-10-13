import { NarrowMain } from "@/components/narrow-main";

import { AuthContentSkeleton } from "./_ui/auth-content-skeleton";
import { AuthHeaderSkeleton } from "./_ui/auth-header";

export default function SignInLoading() {
  return (
    <>
      <AuthHeaderSkeleton />
      <NarrowMain>
        <AuthContentSkeleton />
      </NarrowMain>
    </>
  );
}
