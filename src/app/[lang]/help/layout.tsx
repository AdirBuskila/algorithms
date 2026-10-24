import type { ReactNode } from "react";
import HelpTracker from "@/components/help/HelpTracker";

export default function HelpLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HelpTracker />
      {children}
    </>
  );
}
