import type { Metadata } from "next";
import CalcGuides from "@/components/CalcGuides";
import RelatedTools from "@/components/RelatedTools";
import Link from "next/link";
import DeductionCalculator from "@/components/DeductionCalculator";
import AdSlot from "@/components/AdSlot";
import CalcNotes from "@/components/CalcNotes";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "교육비 세액공제 계산기 — 학자금대출 갚은 만큼 돌려받기",
  description:
    "학자금대출 원리금 상환액은 한도 없이 전액이 본인 교육비 세액공제 대상입니다. 등록금·자녀 교육비까지 넣어 실제로 줄어드는 세금을 계산합니다. 2026년 기준.",
  alternates: { canonical: "/calc/deduction" },
};

const faq = [
  {
    q: "학자금대출을 갚으면 정말 세금을 돌려받나요?",
    a: "돌려받습니다. 원리금 상환액은 본인 교육비로 보아 한도 없이 전액이 공제 대상이고, 그 15%를 세액에서 뺍니다. 연 300만원을 갚았다면 45만원, 지방소득세까지 하면 약 49만 5,000원이 줄어듭니다.",
  },
  {
    q: "등록금을 낸 해에 공제받는 것 아닌가요?",
    a: "학자금대출로 낸 등록금은 아닙니다. 대출로 낸 돈은 아직 본인이 부담한 것이 아니므로, 실제로 갚은 해에 공제합니다. 재학 중에는 소득이 없어 공제받을 세금 자체가 없으니 제도가 그렇게 짜여 있습니다.",
  },
  {
    q: "국가장학금으로 낸 등록금도 넣나요?",
    a: "넣으면 안 됩니다. 공제는 내가 실제로 부담한 금액에만 적용됩니다. 등록금 700만원 중 600만원을 장학금으로 받았다면 100만원만 넣습니다. 700만원을 그대로 넣으면 나중에 가산세와 함께 추징됩니다.",
  },
  {
    q: "대학원 등록금도 공제되나요?",
    a: "본인이 다니는 대학원이라면 한도 없이 전액 공제됩니다. 다만 부양가족의 대학원 교육비는 공제 대상이 아닙니다. 자녀 교육비는 대학까지만 인정됩니다.",
  },
  {
    q: "결정세액이 0인데도 공제를 신청해야 하나요?",
    a: "세액공제는 낼 세금을 깎아 주는 것이라, 결정세액이 0이면 돌려받을 것이 없습니다. 남은 공제가 현금으로 나오거나 다음 해로 넘어가지도 않습니다. 사회초년생은 결정세액 자체가 적어 이런 경우가 흔합니다.",
  },
  {
    q: "간소화 자료에 안 나오는데요?",
    a: "학자금대출 상환액은 연말정산 간소화에서 자동으로 잡히지 않는 경우가 있습니다. 한국장학재단 누리집에서 상환증명서를 내려받아 회사에 제출하세요. 등록금 납입증명서도 학교에서 따로 받아야 할 수 있습니다.",
  },
];

export default function DeductionPage() {
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
          { "@type": "ListItem", position: 2, name: "교육비 세액공제 계산기" },
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
      <h1 className="mb-2 text-2xl font-extrabold">교육비 세액공제 계산기</h1>
      <p className="mb-6 text-muted">
        학자금대출 상환액·등록금·자녀 교육비로 실제 줄어드는 세금을 계산합니다. 2026년
        기준입니다.
      </p>

      <DeductionCalculator />

      <AdSlot slot="deduction-below-tool" />

      <section className="mt-10 space-y-4 text-[15px] leading-relaxed">
        <h2 className="text-xl font-bold">
          가장 많이 놓치는 것 — 학자금대출은 갚을 때 공제받습니다
        </h2>
        <p>
          교육비 세액공제라고 하면 등록금을 떠올리지만, 사회초년생에게 가장 큰 항목은{" "}
          <strong>학자금대출 원리금 상환액</strong>인 경우가 많습니다. 한도 없이 전액이
          본인 교육비로 들어가고, 그 15%가 세액에서 빠집니다.
        </p>
        <p>
          중요한 것은 <strong>시점</strong>입니다. 등록금을 낸 해가 아니라{" "}
          <strong>원리금을 상환한 해</strong>에 공제합니다. 재학 중에는 소득이 없어
          공제받을 세금 자체가 없으니, 제도가 그렇게 설계돼 있습니다.
        </p>
        <p>
          취업하고 나서 이 사실을 모른 채 몇 년을 그냥 보내는 경우가 흔합니다. 이미
          지난 해의 것은 <strong>경정청구</strong>로 5년 안에 되돌려 받을 수 있으니,
          놓쳤다면 확인해 보세요.
        </p>

        <h2 className="mt-8 text-xl font-bold">한도는 대상마다 다릅니다</h2>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full min-w-[440px] border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-border-soft text-left">
                <th className="py-2 pr-3 font-bold">대상</th>
                <th className="py-2 pr-3 font-bold">연 한도</th>
                <th className="py-2 font-bold">비고</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-soft">
                <td className="py-2 pr-3">본인 (대학·대학원)</td>
                <td className="py-2 pr-3 font-bold">한도 없음</td>
                <td className="py-2">학자금대출 상환액 포함</td>
              </tr>
              <tr className="border-b border-border-soft">
                <td className="py-2 pr-3">대학생 자녀</td>
                <td className="py-2 pr-3">1명당 900만원</td>
                <td className="py-2">대학원은 대상 아님</td>
              </tr>
              <tr className="border-b border-border-soft">
                <td className="py-2 pr-3">취학 전·초·중·고</td>
                <td className="py-2 pr-3">1명당 300만원</td>
                <td className="py-2">급식비·방과후 수강료 포함</td>
              </tr>
              <tr className="border-b border-border-soft">
                <td className="py-2 pr-3">교복 구입비 (중·고)</td>
                <td className="py-2 pr-3">1명당 50만원</td>
                <td className="py-2">300만원 한도 안에서</td>
              </tr>
              <tr className="border-b border-border-soft">
                <td className="py-2 pr-3">현장체험학습비</td>
                <td className="py-2 pr-3">1명당 30만원</td>
                <td className="py-2">300만원 한도 안에서</td>
              </tr>
              <tr>
                <td className="py-2 pr-3">장애인 특수교육비</td>
                <td className="py-2 pr-3 font-bold">한도 없음</td>
                <td className="py-2">나이·소득 제한 없음</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          한도는 <strong>사람마다 따로</strong> 적용됩니다. 초등학생 자녀가 둘이면
          300만원이 아니라 각각 300만원씩 600만원까지입니다.
        </p>

        <h2 className="mt-8 text-xl font-bold">
          내가 부담한 금액만 넣어야 합니다
        </h2>
        <p>
          가장 자주 걸리는 실수입니다. 세액공제는{" "}
          <strong>내 돈이 실제로 나간 금액</strong>에만 적용됩니다. 아래는 공제 대상이
          아닙니다.
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>국가장학금·교내장학금으로 충당한 등록금</li>
          <li>회사가 대신 내 준 학비 (사내 학자금 지원)</li>
          <li>학자금대출로 낸 등록금 — 대신 <strong>갚을 때</strong> 넣습니다</li>
          <li>어린이집·학원비 중 교육비 항목이 아닌 것 (차량비·간식비 등)</li>
        </ul>
        <p>
          등록금 700만원 중 600만원을 국가장학금으로 받았다면{" "}
          <strong>100만원만</strong> 넣습니다. 700만원을 그대로 넣으면 나중에 가산세와
          함께 추징됩니다.
        </p>

        <h2 className="mt-8 text-xl font-bold">
          결정세액이 없으면 공제도 소용이 없습니다
        </h2>
        <p>
          세액공제는 <strong>이미 낼 세금이 있어야</strong> 깎아 주는 것입니다.
          결정세액이 50만원인데 공제액이 150만원이면 50만원까지만 줄어들고, 남는
          100만원은 사라집니다. 현금으로 나오지도, 다음 해로 넘어가지도 않습니다.
        </p>
        <p>
          연봉이 낮은 사회초년생은 결정세액 자체가 적어 이런 일이 자주 생깁니다. 이런
          경우 배우자나 부모가 부담한 교육비라면 <strong>소득이 더 높은 쪽</strong>이
          공제받는 편이 유리합니다. 다만 학자금대출 상환액은 본인 교육비라 다른 사람이
          대신 공제받을 수 없습니다.
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
            law: "소득세법 제59조의4 제3항 (교육비 세액공제)",
            detail:
              "근로소득이 있는 거주자가 본인과 기본공제대상자를 위해 지급한 교육비의 15%를 종합소득산출세액에서 공제합니다.",
          },
          {
            law: "본인 교육비 — 한도 없음",
            detail:
              "대학·대학원 등록금과 학자금대출 원리금 상환액이 모두 포함되며 한도가 없습니다. 학자금대출은 등록금을 납입한 해가 아니라 원리금을 상환한 해에 공제합니다.",
          },
          {
            law: "부양가족 교육비 한도",
            detail:
              "대학생 1명당 연 900만원, 취학 전 아동과 초·중·고 1명당 연 300만원. 부양가족의 대학원 교육비는 공제 대상이 아닙니다.",
          },
          {
            law: "항목별 한도",
            detail:
              "중·고생 교복 구입비는 1명당 연 50만원, 현장체험학습비는 1명당 연 30만원까지 300만원 한도 안에 넣을 수 있습니다.",
          },
          {
            law: "공제 제외 — 장학금 등으로 충당한 금액",
            detail:
              "국가장학금·교내장학금·사내 학자금 등으로 지급받아 충당한 금액은 본인이 부담한 교육비가 아니므로 공제 대상에서 제외됩니다.",
          },
        ]}
        note="이 계산기는 교육비 항목만 다루므로 실제 연말정산 결과와 다릅니다. 다른 공제까지 반영한 환급액 추정은 세금노트의 연말정산 계산기를 이용하세요. 세무 자문이 아니며, 확정 금액은 국세청 홈택스에서 확인하세요. 놓친 공제는 5년 안에 경정청구로 되돌려 받을 수 있습니다."
        examples={[
          {
            title: "학자금대출 300만원을 갚은 직장인",
            steps: [
              "공제 대상액 = 300만원 (한도 없음)",
              "300만원 × 15% = 45만원",
              "지방소득세 10%까지 하면 49만 5,000원",
            ],
            result: "세금 45만원 감소 (체감 약 49만 5,000원)",
          },
          {
            title: "대학생 자녀 등록금 1,000만원",
            steps: [
              "한도 900만원까지만 인정 → 100만원이 잘립니다",
              "900만원 × 15% = 135만원",
            ],
            result: "세금 135만원 감소",
          },
          {
            title: "학자금대출 1,000만원 상환 · 결정세액 50만원",
            steps: [
              "1,000만원 × 15% = 150만원",
              "결정세액 50만원이 천장",
            ],
            result: "50만원만 감소 · 100만원은 사라집니다",
          },
          {
            title: "중학생 자녀 · 수업료 100만 · 교복 80만 · 체험학습 50만",
            steps: [
              "교복은 50만원까지 → 30만원 제외",
              "체험학습은 30만원까지 → 20만원 제외",
              "공제 대상 = 100만 + 50만 + 30만 = 180만원",
            ],
            result: "180만원 × 15% = 27만원",
          },
        ]}
        pitfalls={[
          {
            heading: "장학금으로 낸 등록금을 넣으면 추징됩니다",
            body:
              "국가장학금으로 충당한 금액은 본인이 부담한 것이 아닙니다. 등록금 전액을 그대로 넣는 실수가 흔한데, 나중에 가산세와 함께 추징됩니다.",
          },
          {
            heading: "간소화 자료를 그대로 믿지 마세요",
            body:
              "학자금대출 상환액은 자동으로 잡히지 않는 경우가 있고, 반대로 장학금이 차감되지 않은 등록금이 그대로 올라와 있는 경우도 있습니다. 재단 상환증명서와 학교 납입증명서로 확인하세요.",
          },
          {
            heading: "자녀의 대학원 학비는 공제되지 않습니다",
            body:
              "부양가족 교육비는 대학까지입니다. 대학원 교육비가 한도 없이 공제되는 것은 본인 것뿐입니다.",
          },
          {
            heading: "결정세액이 0이면 아무 소용이 없습니다",
            body:
              "세액공제는 낼 세금을 깎는 것입니다. 남는 공제는 현금으로 나오지 않고 이월되지도 않습니다. 부부라면 소득이 높은 쪽으로 자녀 교육비를 몰아 주는 편이 유리합니다.",
          },
          {
            heading: "놓쳤다면 경정청구가 있습니다",
            body:
              "지난 5년 안의 것이라면 경정청구로 되돌려 받을 수 있습니다. 취업 첫해에 학자금대출 상환액을 몰라 놓쳤다면 지금이라도 확인해 보세요.",
          },
        ]}
        sources={[
          { label: "국세청 홈택스", href: "https://www.hometax.go.kr" },
          { label: "국세상담센터 126", href: "https://call.nts.go.kr" },
          { label: "한국장학재단", href: "https://www.kosaf.go.kr" },
          { label: "학자금대출 상환액 계산기", href: "/calc/icl" },
        ]}
      />

      <section className="mt-10 rounded-2xl border border-border-soft bg-card p-5">
        <h2 className="mb-3 font-bold">함께 확인하세요</h2>
        <ul className="space-y-2 text-[15px]">
          <li>
            <Link
              href="/calc/icl"
              className="text-accent underline-offset-4 hover:underline"
            >
              학자금대출 상환액 계산기 →
            </Link>
          </li>
          <li>
            <Link
              href="/guide/education-tax-credit"
              className="text-accent underline-offset-4 hover:underline"
            >
              학자금대출 갚은 돈, 연말정산에 넣는 법 →
            </Link>
          </li>
          <li>
            <a
              href="https://tax.lifebanjang.com/calc/year-end"
              className="text-accent underline-offset-4 hover:underline"
            >
              연말정산 환급액 계산기 (세금노트) →
            </a>
          </li>
        </ul>
      </section>
      <CalcGuides calcHref="/calc/deduction" />
      <RelatedTools calc="/calc/deduction" />
    </div>
  );
}
