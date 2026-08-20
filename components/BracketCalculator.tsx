"use client";

import { useState } from "react";
import { MoneyField, ResultCard, parseMoney } from "./fields";
import OptionGroup from "./OptionGroup";
import {
  BASIC_PROPERTY_DEDUCTION,
  BRACKET_RATIOS,
  judgeBracket,
} from "@/lib/bracket";
import { formatKoreanWon, formatWon } from "@/lib/date";

function won(v: string): number {
  const n = parseMoney(v);
  return n === null ? 0 : n * 10_000;
}

export default function BracketCalculator() {
  const [size, setSize] = useState("4");
  const [income, setIncome] = useState("300");
  const [general, setGeneral] = useState("0");
  const [financial, setFinancial] = useState("0");
  const [car, setCar] = useState("0");
  const [debt, setDebt] = useState("0");
  const [siblings, setSiblings] = useState("2");
  const [unmarried, setUnmarried] = useState<"yes" | "no">("yes");

  const r = judgeBracket({
    householdSize: Number(size),
    monthlyIncome: won(income),
    generalProperty: won(general),
    financialProperty: won(financial),
    carValue: won(car),
    debt: won(debt),
    siblings: Number(siblings),
    unmarried: unmarried === "yes",
  });

  const propertyShare =
    r.recognizedIncome > 0 ? r.propertyConverted / r.recognizedIncome : 0;

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
      <p className="-mt-3 mb-5 text-sm text-muted">
        미혼 학생은 <strong>본인·부모</strong>가 기준입니다. 형제·자매는 가구원에
        넣지 않되 아래 &lsquo;형제·자매 수&rsquo;에서 공제로 반영됩니다.
      </p>

      <MoneyField
        label="가구의 월 소득"
        hint="부모의 근로·사업·연금소득 합계 (세전)"
        value={income}
        onChange={setIncome}
        placeholder="300"
      />
      <MoneyField
        label="일반재산"
        hint="주택·건물·토지·전월세보증금 등"
        value={general}
        onChange={setGeneral}
        placeholder="0"
      />
      <MoneyField
        label="금융재산"
        hint="예금·적금·주식·채권. 환산율이 가장 높습니다"
        value={financial}
        onChange={setFinancial}
        placeholder="0"
      />
      <MoneyField
        label="자동차 가액"
        hint="기본재산액 공제를 받지 못합니다"
        value={car}
        onChange={setCar}
        placeholder="0"
      />
      <MoneyField
        label="부채"
        hint="임대보증금·금융기관 대출 등"
        value={debt}
        onChange={setDebt}
        placeholder="0"
      />
      <MoneyField
        label="형제·자매 수"
        hint="본인 포함. 3명 이상이고 미혼일 때만 공제됩니다"
        unit="명"
        value={siblings}
        onChange={setSiblings}
        placeholder="2"
      />
      <OptionGroup
        label="본인 혼인 여부"
        options={[
          { value: "yes", label: "미혼" },
          { value: "no", label: "기혼" },
        ]}
        value={unmarried}
        onChange={setUnmarried}
      />

      <ResultCard
        title={r.supported ? "예상 학자금 지원구간" : "지원구간 밖입니다"}
      >
        {r.supported ? (
          <>
            <p className="text-3xl font-extrabold text-accent-strong">
              {r.bracket}구간
            </p>
            <p className="mt-1 text-[15px] text-muted">
              소득인정액 {formatWon(r.recognizedIncome)} · 기준 중위소득의{" "}
              {r.ratio.toFixed(1)}%
            </p>
          </>
        ) : (
          <p className="text-[15px] leading-relaxed text-muted">
            소득인정액이 기준 중위소득의 <strong>300%</strong>(
            {formatWon(r.medianIncome * 3)})를 넘습니다. 국가장학금 I유형은 9구간
            이하만 받습니다.
          </p>
        )}

        <dl className="mt-4 space-y-1.5 border-t border-border-soft pt-4 text-[15px]">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">소득평가액 (월)</dt>
            <dd>{formatWon(won(income))}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">재산의 소득환산액 (월)</dt>
            <dd>+ {formatWon(r.propertyConverted)}</dd>
          </div>
          {r.siblingDeduction > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">형제·자매 공제</dt>
              <dd>− {formatWon(r.siblingDeduction)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 border-t border-border-soft pt-2 font-bold">
            <dt>소득인정액</dt>
            <dd>{formatWon(r.recognizedIncome)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">
              {size === "7" ? "7인" : `${size}인`} 가구 기준 중위소득
            </dt>
            <dd>{formatWon(r.medianIncome)}</dd>
          </div>
        </dl>

        {r.propertyConverted > 0 && (
          <div className="mt-4 rounded-xl border border-border-soft p-4 text-[15px] leading-relaxed">
            <p className="font-bold">
              재산이 소득인정액의 {Math.round(propertyShare * 100)}%를 만들고
              있습니다
            </p>
            <dl className="mt-2 space-y-1 text-muted">
              {r.breakdown.generalConverted > 0 && (
                <div className="flex justify-between gap-4">
                  <dt>
                    일반재산 {formatKoreanWon(r.breakdown.generalAfterDeduction)} ×
                    1.39%
                  </dt>
                  <dd>{formatWon(r.breakdown.generalConverted)}</dd>
                </div>
              )}
              {r.breakdown.financialConverted > 0 && (
                <div className="flex justify-between gap-4">
                  <dt>
                    금융재산{" "}
                    {formatKoreanWon(r.breakdown.financialAfterDeduction)} × 2.09%
                  </dt>
                  <dd>{formatWon(r.breakdown.financialConverted)}</dd>
                </div>
              )}
              {r.breakdown.carConverted > 0 && (
                <div className="flex justify-between gap-4">
                  <dt>자동차 {formatKoreanWon(r.breakdown.carValue)} × 1.39%</dt>
                  <dd>{formatWon(r.breakdown.carConverted)}</dd>
                </div>
              )}
            </dl>
            <p className="mt-2 text-muted">
              재산에서 <strong>기본재산액 {formatKoreanWon(BASIC_PROPERTY_DEDUCTION)}</strong>과
              부채를 먼저 뺀 뒤 환산한 값입니다. 소득이 적어도 집이 있으면 구간이
              올라가는 이유가 여기 있습니다.
            </p>
          </div>
        )}

        {r.supported && (
          <div className="mt-4 rounded-xl border border-border-soft p-4 text-[15px] leading-relaxed">
            <p className="font-bold">경계까지 얼마나 남았나</p>
            <p className="mt-1.5 text-muted">
              소득인정액이 <strong>{formatWon(r.roomToUpperBracket)}</strong> 더
              늘면 {r.bracket + 1}구간으로 올라갑니다.
              {r.bracket > 1 && (
                <>
                  {" "}
                  반대로 <strong>{formatWon(r.gapToLowerBracket)}</strong>을 줄이면{" "}
                  {r.bracket - 1}구간이 됩니다.
                </>
              )}{" "}
              구간 하나 차이로 연 지원액이 100만원 넘게 갈리기도 합니다.
            </p>
          </div>
        )}

        <div className="mt-4 rounded-xl border border-amber-400/50 bg-amber-500/5 p-4 text-[15px] leading-relaxed">
          <p className="font-bold text-amber-700 dark:text-amber-400">
            실제 구간은 재단이 확정합니다
          </p>
          <p className="mt-1.5 text-muted">
            재단은 소득·재산 자료를 공적 자료로 직접 조회합니다. 소득평가액에는
            항목별 공제가 더 붙고, 재산도 공시가격·기준시가로 평가됩니다. 이
            계산기는 공개된 산식으로 낸 <strong>추정치</strong>이며, 실제 구간은
            한국장학재단(1599-2000) 통지로 확인하세요.
          </p>
        </div>
      </ResultCard>

      <p className="mt-5 text-sm leading-relaxed text-muted">
        2026년 기준 중위소득(보건복지부 고시)과 학자금 지원구간 산정 기준을
        적용했습니다. 구간 경계는 중위소득의{" "}
        {BRACKET_RATIOS.join("·")}%입니다. 기준 중위소득은 매년 8월에 고시되어
        이듬해 1월부터 적용됩니다.
      </p>
    </div>
  );
}
