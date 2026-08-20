"use client";

import { useState } from "react";
import { MoneyField, ResultCard, parseMoney } from "./fields";
import OptionGroup from "./OptionGroup";
import {
  estimateScholarship,
  type ChildOrder,
  type WelfareType,
} from "@/lib/scholarship";
import { formatWon } from "@/lib/date";

function won(v: string): number {
  const n = parseMoney(v);
  return n === null ? 0 : n * 10_000;
}

export default function ScholarshipCalculator() {
  const [size, setSize] = useState("4");
  const [income, setIncome] = useState("300");
  const [property, setProperty] = useState("0");
  const [tuition, setTuition] = useState("400");
  const [childOrder, setChildOrder] = useState<ChildOrder>("none");
  const [welfare, setWelfare] = useState<WelfareType>("none");
  const [freshman, setFreshman] = useState<"yes" | "no">("no");
  const [score, setScore] = useState("85");
  const [credits, setCredits] = useState("15");

  const isFreshman = freshman === "yes";
  const r = estimateScholarship({
    bracket: {
      householdSize: Number(size),
      monthlyIncome: won(income),
      generalProperty: won(property),
      financialProperty: 0,
      carValue: 0,
      debt: 0,
      siblings: childOrder === "thirdPlus" ? 3 : 2,
      unmarried: true,
    },
    annualTuition: won(tuition),
    childOrder,
    welfare,
    gradeScore: isFreshman ? undefined : (parseMoney(score) ?? 0),
    credits: isFreshman ? undefined : (parseMoney(credits) ?? 0),
  });

  return (
    <div className="rounded-2xl border border-border-soft bg-card p-5 shadow-sm">
      <OptionGroup
        label="가구원 수 (본인 포함)"
        options={["1", "2", "3", "4", "5", "6", "7"].map((v) => ({
          value: v,
          label: v === "7" ? "7명 이상" : `${v}명`,
        }))}
        value={size}
        onChange={setSize}
      />
      <MoneyField
        label="가구의 월 소득"
        hint="부모의 근로·사업·연금소득 합계 (세전)"
        value={income}
        onChange={setIncome}
        placeholder="300"
      />
      <MoneyField
        label="일반재산"
        hint="주택·전월세보증금 등. 자세한 구간 판정은 지원구간 계산기에서"
        value={property}
        onChange={setProperty}
        placeholder="0"
      />
      <MoneyField
        label="연간 등록금 (입학금 포함)"
        hint="지원액은 이 금액을 넘지 못합니다"
        value={tuition}
        onChange={setTuition}
        placeholder="400"
      />

      <OptionGroup
        label="기초·차상위 여부"
        options={[
          { value: "none", label: "해당 없음" },
          { value: "basic", label: "기초생활수급자" },
          { value: "nearPoor", label: "차상위계층" },
        ]}
        value={welfare}
        onChange={setWelfare}
      />
      <OptionGroup
        label="다자녀 가구"
        options={[
          { value: "none", label: "해당 없음" },
          { value: "firstSecond", label: "셋 이상 중 첫째·둘째" },
          { value: "thirdPlus", label: "셋째 이상" },
        ]}
        value={childOrder}
        onChange={setChildOrder}
      />
      <OptionGroup
        label="신입생·편입생인가요"
        options={[
          { value: "no", label: "재학생" },
          { value: "yes", label: "신입·편입·재입학" },
        ]}
        value={freshman}
        onChange={setFreshman}
      />
      {!isFreshman && (
        <>
          <MoneyField
            label="직전 학기 성적"
            hint="100점 만점 환산 (B학점 = 80점)"
            unit="점"
            value={score}
            onChange={setScore}
            placeholder="85"
          />
          <MoneyField
            label="직전 학기 이수 학점"
            hint="12학점 이상이어야 합니다"
            unit="학점"
            value={credits}
            onChange={setCredits}
            placeholder="15"
          />
        </>
      )}

      <ResultCard
        title={
          r.ineligibleReason ? "지원 대상이 아닙니다" : "연간 예상 지원액"
        }
      >
        {r.ineligibleReason ? (
          <p className="text-[15px] leading-relaxed text-muted">
            {r.ineligibleReason}
          </p>
        ) : (
          <>
            <p className="text-3xl font-extrabold text-accent-strong">
              {formatWon(r.annualAmount)}
            </p>
            <p className="mt-1 text-[15px] text-muted">
              {r.bracket}구간 · 학기당 {formatWon(r.semesterAmount)}
            </p>
          </>
        )}

        <dl className="mt-4 space-y-1.5 border-t border-border-soft pt-4 text-[15px]">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">적용 지원단가 ({r.tableName})</dt>
            <dd>{r.fullSupport ? "등록금 전액" : formatWon(r.unitAmount)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">연간 등록금</dt>
            <dd>{formatWon(won(tuition))}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">국가장학금</dt>
            <dd>− {formatWon(r.annualAmount)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-border-soft pt-2 font-bold">
            <dt>스스로 내야 할 금액</dt>
            <dd>{formatWon(r.selfPay)}</dd>
          </div>
        </dl>

        {r.cappedBy > 0 && (
          <div className="mt-4 rounded-xl border border-amber-400/50 bg-amber-500/5 p-4 text-[15px] leading-relaxed">
            <p className="font-bold text-amber-700 dark:text-amber-400">
              지원단가보다 등록금이 적어 {formatWon(r.cappedBy)}이 잘렸습니다
            </p>
            <p className="mt-1.5 text-muted">
              국가장학금은 <strong>등록금을 대신 내주는 제도</strong>라 등록금보다
              많이 받을 수 없습니다. {r.bracket}구간 단가가{" "}
              {formatWon(r.unitAmount)}이어도 등록금이{" "}
              {formatWon(won(tuition))}이면 그만큼만 받습니다. 남는 금액이 현금으로
              나오지는 않습니다.
            </p>
          </div>
        )}

        {r.selfPay > 0 && !r.ineligibleReason && (
          <div className="mt-4 rounded-xl border border-border-soft p-4 text-[15px] leading-relaxed">
            <p className="font-bold">남는 {formatWon(r.selfPay)}은 어떻게 하나</p>
            <p className="mt-1.5 text-muted">
              교내장학금·재단장학금(II유형)으로 일부가 더 채워질 수 있고, 그래도
              남으면 등록금 분할납부나 학자금대출을 씁니다. 취업 후 상환 대출을
              쓰면 재학 중에는 갚지 않고, 취업해서 소득이 기준을 넘은 해부터
              갚습니다.
            </p>
          </div>
        )}

        {r.grade.evaluated && r.grade.passed && r.grade.warningEligible && (
          <div className="mt-4 rounded-xl border border-border-soft p-4 text-[15px] leading-relaxed">
            <p className="font-bold">성적 요건</p>
            <p className="mt-1.5 text-muted">{r.grade.message}</p>
          </div>
        )}

        {!r.grade.evaluated && (
          <div className="mt-4 rounded-xl border border-border-soft p-4 text-[15px] leading-relaxed">
            <p className="font-bold">첫 학기는 성적을 보지 않습니다</p>
            <p className="mt-1.5 text-muted">{r.grade.message}</p>
          </div>
        )}
      </ResultCard>

      <p className="mt-5 text-sm leading-relaxed text-muted">
        2026년 국가장학금 I유형 지원단가 기준입니다. 지원단가는 교육부 예산으로
        정해지며 9구간은 2026년에 새로 생겼습니다. 실제 지원 여부는 소득·재산
        심사와 학적·성적 확인을 거쳐 한국장학재단이 결정합니다. 신청은 매 학기
        재단 누리집에서 하며, <strong>기한을 놓치면 그 학기는 받지 못합니다.</strong>
      </p>
    </div>
  );
}
