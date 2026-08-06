import Link from "next/link";

import { cn } from "@/lib/utils";

function VibeflowLogo({ href, className }: { href?: string; className?: string }) {
  const content = (
    <>
      <span className="flex size-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
        V
      </span>
      <span className="font-heading text-lg font-semibold tracking-tight">
        Vibe<span className="italic text-primary">Flow</span>
      </span>
    </>
  );

  const classes = cn(
    "flex items-center gap-2 text-sidebar-foreground",
    className,
  );

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
