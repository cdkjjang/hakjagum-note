"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_NAME } from "@/lib/site";

const NAV = [
  { href: "/calc/bracket", label: "지원구간" },
  { href: "/calc/scholarship", label: "국가장학금" },
  { href: "/calc/icl", label: "대출상환" },
  { href: "/calc/deduction", label: "세액공제" },
  { href: "/guide", label: "가이드" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border-soft bg-card/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-lg font-extrabold tracking-tight text-accent-strong"
        >
          {SITE_NAME}
        </Link>
        <nav className="-mr-1 flex min-w-0 items-center gap-0.5 overflow-x-auto whitespace-nowrap text-sm sm:gap-2">
          {NAV.map((item) => {
            const active =
              item.href === "/guide"
                ? pathname.startsWith("/guide")
                : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-2 py-1.5 transition-colors sm:px-3 ${
                  active
                    ? "bg-accent font-semibold text-white"
                    : "hover:bg-border-soft/60 hover:text-accent"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
