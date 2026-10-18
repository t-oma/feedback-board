import { PageIntro, PageIntroSkeleton } from "@/components/page-intro";

const heading = "Create your board";
const supportingText = "Everything here can be changed later in Settings.";

export function CreateProductIntro() {
  return <PageIntro title={heading} description={supportingText} />;
}

export function CreateProductIntroSkeleton() {
  return <PageIntroSkeleton title={heading} description={supportingText} />;
}
