"use client";

import { useState } from "react";
import { MoneyField, ResultCard, parseMoney } from "./fields";
import OptionGroup from "./OptionGroup";
import {
  CREDIT_RATE,
  LIMIT_SCHOOL,
  LIMIT_UNIVERSITY,
  calculateDeduction,
  type DependentLevel,
} from "@/lib/deduction";
import { formatWon } from "@/lib/date";

function won(v: string): number {
  const n = parseMoney(v);
  return n === null ? 0 : n * 10_000;
}

const LEVEL_LABEL: Record<DependentLevel, string> = {
  preschool: "취학 전",
  school: "초·중·고",
  university: "대학생",
};

export default function DeductionCalculator() {
  const [loan, setLoan] = useState("300");
  const [selfTuition, setSelfTuition] = useState("0");
  const [tax, setTax] = useState("300");
  const [hasChild, setHasChild] = useState<"no" | "yes">("no");
  const [level, setLevel] = useState<DependentLevel>("university");
  const [childTuition, setChildTuition] = useState("0");
  const [uniform, setUniform] = useState("0");
  const [fieldTrip, setFieldTrip] = useState("0");

  const r = calculateDeduction({
    selfTuition: won(selfTuition),
    loanRepayment: won(loan),
    dependents:
      hasChild === "yes"
        ? [
            {
              level,
              tuition: won(childTuition),
              uniform: won(uniform),
              fieldTrip: won(fieldTrip),
            },
          ]
        : [],
    specialEducation: 0,
    determinedTax: won(tax),
  });

  const line = r.dependentLines[0];

  return (
    <div className="rounded-2xl border border-border-soft bg-card p-5 shadow-sm">
      <MoneyField
        label="올해 갚은 학자금대출 원리금"
        hint="한도 없이 전액이 공제 대상입니다"
        value={loan}
        onChange={setLoan}
        placeholder="300"
      />
      <MoneyField
        label="본인이 부담한 등록금"
        hint="장학금으로 충당한 금액은 빼고 입력하세요"
        value={selfTuition}
        onChange={setSelfTuition}
        placeholder="0"
      />
      <MoneyField
        label="올해 결정세액"
        hint="원천징수영수증의 결정세액. 이 금액까지만 돌려받습니다"
        value={tax}
        onChange={setTax}
        placeholder="300"
      />

      <OptionGroup
        label="부양가족 교육비가 있나요"
        options={[
          { value: "no", label: "없음" },
          { value: "yes", label: "있음" },
        ]}
        value={hasChild}
        onChange={setHasChild}
      />
      {hasChild === "yes" && (
        <>
          <OptionGroup
            label="자녀 학교급"
            options={(["preschool", "school", "university"] as const).map(
              (v) => ({
                value: v,
                label: LEVEL_LABEL[v],
                hint:
                  v === "university"
                    ? "연 900만"
                    : "연 300만",
              }),
            )}
            value={level}
            onChange={setLevel}
          />
          <MoneyField
            label="수업료·급식비·방과후 수강료 등"
            value={childTuition}
            onChange={setChildTuition}
            placeholder="0"
          />
          {level === "school" && (
            <MoneyField
              label="교복 구입비"
              hint="1명당 연 50만원까지만 인정됩니다"
              value={uniform}
              onChange={setUniform}
              placeholder="0"
            />
          )}
          {level !== "university" && (
            <MoneyField
              label="현장체험학습비"
              hint="1명당 연 30만원까지"
              value={fieldTrip}
              onChange={setFieldTrip}
              placeholder="0"
            />
          )}
        </>
      )}

      <ResultCard title="줄어드는 세금">
        <p className="text-3xl font-extrabold text-accent-strong">
          {formatWon(r.credit)}
        </p>
        <p className="mt-1 text-[15px] text-muted">
          지방소득세까지 합치면 약 {formatWon(r.creditWithLocalTax)}
        </p>

        <dl className="mt-4 space-y-1.5 border-t border-border-soft pt-4 text-[15px]">
          {r.loanEligible > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">학자금대출 상환액 (한도 없음)</dt>
              <dd>{formatWon(r.loanEligible)}</dd>
            </div>
          )}
          {won(selfTuition) > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">본인 등록금 (한도 없음)</dt>
              <dd>{formatWon(won(selfTuition))}</dd>
            </div>
          )}
          {line && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">
                자녀 교육비 ({LEVEL_LABEL[line.level]} · 한도{" "}
                {formatWon(line.limit)})
              </dt>
              <dd>{formatWon(line.eligible)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 border-t border-border-soft pt-2 font-bold">
            <dt>공제 대상액</dt>
            <dd>{formatWon(r.totalEligible)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">
              × {Math.round(CREDIT_RATE * 100)}% 세액공제
            </dt>
            <dd>{formatWon(r.creditBeforeCap)}</dd>
          </div>
        </dl>

        {r.wasted > 0 && (
          <div className="mt-4 rounded-xl border border-amber-400/50 bg-amber-500/5 p-4 text-[15px] leading-relaxed">
            <p className="font-bold text-amber-700 dark:text-amber-400">
              결정세액이 모자라 {formatWon(r.wasted)}은 받지 못합니다
            </p>
            <p className="mt-1.5 text-muted">
              세액공제는 <strong>이미 낼 세금이 있어야</strong> 깎아 주는 것입니다.
              결정세액이 {formatWon(won(tax))}이면 그만큼까지만 줄어들고, 남는 공제는
              현금으로 나오지 않으며 다음 해로 넘어가지도 않습니다. 사회초년생은
              결정세액 자체가 적어 이런 경우가 흔합니다.
            </p>
          </div>
        )}

        {line && line.trimmed + line.itemTrimmed > 0 && (
          <div className="mt-4 rounded-xl border border-border-soft p-4 text-[15px] leading-relaxed">
            <p className="font-bold">
              한도에 걸려 {formatWon(line.trimmed + line.itemTrimmed)}이 잘렸습니다
            </p>
            <p className="mt-1.5 text-muted">
              대학생은 1명당 연 {formatWon(LIMIT_UNIVERSITY)}, 취학 전과 초·중·고는
              1명당 연 {formatWon(LIMIT_SCHOOL)}까지입니다. 교복비 50만원,
              현장체험학습비 30만원은 그 안에서 다시 자체 한도가 걸립니다. 한도는
              자녀 한 명마다 따로 적용되므로 여러 명이면 각각 계산합니다.
            </p>
          </div>
        )}

        {/* 이 계산기의 핵심 둘 */}
        <div className="mt-4 rounded-xl border border-border-soft p-4 text-[15px] leading-relaxed">
          <p className="font-bold">학자금대출은 갚을 때 공제받습니다</p>
          <p className="mt-1.5 text-muted">
            등록금을 낸 해가 아니라 <strong>원리금을 상환한 해</strong>에 본인
            교육비로 넣습니다. 재학 중에는 소득이 없어 공제받을 것이 없으니 제도가
            그렇게 짜여 있습니다. 취업하고 나서 이걸 몰라 놓치는 사람이 많습니다.
            연말정산 간소화에서 자동으로 잡히지 않을 수 있으니, 재단 누리집에서
            상환증명서를 내려받아 확인하세요.
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/5 p-4 text-[15px] leading-relaxed">
          <p className="font-bold text-rose-600 dark:text-rose-400">
            국가장학금으로 낸 등록금은 공제 대상이 아닙니다
          </p>
          <p className="mt-1.5 text-muted">
            공제는 <strong>내가 실제로 부담한 금액</strong>에만 적용됩니다. 등록금
            700만원 중 600만원을 장학금으로 받았다면 100만원만 넣어야 합니다.
            700만원을 그대로 넣으면 나중에 가산세와 함께 추징됩니다. 학자금대출로
            낸 등록금도 마찬가지로, 낼 때가 아니라 <strong>갚을 때</strong>
            넣습니다.
          </p>
        </div>
      </ResultCard>

      <p className="mt-5 text-sm leading-relaxed text-muted">
        소득세법 제59조의4 교육비 세액공제 기준입니다. 이 계산기는 교육비 항목만
        다루므로 실제 연말정산 결과와는 다릅니다. 다른 공제까지 반영한 환급액
        추정은 세금노트의 연말정산 계산기를 쓰세요. 세무 자문이 아니며, 확정
        금액은 국세청 홈택스에서 확인하세요.
      </p>
    </div>
  );
}
