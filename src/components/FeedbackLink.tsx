"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { feedbackHref } from "@/lib/feedback";

// A real <a>: the mailto href is only attached in the browser, after mount, so the
// exported static HTML never contains the address.
export default function FeedbackLink({
  subject,
  children,
}: {
  subject: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    ref.current?.setAttribute("href", feedbackHref(subject));
  }, [subject]);
  return (
    <a ref={ref} className="feedback-link">
      {children}
    </a>
  );
}
