import type { Metadata } from "next";
import CalcGuides from "@/components/CalcGuides";
import Link from "next/link";
import BracketCalculator from "@/components/BracketCalculator";
import AdSlot from "@/components/AdSlot";
import CalcNotes from "@/components/CalcNotes";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "학자금 지원구간 계산기 — 우리 집은 몇 구간인가",
  description:
    "국가장학금·근로장학금이 전부 이 구간 하나로 갈립니다. 2026년 기준 중위소득과 재산의 소득환산 산식으로 소득인정액과 예상 구간을 계산하고, 경계까지 얼마나 남았는지 보여줍니다.",
  alternates: { canonical: "/calc/bracket" },
};

const faq = [
  {
    q: "부모님 연봉이 얼마면 몇 구간인가요?",
    a: "연봉만으로는 정해지지 않습니다. 구간은 소득에 재산을 소득으로 환산한 값을 더한 '소득인정액'으로 정해집니다. 그래서 소득이 같아도 집이 있으면 구간이 올라갑니다. 4인 가구 월 소득 300만원이면 재산이 없을 때 2구간이지만, 일반재산 2억원이 있으면 4구간이 됩니다.",
  },
  {
    q: "재산이 얼마까지는 괜찮나요?",
    a: "기본재산액 6,900만원까지는 환산액이 0이라 구간에 영향을 주지 않습니다. 이 금액은 기초생활보장과 달리 지역별 차등 없이 전국이 같습니다. 6,900만원을 넘는 부분만 월 소득환산율을 곱해 소득으로 잡습니다.",
  },
  {
    q: "전세보증금도 재산에 들어가나요?",
    a: "들어갑니다. 전월세보증금은 일반재산으로 잡힙니다. 다만 그 보증금을 위해 받은 대출은 부채로 차감되므로, 대출을 끼고 전세를 살고 있다면 순액만 남습니다.",
  },
  {
    q: "금융재산이 왜 더 불리한가요?",
    a: "월 소득환산율이 다르기 때문입니다. 일반재산과 자동차는 연 4.17%를 3으로 나눈 월 1.39%인데, 금융재산은 연 6.26%를 3으로 나눈 월 약 2.09%입니다. 같은 1억원이라도 예금으로 있으면 부동산으로 있을 때보다 소득인정액이 약 70만원 더 잡힙니다.",
  },
  {
    q: "형제·자매가 많으면 유리한가요?",
    a: "본인을 포함해 3명 이상인 미혼 학생이면 (인원 − 2) × 40만원이 소득인정액에서 빠집니다. 3남매면 40만원, 4남매면 80만원입니다. 기혼이면 이 공제를 받지 못합니다.",
  },
  {
    q: "구간이 실제와 다르게 나옵니다",
    a: "재단은 소득·재산을 공적 자료로 직접 조회하고, 소득평가액에도 항목별 공제가 더 붙습니다. 재산도 시세가 아니라 공시가격·기준시가로 평가합니다. 이 계산기는 공개된 산식으로 낸 추정치이므로 실제 구간은 한국장학재단 통지로 확인해야 합니다.",
  },
];

export default function BracketPage() {
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
          { "@type": "ListItem", position: 2, name: "학자금 지원구간 계산기" },
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
      <h1 className="mb-2 text-2xl font-extrabold">학자금 지원구간 계산기</h1>
      <p className="mb-6 text-muted">
        국가장학금·근로장학금·주거안정장학금이 전부 이 구간 하나로 갈립니다. 2026년
        기준으로 계산합니다.
      </p>

      <BracketCalculator />

      <AdSlot slot="bracket-below-tool" />

      <section className="mt-10 space-y-4 text-[15px] leading-relaxed">
        <h2 className="text-xl font-bold">구간은 연봉으로 정해지지 않습니다</h2>
        <p>
          가장 흔한 오해입니다. &ldquo;부모님 연봉이 5천만원인데 몇 구간이냐&rdquo;는
          질문에는 답할 수 없습니다. 구간을 정하는 것은 연봉이 아니라{" "}
          <strong>소득인정액</strong>이기 때문입니다.
        </p>
        <p className="rounded-xl border border-border-soft bg-card p-4 font-mono text-sm">
          소득인정액(월) = 소득평가액(월) + 재산의 소득환산액(월) − 형제·자매 공제
        </p>
        <p>
          여기서 <strong>재산의 소득환산액</strong>이 핵심입니다. 집이나 예금이 실제로
          현금을 만들어 주지 않아도, 제도는 그것을 &lsquo;매달 이만큼의 소득에
          해당한다&rsquo;고 보고 소득에 더합니다. 그래서 은퇴한 부모님이 소득은 거의
          없는데 집 한 채가 있어 구간이 높게 나오는 일이 자주 생깁니다.
        </p>

        <h2 className="mt-8 text-xl font-bold">재산은 이렇게 소득으로 바뀝니다</h2>
        <p className="rounded-xl border border-border-soft bg-card p-4 font-mono text-sm">
          재산의 소득환산액 = (재산 − 기본재산액 6,900만원 − 부채) × 월 소득환산율
        </p>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-border-soft text-left">
                <th className="py-2 pr-3 font-bold">재산 종류</th>
                <th className="py-2 pr-3 font-bold">월 소득환산율</th>
                <th className="py-2 font-bold">1억원당 월 환산액</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-soft">
                <td className="py-2 pr-3">일반재산 (주택·토지·전월세보증금)</td>
                <td className="py-2 pr-3">4.17% ÷ 3 = 1.39%</td>
                <td className="py-2">139만원</td>
              </tr>
              <tr className="border-b border-border-soft">
                <td className="py-2 pr-3">금융재산 (예금·적금·주식)</td>
                <td className="py-2 pr-3">6.26% ÷ 3 ≈ 2.09%</td>
                <td className="py-2">약 209만원</td>
              </tr>
              <tr>
                <td className="py-2 pr-3">자동차</td>
                <td className="py-2 pr-3">4.17% ÷ 3 = 1.39%</td>
                <td className="py-2">139만원</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          여기서 세 가지를 기억하면 됩니다.
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>기본재산액 6,900만원은 전국이 같습니다.</strong> 기초생활보장은
            대도시·중소도시·농어촌으로 나뉘지만 학자금은 그렇지 않습니다
          </li>
          <li>
            <strong>금융재산이 가장 불리합니다.</strong> 환산율이 1.5배라 같은
            금액이라도 예금으로 들고 있으면 구간이 더 올라갑니다
          </li>
          <li>
            <strong>자동차는 기본재산액 공제를 받지 못합니다.</strong> 차 값 전체에
            바로 환산율이 붙습니다
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-bold">2026년 구간 경계</h2>
        <p>
          소득인정액이 가구 규모별 기준 중위소득의 몇 %인지로 구간이 정해집니다. 아래는
          4인 가구(기준 중위소득 6,494,738원) 기준입니다.
        </p>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-border-soft text-left">
                <th className="py-2 pr-3 font-bold">구간</th>
                <th className="py-2 pr-3 font-bold">중위소득 대비</th>
                <th className="py-2 font-bold">4인 가구 소득인정액 상한</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-soft"><td className="py-2 pr-3">1구간</td><td className="py-2 pr-3">30%</td><td className="py-2">약 194만원</td></tr>
              <tr className="border-b border-border-soft"><td className="py-2 pr-3">2구간</td><td className="py-2 pr-3">50%</td><td className="py-2">약 325만원</td></tr>
              <tr className="border-b border-border-soft"><td className="py-2 pr-3">3구간</td><td className="py-2 pr-3">70%</td><td className="py-2">약 455만원</td></tr>
              <tr className="border-b border-border-soft"><td className="py-2 pr-3">4구간</td><td className="py-2 pr-3">90%</td><td className="py-2">약 585만원</td></tr>
              <tr className="border-b border-border-soft"><td className="py-2 pr-3">5구간</td><td className="py-2 pr-3">100%</td><td className="py-2">약 649만원</td></tr>
              <tr className="border-b border-border-soft"><td className="py-2 pr-3">6구간</td><td className="py-2 pr-3">130%</td><td className="py-2">약 844만원</td></tr>
              <tr className="border-b border-border-soft"><td className="py-2 pr-3">7구간</td><td className="py-2 pr-3">150%</td><td className="py-2">약 974만원</td></tr>
              <tr className="border-b border-border-soft"><td className="py-2 pr-3">8구간</td><td className="py-2 pr-3">200%</td><td className="py-2">약 1,299만원</td></tr>
              <tr className="border-b border-border-soft"><td className="py-2 pr-3">9구간</td><td className="py-2 pr-3">300%</td><td className="py-2">약 1,948만원</td></tr>
              <tr><td className="py-2 pr-3">10구간</td><td className="py-2 pr-3">300% 초과</td><td className="py-2">국가장학금 대상 아님</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="mt-8 text-xl font-bold">경계 하나로 100만원이 갈립니다</h2>
        <p>
          구간은 연속적인 감액이 아니라 <strong>계단</strong>입니다. 3구간과 4구간
          사이에서 연 지원액이 600만원에서 440만원으로 <strong>160만원</strong>{" "}
          떨어지고, 8구간과 9구간 사이에서는 360만원에서 100만원으로{" "}
          <strong>260만원</strong>이 떨어집니다.
        </p>
        <p>
          소득인정액이 1원 차이여도 결과가 이만큼 갈리므로, 경계 근처라면 재산 자료가
          제대로 반영됐는지 확인해 볼 가치가 있습니다. 특히 부채가 누락되면 구간이
          통째로 올라갑니다.
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
            law: "보건복지부 고시 제2025-135호 (2026년 기준 중위소득)",
            detail:
              "1인 2,564,238원 · 2인 4,199,292원 · 3인 5,359,036원 · 4인 6,494,738원 · 5인 7,556,719원 · 6인 8,555,952원. 4인 기준 전년 대비 6.51% 인상으로 역대 최대 폭이었습니다.",
          },
          {
            law: "한국장학재단 「학자금 지원구간 산정 기준」",
            detail:
              "소득인정액 = 소득평가액 + 재산의 소득환산액 − 형제·자매 수에 따른 공제액. 재산의 소득환산액 = (재산 − 기본재산액 − 부채) × 월 소득환산율.",
          },
          {
            law: "월 소득환산율",
            detail:
              "일반재산 4.17%/3, 금융재산 6.26%/3, 자동차 4.17%/3. 기초생활보장(월 4.17%)의 3분의 1 수준이라 재산이 구간에 미치는 영향이 그만큼 완만합니다.",
          },
          {
            law: "기본재산액 공제 6,900만원",
            detail:
              "기초생활보장과 달리 지역별 차등 없이 전국이 같습니다. 부채는 일반재산에서 먼저 차감하고, 남은 금액은 금융재산에서 차감합니다.",
          },
          {
            law: "형제·자매 공제",
            detail:
              "본인을 포함한 형제·자매가 3명 이상인 미혼 학생에게 (인원 − 2) × 40만원을 소득인정액에서 공제합니다.",
          },
        ]}
        note="이 계산기는 공개된 산식으로 낸 추정치입니다. 재단은 소득·재산 자료를 공적 자료로 직접 조회하며, 소득평가액에는 항목별 공제가 더 붙고 재산은 공시가격·기준시가로 평가됩니다. 기준 중위소득은 매년 8월에 고시되어 이듬해 1월부터 적용됩니다. 실제 구간은 한국장학재단(1599-2000) 통지로 확인하세요."
        examples={[
          {
            title: "4인 가구 · 월 소득 300만원 · 재산 없음",
            steps: [
              "소득인정액 = 300만원",
              "4인 가구 기준 중위소득 6,494,738원의 46.2%",
              "50% 이하이므로 2구간",
            ],
            result: "2구간 — 국가장학금 I유형 연 600만원 단가",
          },
          {
            title: "같은 소득인데 일반재산 2억원이 있는 경우",
            steps: [
              "(2억원 − 6,900만원) × 1.39% = 1,820,900원",
              "소득인정액 = 300만원 + 182만원 = 4,820,900원",
              "중위소득의 74.2% → 90% 이하이므로 4구간",
            ],
            result: "4구간 — 같은 소득인데 연 지원액이 160만원 줄어듭니다",
          },
          {
            title: "재산 1억원을 예금으로 들고 있는 경우",
            steps: [
              "(1억 6,900만원 − 6,900만원) × 2.09% ≈ 2,086,667원",
              "같은 금액이 일반재산이면 1,390,000원",
              "차이 약 70만원이 매달 소득인정액에 더해집니다",
            ],
            result: "금융재산은 환산율이 1.5배라 구간이 더 올라갑니다",
          },
        ]}
        pitfalls={[
          {
            heading: "부채를 빠뜨리면 구간이 통째로 올라갑니다",
            body:
              "주택담보대출·전세자금대출은 재산에서 차감됩니다. 재단이 공적 자료로 조회하지만 누락될 수 있으니, 구간이 예상보다 높게 나왔다면 부채가 반영됐는지부터 확인하세요.",
          },
          {
            heading: "가구원은 '본인과 부모'입니다",
            body:
              "미혼 학생은 본인과 부모가 가구원입니다. 형제·자매는 가구원 수에 넣지 않고 별도의 공제로 반영됩니다. 기혼이면 본인과 배우자가 가구가 됩니다.",
          },
          {
            heading: "자동차는 공제가 없습니다",
            body:
              "기본재산액 6,900만원은 일반재산과 금융재산에서만 차감됩니다. 자동차는 가액 전체에 바로 환산율이 붙으므로, 차가 있으면 그만큼 소득인정액이 늘어납니다.",
          },
          {
            heading: "매 학기 다시 신청해야 합니다",
            body:
              "구간은 한 번 정해지면 그 학기에만 적용됩니다. 다음 학기에는 다시 신청하고 다시 산정받아야 합니다. 소득이나 재산이 바뀌면 구간도 바뀝니다.",
          },
        ]}
        sources={[
          { label: "한국장학재단", href: "https://www.kosaf.go.kr" },
          {
            label: "한국장학재단 고객센터 1599-2000",
            href: "https://www.kosaf.go.kr/ko/main.do",
          },
          { label: "보건복지부", href: "https://www.mohw.go.kr" },
          { label: "국가장학금 지원액 계산기", href: "/calc/scholarship" },
        ]}
      />

      <section className="mt-10 rounded-2xl border border-border-soft bg-card p-5">
        <h2 className="mb-3 font-bold">함께 확인하세요</h2>
        <ul className="space-y-2 text-[15px]">
          <li>
            <Link
              href="/calc/scholarship"
              className="text-accent underline-offset-4 hover:underline"
            >
              국가장학금 지원액 계산기 →
            </Link>
          </li>
          <li>
            <Link
              href="/guide/bracket-explained"
              className="text-accent underline-offset-4 hover:underline"
            >
              지원구간은 왜 연봉으로 안 정해지나 →
            </Link>
          </li>
          <li>
            <Link
              href="/guide/property-conversion"
              className="text-accent underline-offset-4 hover:underline"
            >
              집 한 채가 구간을 두 단계 올리는 이유 →
            </Link>
          </li>
        </ul>
      </section>
      <CalcGuides calcHref="/calc/bracket" />
    </div>
  );
}
