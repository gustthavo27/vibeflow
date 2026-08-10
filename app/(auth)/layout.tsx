import { VibeflowLogo } from "@/components/dashboard/vibeflow-logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="bg-grain relative flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,color-mix(in_oklch,var(--color-primary)_16%,transparent),transparent)]"
      />
      <div className="mb-8">
        <VibeflowLogo href="/" className="text-foreground" />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
