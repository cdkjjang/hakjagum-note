"use client";

import { useState } from "react";
import { MoneyField, ResultCard, parseMoney } from "./fields";
import OptionGroup from "./OptionGroup";
import {
  LOAN_RATE,
  THRESHOLD_INCOME,
  calculateIcl,
  type StudentType,
} from "@/lib/icl";
import { formatWon } from "@/lib/date";

function won(v: string): number {
  const n = parseMoney(v);
  return n === null ? 0 : n * 10_000;
}

export default function IclCalculator() {
  const [mode, setMode] = useState<"salary" | "income">("salary");
  const [amount, setAmount] = useState("4000");
  const [studentType, setStudentType] = useState<StudentType>("undergraduate");
  const [balance, setBalance] = useState("2000");

  const r = calculateIcl({
    amount: won(amount),
    inputMode: mode,
    studentType,
    balance: won(balance),
  });

  return (
    <div className="rounded-2xl border border-border-soft bg-card p-5 shadow-sm">
      <OptionGroup
        label="무엇을 입력하시겠어요"
        options={[
          { value: "salary", label: "총급여(연봉)", hint: "원천징수영수증 ⑯번" },
          { value: "income", label: "소득금액", hint: "근로소득공제 뺀 뒤" },
        ]}
        value={mode}
        onChange={setMode}
      />
      <MoneyField
        label={mode === "salary" ? "연간 총급여" : "연간 소득금액"}
        hint={
          mode === "salary"
            ? "비과세를 뺀 세전 연봉. 소득금액으로 자동 환산합니다"
            : "상환기준소득은 이 값으로 비교합니다"
        }
        value={amount}
        onChange={setAmount}
        placeholder="4000"
      />
      <OptionGroup
        label="대출 종류"
        options={[
          { value: "undergraduate", label: "학부", hint: "초과분 20%" },
          { value: "graduate", label: "대학원", hint: "초과분 25%" },
        ]}
        value={studentType}
        onChange={setStudentType}
      />
      <MoneyField
        label="남은 대출 잔액"
        hint="비워 두면 소진 기간을 계산하지 않습니다"
        value={balance}
        onChange={setBalance}
        placeholder="2000"
      />

      <ResultCard
        title={r.liable ? "연간 의무상환액" : "아직 갚지 않아도 됩니다"}
      >
        {r.liable ? (
          <>
            <p className="text-3xl font-extrabold text-accent-strong">
              {formatWon(r.annualRepayment)}
            </p>
            <p className="mt-1 text-[15px] text-muted">
              월 약 {formatWon(r.monthlyRepayment)} · 소득금액의{" "}
              {r.burdenRatio.toFixed(1)}%
            </p>
          </>
        ) : (
          <p className="text-[15px] leading-relaxed text-muted">
            소득금액 {formatWon(r.income)}이 상환기준소득{" "}
            <strong>{formatWon(THRESHOLD_INCOME)}</strong>에 못 미칩니다. 총급여가{" "}
            <strong>{formatWon(r.salaryToThreshold)}</strong> 더 늘면 의무상환이
            시작됩니다.
          </p>
        )}

        <dl className="mt-4 space-y-1.5 border-t border-border-soft pt-4 text-[15px]">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">총급여</dt>
            <dd>{formatWon(r.grossSalary)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">근로소득공제를 뺀 소득금액</dt>
            <dd>{formatWon(r.income)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">상환기준소득</dt>
            <dd>− {formatWon(THRESHOLD_INCOME)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">초과분</dt>
            <dd>{formatWon(r.excess)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-border-soft pt-2 font-bold">
            <dt>× {Math.round(r.rate * 100)}%</dt>
            <dd>{formatWon(r.annualRepayment)}</dd>
          </div>
        </dl>

        {/* 이 계산기의 핵심 — 기준은 연봉이 아니다. */}
        <div className="mt-4 rounded-xl border border-border-soft p-4 text-[15px] leading-relaxed">
          <p className="font-bold">
            기준은 연봉이 아니라 소득금액입니다
          </p>
          <p className="mt-1.5 text-muted">
            상환기준소득 <strong>{formatWon(THRESHOLD_INCOME)}</strong>은 총급여가
            아니라 근로소득공제를 뺀 뒤의 금액입니다. 총급여로 환산하면{" "}
            <strong>{formatWon(r.thresholdSalary)}</strong>이라, 연봉이 이보다
            적으면 갚을 의무가 없습니다. &ldquo;연봉 몇천이면 갚는다&rdquo;는 말이
            사람마다 다르게 들리는 이유가 이것입니다.
          </p>
        </div>

        {r.liable && r.burdenRatio < 3 && (
          <div className="mt-4 rounded-xl border border-border-soft p-4 text-[15px] leading-relaxed">
            <p className="font-bold">
              갚는 건 소득 전체가 아니라 초과분의{" "}
              {Math.round(r.rate * 100)}%뿐입니다
            </p>
            <p className="mt-1.5 text-muted">
              기준을 갓 넘긴 해에는 연 상환액이 몇만원에 그치기도 합니다. 소득이
              늘면 상환액도 함께 늘고, 실직해서 기준 아래로 내려가면 다시 멈춥니다.
              그래서 취업 후 상환 대출은 연체가 잘 생기지 않습니다.
            </p>
          </div>
        )}

        {r.yearsToClear !== null && (
          <div className="mt-4 rounded-xl border border-border-soft p-4 text-[15px] leading-relaxed">
            <p className="font-bold">
              지금 소득이 유지되면 약 {r.yearsToClear}년이 걸립니다
            </p>
            <p className="mt-1.5 text-muted">
              잔액 {formatWon(won(balance))}에 연 {(LOAN_RATE * 100).toFixed(1)}%
              이자가 붙고 매년 {formatWon(r.annualRepayment)}을 갚는다고 볼 때의
              추정입니다. 그동안 붙는 이자는 약{" "}
              <strong>{formatWon(r.totalInterest ?? 0)}</strong>입니다. 여유가 되면
              언제든 <strong>자발적 상환</strong>으로 더 낼 수 있고, 그만큼 이자가
              줄어듭니다.
            </p>
          </div>
        )}

        {r.yearsToClear === null && won(balance) > 0 && (
          <div className="mt-4 rounded-xl border border-amber-400/50 bg-amber-500/5 p-4 text-[15px] leading-relaxed">
            <p className="font-bold text-amber-700 dark:text-amber-400">
              지금 소득으로는 잔액이 줄지 않습니다
            </p>
            <p className="mt-1.5 text-muted">
              의무상환액이 한 해 이자보다 적거나 없어서, 갚는 것보다 이자가 빨리
              붙습니다. 소진 기간을 숫자로 내놓지 않은 이유입니다. 소득이 늘거나
              자발적 상환을 하면 달라집니다.
            </p>
          </div>
        )}

        <div className="mt-4 rounded-xl border border-border-soft p-4 text-[15px] leading-relaxed">
          <p className="font-bold">갚은 만큼 세금도 돌려받습니다</p>
          <p className="mt-1.5 text-muted">
            학자금대출 원리금 상환액은 <strong>본인 교육비 세액공제</strong>
            대상입니다. 한도 없이 전액을 넣어 15%를 세액에서 뺍니다. 연 300만원을
            갚았다면 45만원입니다. 등록금을 낸 해가 아니라 <strong>갚은 해</strong>에
            공제받는다는 점을 놓치기 쉽습니다.
          </p>
        </div>
      </ResultCard>

      <p className="mt-5 text-sm leading-relaxed text-muted">
        2026년 상환기준소득과 학자금대출 금리(연{" "}
        {(LOAN_RATE * 100).toFixed(1)}%)를 적용한 추정치입니다. 상환기준소득은
        매년, 금리는 학기마다 바뀝니다. 실제 의무상환액은 국세청이 전년도 소득을
        확정한 뒤 통지하며, 근로소득 외 사업·이자·배당소득이 있으면 계산이
        달라집니다. 확정 금액은 한국장학재단(1599-2000)에서 확인하세요.
      </p>
    </div>
  );
}
