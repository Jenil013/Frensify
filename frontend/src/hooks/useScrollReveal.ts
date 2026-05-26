import { useRef } from "react";
import { useInView } from "motion/react";

export function useScrollReveal(margin: string = "-80px 0px") {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin });
  return { ref, isInView };
}
