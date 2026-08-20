import Link from "next/link";
import FamilyLinks from "@/components/FamilyLinks";
import { SITE_NAME } from "@/lib/site";

const TOOL_LINKS = [
  { href: "/calc/bracket", label: "학자금 지원구간 계산" },
  { href: "/calc/scholarship", label: "국가장학금 지원액" },
  { href: "/calc/icl", label: "학자금대출 상환액" },
  { href: "/calc/deduction", label: "교육비 세액공제" },
  { href: "/guide", label: "학자금 가이드" },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border-soft bg-card">
      <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-muted">
        <nav aria-label="사이트 바로가기" className="mb-5">
          <p className="mb-2 font-semibold text-foreground">{SITE_NAME} 도구</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {TOOL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <FamilyLinks />
        <p className="mb-3">
          {SITE_NAME}의 계산 결과는 「한국장학재단 설립 등에 관한 법률」·「취업 후
          학자금 상환 특별법」·소득세법 등 공개된 기준과 관련 고시를 정리한 참고용
          추정치이며, 세무·금융 자문이 아닙니다. 지원구간과 지원액은 한국장학재단이
          최종 결정합니다. 한국장학재단(1599-2000)에서 확인하세요.
        </p>
        <div className="flex gap-4">
          <Link href="/about" className="hover:text-accent">
            소개
          </Link>
          <Link href="/editorial" className="hover:text-accent">
            편집 원칙
          </Link>
          <Link href="/contact" className="hover:text-accent">
            문의
          </Link>
          <Link href="/terms" className="hover:text-accent">
            이용약관
          </Link>
          <Link href="/privacy" className="hover:text-accent">
            개인정보처리방침
          </Link>
        </div>
        <p className="mt-3">© {new Date().getFullYear()} {SITE_NAME}</p>
      </div>
    </footer>
  );
}
