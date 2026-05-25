"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/content";
import { LOCALE_NAMES } from "@/lib/i18n";

export default function LanguageToggle({ lang }: { lang: Locale }) {
  const pathname = usePathname() || `/${lang}/`;
  const other: Locale = lang === "en" ? "he" : "en";
  // Swap the leading locale segment to keep the user on the same page.
  const target = pathname.replace(/^\/(en|he)(\/|$)/, `/${other}$2`);

  return (
    <Link
      href={target}
      className="lang-toggle"
      onClick={() => {
        try {
          localStorage.setItem("lang", other);
        } catch {}
      }}
    >
      {LOCALE_NAMES[other]}
    </Link>
  );
}
