"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "span";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      style={visible ? { animationDelay: `${delay}ms` } : { opacity: 0 }}
      className={cn(visible && "animate-in fade-in slide-in-from-bottom-6 fill-mode-both duration-700", className)}
    >
      {children}
    </Tag>
  );
}

export { Reveal };
