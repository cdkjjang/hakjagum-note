import type { Metadata } from "next";
import CalcGuides from "@/components/CalcGuides";
import Link from "next/link";
import IclCalculator from "@/components/IclCalculator";
import AdSlot from "@/components/AdSlot";
import CalcNotes from "@/components/CalcNotes";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "학자금대출 상환액 계산기 — 연봉 얼마부터 갚나",
  description:
    "취업 후 상환 학자금대출(ICL)은 소득이 상환기준소득을 넘은 해부터 초과분의 20%를 갚습니다. 2026년 기준소득 1,898만원(총급여 약 2,851만원)으로 의무상환액과 소진 기간을 계산합니다.",
  alternates: { canonical: "/calc/icl" },
};

const faq = [
  {
    q: "연봉 얼마부터 갚나요?",
    a: "2026년 상환기준소득은 소득금액 1,898만원입니다. 이것은 총급여가 아니라 근로소득공제를 뺀 뒤의 금액이라, 총급여로 환산하면 약 2,851만원입니다. 연봉이 이보다 적으면 갚을 의무가 없습니다.",
  },
  {
    q: "기준을 넘으면 전부 갚아야 하나요?",
    a: "아닙니다. 초과분에 대해서만 학부는 20%, 대학원은 25%를 냅니다. 소득금액이 1,900만원이면 초과분 2만원의 20%인 4,000원이 그해 의무상환액입니다. 그래서 기준을 갓 넘긴 해에는 상환액이 아주 적습니다.",
  },
  {
    q: "실직하면 어떻게 되나요?",
    a: "소득이 상환기준소득 아래로 내려가면 그해에는 의무상환이 없습니다. 소득에 연동되는 구조라 갚을 능력이 없는 동안에는 멈춥니다. 이 점이 일반상환 학자금대출과 가장 크게 다른 부분입니다.",
  },
  {
    q: "이자는 계속 붙나요?",
    a: "붙습니다. 2026년 1학기 기준 연 1.7%입니다. 재학 중과 소득이 없는 기간에도 이자가 쌓이므로, 상환을 오래 미루면 총 부담이 커집니다. 여유가 될 때 자발적 상환으로 미리 갚으면 그만큼 이자가 줄어듭니다.",
  },
  {
    q: "회사에서 알게 되나요?",
    a: "근로소득이 있으면 원천공제 방식으로 매달 급여에서 나눠 떼는 것이 원칙이라, 회사가 알게 됩니다. 다만 본인이 직접 납부하는 방식으로 바꿀 수 있습니다. 재단 누리집에서 신청하면 됩니다.",
  },
  {
    q: "갚은 돈으로 세금을 돌려받는다는 게 사실인가요?",
    a: "사실입니다. 학자금대출 원리금 상환액은 본인 교육비 세액공제 대상이라, 한도 없이 전액을 넣어 15%를 세액에서 뺍니다. 연 300만원을 갚았다면 45만원입니다. 등록금을 낸 해가 아니라 갚은 해에 공제받습니다.",
  },
];

export default function IclPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: faq.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "학자금대출 상환액 계산기" },
        ],
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="mb-2 text-2xl font-extrabold">학자금대출 상환액 계산기</h1>
      <p className="mb-6 text-muted">
        취업 후 상환 학자금대출(ICL)의 연간 의무상환액과 잔액 소진 기간을 계산합니다.
        2026년 기준입니다.
      </p>

      <IclCalculator />

      <AdSlot slot="icl-below-tool" />

      <section className="mt-10 space-y-4 text-[15px] leading-relaxed">
        <h2 className="text-xl font-bold">기준은 연봉이 아니라 소득금액입니다</h2>
        <p>
          &ldquo;연봉 3천이면 갚는다&rdquo;는 말이 사람마다 다르게 들리는 이유가
          있습니다. 상환기준소득 <strong>1,898만원</strong>은 총급여가 아니라{" "}
          <strong>근로소득공제를 뺀 뒤의 소득금액</strong>이기 때문입니다.
        </p>
        <p className="rounded-xl border border-border-soft bg-card p-4 font-mono text-sm">
          소득금액 = 총급여 − 근로소득공제
        </p>
        <p>
          총급여 2,851만원이면 근로소득공제가 약 953만원이라 소득금액이 정확히
          1,898만원이 됩니다. 즉 <strong>연봉 약 2,851만원</strong>이 실제 문턱입니다.
          연봉이 이보다 적으면 갚을 의무가 없습니다.
        </p>

        <h2 className="mt-8 text-xl font-bold">갚는 것은 초과분의 20%뿐입니다</h2>
        <p className="rounded-xl border border-border-soft bg-card p-4 font-mono text-sm">
          의무상환액 = (소득금액 − 1,898만원) × 20% (대학원은 25%)
        </p>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full min-w-[440px] border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-border-soft text-left">
                <th className="py-2 pr-3 font-bold">총급여</th>
                <th className="py-2 pr-3 font-bold">소득금액</th>
                <th className="py-2 pr-3 font-bold">초과분</th>
                <th className="py-2 font-bold">연 의무상환액 (학부)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-soft"><td className="py-2 pr-3">2,800만원</td><td className="py-2 pr-3">1,855만원</td><td className="py-2 pr-3">없음</td><td className="py-2">0원</td></tr>
              <tr className="border-b border-border-soft"><td className="py-2 pr-3">2,900만원</td><td className="py-2 pr-3">1,940만원</td><td className="py-2 pr-3">42만원</td><td className="py-2">8만 4,000원</td></tr>
              <tr className="border-b border-border-soft"><td className="py-2 pr-3">3,500만원</td><td className="py-2 pr-3">2,450만원</td><td className="py-2 pr-3">552만원</td><td className="py-2">110만 4,000원</td></tr>
              <tr className="border-b border-border-soft"><td className="py-2 pr-3">4,000만원</td><td className="py-2 pr-3">2,875만원</td><td className="py-2 pr-3">977만원</td><td className="py-2">195만 4,000원</td></tr>
              <tr><td className="py-2 pr-3">5,000만원</td><td className="py-2 pr-3">3,775만원</td><td className="py-2 pr-3">1,877만원</td><td className="py-2">375만 4,000원</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          기준을 갓 넘긴 해에는 연 상환액이 <strong>몇만원에 그칩니다.</strong> 소득이
          늘면 상환액도 함께 늘고, 실직해서 기준 아래로 내려가면 다시 멈춥니다. 그래서
          취업 후 상환 대출은 연체가 잘 생기지 않습니다.
        </p>

        <h2 className="mt-8 text-xl font-bold">
          다만 이자는 그동안에도 쌓입니다
        </h2>
        <p>
          소득에 연동된다는 것은 &lsquo;갚을 능력이 없으면 안 갚아도 된다&rsquo;는
          뜻이지 &lsquo;그동안 빚이 늘지 않는다&rsquo;는 뜻이 아닙니다. 2026년 1학기
          금리는 <strong>연 1.7%</strong>이고, 재학 중에도 소득이 없는 기간에도 이자가
          붙습니다.
        </p>
        <p>
          의무상환액이 한 해 이자보다 적으면 <strong>원금이 오히려 늘어납니다.</strong>{" "}
          잔액 2,000만원에 연 1.7% 이자는 34만원인데, 소득이 기준을 조금만 넘어 연
          상환액이 8만원이라면 매년 26만원씩 잔액이 커집니다. 이 계산기가 그런
          경우에 소진 기간을 숫자로 내놓지 않는 이유입니다.
        </p>
        <p>
          여유가 생기면 <strong>자발적 상환</strong>으로 언제든 더 낼 수 있습니다.
          중도상환수수료가 없으므로, 여윳돈이 있다면 미리 갚는 편이 이자 면에서
          유리합니다.
        </p>

        <h2 className="mt-8 text-xl font-bold">일반상환 대출과 무엇이 다른가</h2>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full min-w-[440px] border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-border-soft text-left">
                <th className="py-2 pr-3 font-bold"></th>
                <th className="py-2 pr-3 font-bold">취업 후 상환 (ICL)</th>
                <th className="py-2 font-bold">일반상환</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-soft"><td className="py-2 pr-3">상환 시작</td><td className="py-2 pr-3">소득이 기준을 넘은 해부터</td><td className="py-2">거치기간이 끝나면</td></tr>
              <tr className="border-b border-border-soft"><td className="py-2 pr-3">상환액</td><td className="py-2 pr-3">소득에 따라 매년 달라짐</td><td className="py-2">정해진 원리금 고정</td></tr>
              <tr className="border-b border-border-soft"><td className="py-2 pr-3">소득이 없으면</td><td className="py-2 pr-3">상환 없음 (이자는 쌓임)</td><td className="py-2">그래도 갚아야 함</td></tr>
              <tr className="border-b border-border-soft"><td className="py-2 pr-3">신청 자격</td><td className="py-2 pr-3">학자금 지원구간 등 요건 있음</td><td className="py-2">요건이 더 넓음</td></tr>
              <tr><td className="py-2 pr-3">연체 위험</td><td className="py-2 pr-3">낮음</td><td className="py-2">있음</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          소득이 불안정할 가능성이 있다면 취업 후 상환이 안전합니다. 반대로 곧 안정된
          소득이 예상되고 빨리 털고 싶다면 일반상환이 총 이자 면에서 유리할 수
          있습니다.
        </p>

        <h2 className="mt-8 text-xl font-bold">자주 묻는 질문</h2>
        <dl className="space-y-4">
          {faq.map(({ q, a }) => (
            <div
              key={q}
              className="rounded-xl border border-border-soft bg-card p-4 shadow-sm"
            >
              <dt className="font-bold">
                <span className="text-accent">Q.</span> {q}
              </dt>
              <dd className="mt-2 text-muted">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <CalcNotes
        updated="2026-08-20"
        basis={[
          {
            law: "「취업 후 학자금 상환 특별법」 제18조 (의무상환액의 산정)",
            detail:
              "채무자의 연간 소득금액이 상환기준소득을 초과하는 경우, 그 초과금액에 상환율을 곱한 금액을 의무상환액으로 합니다.",
          },
          {
            law: "2026년 상환기준소득 — 소득금액 1,898만원",
            detail:
              "총급여가 아니라 근로소득공제를 뺀 뒤의 금액입니다. 근로소득공제를 역산하면 총급여 약 2,851만원에 해당합니다. 매년 국세청이 고시하며 전년도 귀속 소득을 기준으로 판정합니다.",
          },
          {
            law: "상환율 — 학부 20% · 대학원 25%",
            detail:
              "상환기준소득 초과분에만 적용됩니다. 소득 전체에 곱하는 것이 아닙니다.",
          },
          {
            law: "소득세법 제47조 (근로소득공제)",
            detail:
              "총급여 500만원 이하 70%, 1,500만원 이하 350만원 + 초과분 40%, 4,500만원 이하 750만원 + 초과분 15%, 1억원 이하 1,200만원 + 초과분 5%, 1억원 초과 1,475만원 + 초과분 2%.",
          },
          {
            law: "대출 금리 — 2026년 1학기 연 1.7%",
            detail:
              "학기마다 교육부가 고시합니다. 중도상환수수료는 없어 자발적 상환으로 언제든 더 갚을 수 있습니다.",
          },
        ]}
        note="근로소득만 있는 경우를 가정한 추정치입니다. 사업·이자·배당·연금소득이 함께 있으면 소득금액 산정이 달라집니다. 실제 의무상환액은 국세청이 전년도 소득을 확정한 뒤 통지하며, 원천공제·직접납부 등 납부 방식에 따라 시기가 달라집니다. 금융 자문이 아니며 확정 금액은 한국장학재단(1599-2000)에서 확인하세요."
        examples={[
          {
            title: "총급여 4,000만원 · 학부 대출",
            steps: [
              "근로소득공제 = 750만 + (4,000만 − 1,500만) × 15% = 1,125만원",
              "소득금액 = 4,000만 − 1,125만 = 2,875만원",
              "초과분 = 2,875만 − 1,898만 = 977만원",
              "977만원 × 20% = 195만 4,000원",
            ],
            result: "연 195만 4,000원 · 월 약 16만 2,830원",
          },
          {
            title: "같은 소득인데 대학원 대출인 경우",
            steps: ["초과분 977만원 × 25% = 244만 2,500원"],
            result: "연 244만 2,500원 — 학부보다 49만원 많습니다",
          },
          {
            title: "총급여 2,900만원 — 기준을 갓 넘긴 경우",
            steps: [
              "소득금액 = 1,940만원",
              "초과분 = 42만원",
              "42만원 × 20% = 8만 4,000원",
            ],
            result: "연 8만 4,000원 — 잔액 2,000만원의 이자(34만원)보다 적습니다",
          },
          {
            title: "총급여 4,000만원 · 잔액 2,000만원",
            steps: [
              "연 상환액 195만 4,000원, 연 이자 1.7%",
              "매년 이자를 붙이고 상환액을 뺀다",
            ],
            result: "약 12년 뒤 소진",
          },
        ]}
        pitfalls={[
          {
            heading: "'연봉 3천'이 아니라 '소득금액 1,898만원'입니다",
            body:
              "가장 흔한 오해입니다. 총급여 기준으로는 약 2,851만원이 문턱입니다. 원천징수영수증에서 '총급여'와 '근로소득금액'이 다른 칸이라는 점을 확인해 보세요.",
          },
          {
            heading: "전년도 소득으로 판정합니다",
            body:
              "올해 소득이 아니라 전년도에 확정된 소득으로 그해 의무상환액이 정해집니다. 작년에 많이 벌고 올해 실직했다면, 올해 상환 통지가 나올 수 있습니다.",
          },
          {
            heading: "소득이 없어도 이자는 쌓입니다",
            body:
              "상환이 멈추는 것이지 빚이 멈추는 것이 아닙니다. 의무상환액이 한 해 이자보다 적으면 잔액이 오히려 늘어납니다.",
          },
          {
            heading: "갚은 만큼 세액공제를 챙기세요",
            body:
              "원리금 상환액은 본인 교육비 세액공제 대상으로 한도 없이 전액이 들어갑니다. 연말정산 간소화에서 자동으로 잡히지 않을 수 있으니 재단 누리집에서 상환증명서를 내려받으세요.",
          },
          {
            heading: "해외 이주·장기 체류 시 신고 의무가 있습니다",
            body:
              "국외로 이주하거나 일정 기간 이상 체류하는 경우 신고하고 상환 계획을 정해야 합니다. 방치하면 가산금이 붙습니다.",
          },
        ]}
        sources={[
          { label: "한국장학재단", href: "https://www.kosaf.go.kr" },
          {
            label: "한국장학재단 고객센터 1599-2000",
            href: "https://www.kosaf.go.kr/ko/main.do",
          },
          { label: "국세청 홈택스", href: "https://www.hometax.go.kr" },
          { label: "교육비 세액공제 계산기", href: "/calc/deduction" },
        ]}
      />

      <section className="mt-10 rounded-2xl border border-border-soft bg-card p-5">
        <h2 className="mb-3 font-bold">함께 확인하세요</h2>
        <ul className="space-y-2 text-[15px]">
          <li>
            <Link
              href="/calc/deduction"
              className="text-accent underline-offset-4 hover:underline"
            >
              교육비 세액공제 계산기 →
            </Link>
          </li>
          <li>
            <Link
              href="/guide/icl-vs-general"
              className="text-accent underline-offset-4 hover:underline"
            >
              취업 후 상환과 일반상환, 무엇을 고를까 →
            </Link>
          </li>
          <li>
            <a
              href="https://salary.lifebanjang.com/calc/salary"
              className="text-accent underline-offset-4 hover:underline"
            >
              연봉 실수령액 계산기 (급여노트) →
            </a>
          </li>
        </ul>
      </section>
      <CalcGuides calcHref="/calc/icl" />
    </div>
  );
}
