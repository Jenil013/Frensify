import { useRef } from "react";
import { useInView, type UseInViewOptions } from "motion/react";

type ScrollRevealMargin = NonNullable<UseInViewOptions["margin"]>;

export function useScrollReveal(margin: ScrollRevealMargin = "-80px 0px") {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin });
  return { ref, isInView };
}
