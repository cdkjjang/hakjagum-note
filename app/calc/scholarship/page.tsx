import type { Metadata } from "next";
import CalcGuides from "@/components/CalcGuides";
import Link from "next/link";
import ScholarshipCalculator from "@/components/ScholarshipCalculator";
import AdSlot from "@/components/AdSlot";
import CalcNotes from "@/components/CalcNotes";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "국가장학금 계산기 — 구간별 지원액과 실제로 받는 금액",
  description:
    "2026년 국가장학금 I유형 지원단가(1~3구간 600만·4~6구간 440만·7~8구간 360만·9구간 100만)로 예상 지원액을 계산합니다. 지원금은 등록금을 넘지 못한다는 점을 함께 보여줍니다.",
  alternates: { canonical: "/calc/scholarship" },
};

const faq = [
  {
    q: "1구간이면 무조건 600만원을 받나요?",
    a: "아닙니다. 국가장학금은 등록금을 대신 내주는 제도라 등록금보다 많이 받을 수 없습니다. 연간 등록금이 400만원인 국립대 1구간 학생은 600만원이 아니라 400만원을 받습니다. 남는 200만원이 현금으로 나오지는 않습니다.",
  },
  {
    q: "9구간도 받을 수 있나요?",
    a: "2026년부터 받습니다. 원래 8구간까지였는데 9구간이 새로 생겨 연 100만원(학기당 50만원)을 지원합니다. 금액은 크지 않지만 이전에는 한 푼도 없던 구간이라 새로 대상이 된 학생이 많습니다.",
  },
  {
    q: "성적이 나쁘면 못 받나요?",
    a: "직전 학기에 12학점 이상을 이수하고 100점 만점 환산 80점(B학점) 이상이어야 합니다. 다만 기초생활수급자·차상위계층과 1~3구간 학생은 70점(C학점)까지 경고제로 구제되며, 이 경고는 재학 중 두 번까지 쓸 수 있습니다. 신입생·편입생·재입학생은 첫 학기에 한해 성적을 보지 않습니다.",
  },
  {
    q: "학점은 채웠는데 성적이 모자라면요?",
    a: "둘 다 충족해야 합니다. 12학점을 채워도 성적이 기준에 못 미치면 받지 못하고, 성적이 아무리 좋아도 이수 학점이 12학점에 못 미치면 받지 못합니다. 계절학기 학점은 원칙적으로 포함되지 않으니 주의하세요.",
  },
  {
    q: "다자녀는 얼마나 더 받나요?",
    a: "셋 이상 자녀 가구의 첫째·둘째는 1~3구간 610만원, 4~6구간 505만원, 7~8구간 465만원, 9구간 135만원입니다. 셋째 이상은 8구간까지 등록금 전액, 9구간은 200만원입니다. 셋째 이상은 사실상 등록금 걱정이 없는 셈입니다.",
  },
  {
    q: "II유형은 뭔가요?",
    a: "I유형이 학생에게 직접 지원하는 것이라면, II유형은 대학에 예산을 주고 대학이 자체 기준으로 배분하는 방식입니다. 대학마다 기준과 금액이 달라 일률적으로 계산할 수 없습니다. I유형을 받고도 등록금이 남으면 II유형이나 교내장학금으로 일부가 더 채워질 수 있습니다.",
  },
];

export default function ScholarshipPage() {
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
          { "@type": "ListItem", position: 2, name: "국가장학금 계산기" },
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
      <h1 className="mb-2 text-2xl font-extrabold">국가장학금 계산기</h1>
      <p className="mb-6 text-muted">
        구간별 지원단가와 등록금을 함께 넣어, 실제로 받는 금액과 남는 금액을
        계산합니다. 2026년 기준입니다.
      </p>

      <ScholarshipCalculator />

      <AdSlot slot="scholarship-below-tool" />

      <section className="mt-10 space-y-4 text-[15px] leading-relaxed">
        <h2 className="text-xl font-bold">
          가장 많이 오해하는 것 — 지원금은 등록금을 넘지 못합니다
        </h2>
        <p>
          &ldquo;1구간이면 600만원&rdquo;이라는 말이 널리 퍼져 있습니다. 정확히는{" "}
          <strong>지원단가가 600만원</strong>이라는 뜻이고, 실제로 받는 금액은{" "}
          <strong>등록금과 단가 중 작은 쪽</strong>입니다.
        </p>
        <p>
          국가장학금은 현금을 주는 제도가 아니라 등록금을 대신 내주는 제도이기
          때문입니다. 같은 1구간이어도 어느 학교에 다니느냐에 따라 결과가 정반대가
          됩니다.
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            연 등록금 <strong>400만원</strong>인 국립대 1구간 → 400만원을 받고{" "}
            <strong>자기 부담 0원</strong>. 남는 200만원은 사라집니다
          </li>
          <li>
            연 등록금 <strong>900만원</strong>인 사립대 1구간 → 600만원을 받고{" "}
            <strong>300만원을 스스로</strong> 내야 합니다
          </li>
        </ul>
        <p>
          그래서 &ldquo;국가장학금을 받으면 등록금이 해결된다&rdquo;는 말은 학교에 따라
          맞기도 하고 틀리기도 합니다.
        </p>

        <h2 className="mt-8 text-xl font-bold">2026년 I유형 지원단가</h2>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-border-soft text-left">
                <th className="py-2 pr-3 font-bold">구간</th>
                <th className="py-2 pr-3 font-bold">일반</th>
                <th className="py-2 pr-3 font-bold">다자녀 첫째·둘째</th>
                <th className="py-2 font-bold">다자녀 셋째 이상</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-soft">
                <td className="py-2 pr-3">기초·차상위</td>
                <td className="py-2 pr-3">등록금 전액</td>
                <td className="py-2 pr-3">등록금 전액</td>
                <td className="py-2">등록금 전액</td>
              </tr>
              <tr className="border-b border-border-soft">
                <td className="py-2 pr-3">1~3구간</td>
                <td className="py-2 pr-3">600만원</td>
                <td className="py-2 pr-3">610만원</td>
                <td className="py-2">등록금 전액</td>
              </tr>
              <tr className="border-b border-border-soft">
                <td className="py-2 pr-3">4~6구간</td>
                <td className="py-2 pr-3">440만원</td>
                <td className="py-2 pr-3">505만원</td>
                <td className="py-2">등록금 전액</td>
              </tr>
              <tr className="border-b border-border-soft">
                <td className="py-2 pr-3">7~8구간</td>
                <td className="py-2 pr-3">360만원</td>
                <td className="py-2 pr-3">465만원</td>
                <td className="py-2">등록금 전액</td>
              </tr>
              <tr>
                <td className="py-2 pr-3">9구간 (2026년 신설)</td>
                <td className="py-2 pr-3">100만원</td>
                <td className="py-2 pr-3">135만원</td>
                <td className="py-2">200만원</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3">모두 연간 금액이며, 학기당으로는 절반씩 나눠 지급됩니다.</p>

        <h2 className="mt-8 text-xl font-bold">
          8구간과 9구간 사이가 가장 큰 절벽입니다
        </h2>
        <p>
          구간이 한 단계 올라갈 때 지원액이 얼마나 떨어지는지 보면 계단의 높이가
          고르지 않습니다.
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>3구간 → 4구간: 600만 → 440만원 (<strong>160만원</strong> 감소)</li>
          <li>6구간 → 7구간: 440만 → 360만원 (80만원 감소)</li>
          <li>
            8구간 → 9구간: 360만 → 100만원 (<strong>260만원</strong> 감소)
          </li>
          <li>9구간 → 10구간: 100만 → 0원</li>
        </ul>
        <p>
          8구간 경계(4인 가구 소득인정액 약 1,299만원)에 가까이 있다면 재산 자료가
          제대로 반영됐는지 확인해 볼 가치가 큽니다.
        </p>

        <h2 className="mt-8 text-xl font-bold">성적 요건은 두 가지를 다 봅니다</h2>
        <p>
          <strong>직전 학기 12학점 이상 이수</strong>와{" "}
          <strong>100점 만점 환산 80점 이상</strong>을 모두 충족해야 합니다. 하나만
          충족해서는 안 됩니다.
        </p>
        <p>
          기초생활수급자·차상위계층과 1~3구간 학생은 70점까지 &lsquo;C학점
          경고제&rsquo;로 구제됩니다. 다만 이 경고는 <strong>재학 중 두 번</strong>
          까지만 쓸 수 있으니, 계속 기대기는 어렵습니다.
        </p>
        <p>
          신입생·편입생·재입학생은 첫 학기에 한해 성적을 보지 않습니다. 장애인
          학생은 성적 요건이 적용되지 않습니다.
        </p>

        <h2 className="mt-8 text-xl font-bold">신청 기한을 놓치면 그 학기는 끝입니다</h2>
        <p>
          국가장학금은 <strong>매 학기 새로 신청</strong>합니다. 1학기는 전년 11~12월,
          2학기는 5~6월에 1차 신청이 열리고, 이후 2차 신청 기간이 한 번 더 있습니다.
        </p>
        <p>
          기한을 넘기면 소득이 아무리 낮아도 그 학기는 받지 못합니다. 특히{" "}
          <strong>재학생은 1차 기간에 신청해야</strong> 하며, 2차는 신입생·편입생·
          복학생 위주입니다. 재학생이 1차를 놓치면 구제 신청이 필요합니다.
        </p>
        <p>
          신청 후에 <strong>가구원 정보제공 동의</strong>와{" "}
          <strong>서류 제출</strong>까지 마쳐야 심사가 시작됩니다. 신청만 하고 동의를
          빠뜨려 탈락하는 경우가 많습니다.
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
            law: "「한국장학재단 설립 등에 관한 법률」 제18조 (학자금 지원)",
            detail:
              "국가는 경제적 여건에 관계없이 고등교육 기회를 갖도록 학자금을 지원합니다. 국가장학금 I유형(학생직접지원형)이 그 대표적인 사업입니다.",
          },
          {
            law: "2026년 국가장학금 I유형 지원단가 (연간)",
            detail:
              "기초·차상위 등록금 전액, 1~3구간 600만원, 4~6구간 440만원, 7~8구간 360만원, 9구간 100만원. 9구간은 2026년에 신설되었습니다.",
          },
          {
            law: "다자녀 국가장학금 지원단가 (연간)",
            detail:
              "셋 이상 자녀 가구의 첫째·둘째는 1~3구간 610만원, 4~6구간 505만원, 7~8구간 465만원, 9구간 135만원. 셋째 이상은 1~8구간 등록금 전액, 9구간 200만원입니다.",
          },
          {
            law: "성적 요건",
            detail:
              "직전 학기 12학점 이상 이수 + 100점 만점 환산 80점 이상. 기초·차상위와 1~3구간은 70점까지 C학점 경고제로 구제되며 재학 중 2회까지 가능합니다. 신입생·편입생·재입학생은 첫 학기에 한해 성적을 보지 않습니다.",
          },
          {
            law: "지원 한도 — 등록금 범위 내",
            detail:
              "국가장학금은 해당 학기 등록금(입학금 및 수업료) 범위 안에서 지급됩니다. 지원단가가 등록금보다 커도 차액이 현금으로 지급되지는 않습니다.",
          },
        ]}
        note="지원단가는 교육부 예산으로 정해지며 해마다 바뀔 수 있습니다. 실제 지원 여부는 소득·재산 심사와 학적·성적 확인을 거쳐 한국장학재단이 결정합니다. 이 계산기는 공개된 기준으로 낸 추정치이며, 대학별 II유형·교내장학금은 반영하지 않았습니다."
        examples={[
          {
            title: "1구간 · 연 등록금 400만원 (국립대)",
            steps: [
              "1구간 지원단가 600만원",
              "등록금 400만원이 천장이 됩니다",
              "600만원 − 400만원 = 200만원이 잘립니다",
            ],
            result: "연 400만원 지원 · 자기 부담 0원",
          },
          {
            title: "1구간 · 연 등록금 900만원 (사립대)",
            steps: [
              "1구간 지원단가 600만원",
              "등록금이 단가보다 크므로 단가 전액 지원",
              "900만원 − 600만원 = 300만원이 남습니다",
            ],
            result: "연 600만원 지원 · 자기 부담 300만원",
          },
          {
            title: "9구간 · 연 등록금 800만원",
            steps: [
              "9구간 지원단가 100만원 (2026년 신설)",
              "800만원 − 100만원 = 700만원",
            ],
            result: "연 100만원 지원 · 자기 부담 700만원",
          },
          {
            title: "다자녀 셋째 · 8구간 · 연 등록금 800만원",
            steps: [
              "다자녀 셋째 이상은 1~8구간 등록금 전액",
              "구간과 무관하게 등록금 전부를 지원받습니다",
            ],
            result: "연 800만원 지원 · 자기 부담 0원",
          },
        ]}
        pitfalls={[
          {
            heading: "신청만 하고 동의를 빠뜨리면 탈락합니다",
            body:
              "신청 후 가구원(부모)의 정보제공 동의와 필요 서류 제출까지 마쳐야 심사가 시작됩니다. 부모의 공동인증서나 간편인증이 필요하므로 미리 알려 두세요.",
          },
          {
            heading: "재학생은 1차 기간에 신청해야 합니다",
            body:
              "2차 신청은 신입생·편입생·복학생 위주라, 재학생이 1차를 놓치면 구제 신청 절차를 밟아야 합니다. 매 학기 새로 신청해야 한다는 점도 잊기 쉽습니다.",
          },
          {
            heading: "계절학기 학점은 12학점에 넣지 않습니다",
            body:
              "직전 정규학기의 이수 학점만 봅니다. 계절학기로 학점을 채워도 요건을 충족하지 못하는 경우가 있으니 학교 장학팀에 확인하세요.",
          },
          {
            heading: "초과학기·재수강은 제한이 있습니다",
            body:
              "정규 학기 수를 넘긴 초과학기는 지원 대상에서 빠집니다. 재수강 과목은 성적 산정에서 제외되거나 별도로 처리되는 경우가 있습니다.",
          },
          {
            heading: "남는 지원단가는 현금으로 나오지 않습니다",
            body:
              "등록금보다 지원단가가 크면 그 차액은 사라집니다. 다음 학기로 이월되지도, 생활비로 전환되지도 않습니다. 생활비가 필요하면 생활비 대출이나 근로장학금을 따로 알아봐야 합니다.",
          },
        ]}
        sources={[
          { label: "한국장학재단", href: "https://www.kosaf.go.kr" },
          {
            label: "한국장학재단 고객센터 1599-2000",
            href: "https://www.kosaf.go.kr/ko/main.do",
          },
          { label: "교육부", href: "https://www.moe.go.kr" },
          { label: "학자금 지원구간 계산기", href: "/calc/bracket" },
        ]}
      />

      <section className="mt-10 rounded-2xl border border-border-soft bg-card p-5">
        <h2 className="mb-3 font-bold">함께 확인하세요</h2>
        <ul className="space-y-2 text-[15px]">
          <li>
            <Link
              href="/calc/bracket"
              className="text-accent underline-offset-4 hover:underline"
            >
              학자금 지원구간 계산기 →
            </Link>
          </li>
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
              href="/guide/tuition-cap"
              className="text-accent underline-offset-4 hover:underline"
            >
              같은 1구간인데 자기 부담이 정반대인 이유 →
            </Link>
          </li>
        </ul>
      </section>
      <CalcGuides calcHref="/calc/scholarship" />
    </div>
  );
}
