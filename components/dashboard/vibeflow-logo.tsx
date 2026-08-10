import Link from "next/link";

import { cn } from "@/lib/utils";

function VibeflowLogo({ href, className }: { href?: string; className?: string }) {
  const content = (
    <>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-extrabold text-primary-foreground">
        V
      </span>
      <span className="font-heading text-lg font-bold tracking-tight text-sidebar-foreground">
        VibeFlow
      </span>
    </>
  );

  const classes = cn("flex items-center gap-2.5 text-sidebar-foreground", className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}

export { VibeflowLogo };
