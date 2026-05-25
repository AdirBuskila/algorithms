"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavGroup {
  label: string;
  items: { slug: string; title: string }[];
}

export default function SidebarNav({
  groups,
  lang,
  heading,
}: {
  groups: NavGroup[];
  lang: string;
  heading: string;
}) {
  const pathname = usePathname() || "";
  return (
    <nav className="sidebar-nav" aria-label={heading}>
      {groups.map((g) => (
        <div className="sidebar-group" key={g.label}>
          <div className="sidebar-group-label">{g.label}</div>
          <ul>
            {g.items.map((it) => {
              const href = `/${lang}/algorithms/${it.slug}/`;
              const active = pathname === href || pathname === href.slice(0, -1);
              return (
                <li key={it.slug}>
                  <Link
                    href={href}
                    className={`sidebar-link${active ? " is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {it.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
