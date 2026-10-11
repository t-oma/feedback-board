import { NarrowMain } from "@/components/narrow-main";
import { AuthContentSkeleton } from "@/features/auth/ui/auth-content-skeleton";
import { AuthHeaderSkeleton } from "@/features/auth/ui/auth-header";

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
