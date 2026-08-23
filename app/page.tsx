import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import HomeNotes from "@/components/HomeNotes";
import { guides } from "@/lib/guides";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const TOOLS = [
  {
    href: "/calc/bracket",
    title: "학자금 지원구간 계산",
    desc: "연봉이 아니라 소득인정액으로 정해집니다. 재산까지 넣어 구간 확인",
    badge: "지원구간",
  },
  {
    href: "/calc/scholarship",
    title: "국가장학금 지원액",
    desc: "구간별 단가와 등록금을 함께. 실제로 받는 금액과 남는 금액",
    badge: "국가장학금",
  },
  {
    href: "/calc/icl",
    title: "학자금대출 상환액",
    desc: "연봉 약 2,851만원부터. 초과분의 20%와 잔액 소진 기간",
    badge: "학자금대출",
  },
  {
    href: "/calc/deduction",
    title: "교육비 세액공제",
    desc: "갚은 원리금은 한도 없이 전액 공제. 돌려받는 세금 계산",
    badge: "연말정산",
  },
];

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "ko",
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="py-6 text-center sm:py-10">
        <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
          등록금,
          <br className="sm:hidden" /> 어디서 돈이 갈리나
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          우리 집은 몇 구간인지, 국가장학금을 얼마나 받는지, 학자금대출은 연봉
          얼마부터 갚는지, 갚은 돈으로 세금을 얼마나 돌려받는지 — 알면 달라지는
          것들을 한곳에 모았습니다.
        </p>
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="rounded-2xl border border-border-soft bg-card p-5 shadow-sm transition-all hover:border-accent hover:shadow-md"
          >
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent-strong">
              {tool.badge}
            </span>
            <h2 className="mt-3 text-lg font-bold leading-snug">{tool.title}</h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
              {tool.desc}
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-bold">학자금 가이드</h2>
          <Link href="/guide" className="text-[15px] text-accent hover:underline">
            전체 보기 →
          </Link>
        </div>
        <ul className="space-y-3">
          {guides.slice(0, 10).map((g) => (
            <li key={g.slug}>
              <div className="rounded-xl border border-border-soft bg-card p-4 shadow-sm transition-all hover:border-accent">
                {/* 제목만 링크로 둔다 — 설명까지 앵커에 넣으면 본문 대부분이
                    링크 텍스트가 된다. */}
                <p className="font-bold leading-snug">
                  <Link href={`/guide/${g.slug}`} className="hover:text-accent">
                    {g.title}
                  </Link>
                </p>
                <p className="mt-1 line-clamp-2 text-[15px] text-muted">
                  {g.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <HomeNotes
        siteName={SITE_NAME}
        updated="2026-08-20"
        intro="등록금 이야기는 늘 '우리 집은 몇 구간이냐'에서 막힙니다. 구간이 연봉으로 정해지지 않기 때문입니다. 아래 네 가지가 실제로 금액이 크게 달라지는 지점입니다."
        scenarios={[
          {
            situation: "국가장학금을 처음 알아볼 때",
            action:
              "먼저 학자금 지원구간부터 확인해야 합니다. 구간은 부모님 연봉이 아니라 '소득인정액'으로 정해지고, 여기에는 재산을 소득으로 환산한 값이 더해집니다. 같은 소득이라도 집이 있으면 구간이 두 단계 올라가기도 합니다. 기본재산액 6,900만원까지는 영향이 없습니다.",
            href: "/calc/bracket",
            label: "우리 집 구간 확인하기",
          },
          {
            situation: "구간은 알았고 얼마 받는지 궁금할 때",
            action:
              "2026년 I유형 단가는 1~3구간 600만원, 4~6구간 440만원, 7~8구간 360만원, 9구간 100만원입니다. 다만 지원금은 등록금을 넘지 못합니다. 등록금 400만원인 국립대 1구간 학생은 600만원이 아니라 400만원을 받습니다.",
            href: "/calc/scholarship",
            label: "예상 지원액 계산하기",
          },
          {
            situation: "취업이 정해져 상환이 걱정될 때",
            action:
              "취업 후 상환 대출은 전년도 소득으로 판정하므로 취업 당해에는 갚지 않습니다. 기준은 소득금액 1,898만원, 총급여로는 약 2,851만원입니다. 넘어도 초과분의 20%만 냅니다. 다만 소득이 없는 동안에도 이자는 쌓입니다.",
            href: "/calc/icl",
            label: "상환액 계산하기",
          },
          {
            situation: "첫 연말정산을 앞두고 있을 때",
            action:
              "학자금대출 원리금 상환액은 한도 없이 전액이 본인 교육비 세액공제 대상입니다. 연 300만원을 갚았다면 45만원이 세금에서 빠집니다. 등록금을 낸 해가 아니라 갚은 해에 공제받는다는 점을 놓치기 쉽습니다.",
            href: "/calc/deduction",
            label: "돌려받을 세금 계산하기",
          },
        ]}
        faq={[
          {
            q: "부모님 연봉이 5,000만원이면 몇 구간인가요?",
            a: "연봉만으로는 정할 수 없습니다. 구간은 소득에 재산의 소득환산액을 더한 소득인정액으로 정해지므로, 재산과 부채, 가구원 수에 따라 3구간이 될 수도 있고 7구간이 될 수도 있습니다. 계산기에 재산까지 넣어 보셔야 합니다.",
          },
          {
            q: "1구간이면 무조건 600만원을 받나요?",
            a: "아닙니다. 국가장학금은 등록금을 대신 내주는 제도라 등록금보다 많이 받을 수 없습니다. 등록금이 400만원이면 400만원만 받고 남는 200만원은 사라집니다. 반대로 등록금이 900만원이면 600만원을 받고 300만원은 스스로 내야 합니다.",
          },
          {
            q: "II유형이나 교내장학금도 계산해 주나요?",
            a: "하지 않습니다. II유형은 재단이 대학에 예산을 주고 대학이 자체 기준으로 배분하는 방식이라 학교마다 기준과 금액이 다릅니다. 일률적으로 계산할 수 없는 것을 추정하면 오히려 잘못된 판단을 부르므로, 학교 장학팀 확인으로 안내합니다.",
          },
          {
            q: "계산 결과가 재단에서 받은 통지와 다릅니다",
            a: "재단은 소득·재산을 공적 자료로 직접 조회하고, 소득평가액에 항목별 공제를 더 적용하며, 재산도 공시가격·기준시가로 평가합니다. 이 사이트는 공개된 산식을 코드로 옮긴 참고용이며, 확정 판단은 한국장학재단이 합니다.",
          },
          {
            q: "입력한 정보가 저장되나요?",
            a: "저장되지 않습니다. 모든 계산은 이용자의 브라우저 안에서 이루어지며 서버로 전송되지 않습니다. 회원가입도 없습니다.",
          },
        ]}
        maintained={[
          "기준 중위소득 — 매년 8월 고시, 2026년 4인 6,494,738원",
          "학자금 지원구간 경계 — 중위소득 30/50/70/90/100/130/150/200/300%",
          "기본재산액 공제 6,900만원 (전국 단일) · 월 소득환산율 일반 1.39% / 금융 2.09%",
          "국가장학금 I유형 단가 — 1~3구간 600만 / 4~6구간 440만 / 7~8구간 360만 / 9구간 100만",
          "다자녀 단가 — 첫째·둘째 610/505/465/135만 · 셋째 이상 1~8구간 전액",
          "성적 요건 — 12학점 이상 + 80점 이상 (1~3구간·기초차상위는 70점 경고제)",
          "ICL 상환기준소득 — 소득금액 1,898만원 (총급여 약 2,851만원) · 상환율 20%/25%",
          "학자금대출 금리 — 2026년 1학기 연 1.7%",
          "교육비 세액공제 — 15%, 본인 한도 없음 / 대학생 자녀 900만 / 초·중·고 300만",
        ]}
      />

      <AdSlot slot="home-bottom" />
    </div>
  );
}
