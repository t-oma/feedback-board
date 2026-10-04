import { AuthContentSkeleton } from "@/features/auth/ui/auth-content-skeleton";
import { AuthHeaderSkeleton } from "@/features/auth/ui/auth-header";
import { AuthMain } from "@/features/auth/ui/auth-main";

export default function SignInLoading() {
  return (
    <>
      <AuthHeaderSkeleton />
      <AuthMain>
        <AuthContentSkeleton />
      </AuthMain>
    </>
  );
}
