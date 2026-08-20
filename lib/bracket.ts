// 학자금 지원구간 판정 — 이 노트의 뿌리가 되는 계산.
//
// 국가장학금·근로장학금·주거안정장학금이 전부 이 구간 하나로 갈린다.
// 그런데 구간은 "우리 집 연봉"으로 정해지지 않는다. 소득에 **재산을 소득으로 환산한 값**을
// 더한 소득인정액으로 정해진다. 그래서 소득이 적어도 집이 있으면 구간이 올라간다.
//
// 산식 (한국장학재단 「학자금 지원구간 산정」 공시):
//   소득인정액(월) = 소득평가액(월) + 재산의 소득환산액(월) − 형제·자매 공제
//   재산의 소득환산액 = (재산 − 기본재산액 − 부채) × 월 소득환산율
//
// ⚠️ 갱신 대상
//   · 기준 중위소득 — 매년 8월 보건복지부 고시, 이듬해 1월 적용
//   · 기본재산액·소득환산율 — 학자금 지원구간 산정 지침 개정 시
//   값을 고치면 `bracket.test.ts`의 리터럴 고정 테스트가 먼저 깨진다.

/**
 * 2026년 기준 중위소득 (월). 보건복지부 고시 제2025-135호.
 * 2025년 대비 6.51% 인상(4인 기준 6,097,773 → 6,494,738)으로 역대 최대 폭이었다.
 */
export const MEDIAN_INCOME: Record<number, number> = {
  1: 2_564_238,
  2: 4_199_292,
  3: 5_359_036,
  4: 6_494_738,
  5: 7_556_719,
  6: 8_555_952,
};

/** 7인 이상 가구는 1인 늘 때마다 6인과 5인의 차액을 더한다(복지부 고시 방식). */
export const EXTRA_PER_MEMBER = MEDIAN_INCOME[6] - MEDIAN_INCOME[5]; // 999,233

/** 기본재산액 공제 — 학자금은 전국 단일이다. 기초생활보장처럼 지역별로 다르지 않다. */
export const BASIC_PROPERTY_DEDUCTION = 69_000_000;

/**
 * 월 소득환산율. 재단 공시는 `4.17%/3`처럼 연 환산율을 3으로 나눈 형태로 적는다.
 * 기초생활보장(월 4.17%)의 1/3이라 재산이 구간에 미치는 영향이 그만큼 완만하다.
 */
export const CONVERSION_RATE = {
  general: 0.0417 / 3, // 일반재산(주택·토지·전월세보증금 등)
  financial: 0.0626 / 3, // 금융재산(예금·적금·주식 등)
  car: 0.0417 / 3, // 자동차
} as const;

/** 형제·자매 공제 — 본인 포함 3명 이상인 미혼 학생만, (인원 − 2) × 40만원. */
export const SIBLING_DEDUCTION_PER = 400_000;
export const SIBLING_DEDUCTION_BASE = 2;

/**
 * 구간 경계 — 기준 중위소득 대비 비율(%).
 * 배열의 n번째 값 이하이면 (n+1)구간이다. 300%를 넘으면 구간 밖(10구간)이라
 * 국가장학금을 받지 못한다.
 */
export const BRACKET_RATIOS = [30, 50, 70, 90, 100, 130, 150, 200, 300] as const;

export interface BracketInput {
  /** 가구원 수 (본인 포함) */
  householdSize: number;
  /** 가구의 월 소득평가액 — 근로·사업·연금소득 등의 합계 */
  monthlyIncome: number;
  /** 일반재산: 주택·건물·토지·전월세보증금 등 */
  generalProperty: number;
  /** 금융재산: 예금·적금·주식·채권 등 */
  financialProperty: number;
  /** 자동차 가액 */
  carValue: number;
  /** 부채 (임대보증금·금융기관 대출 등) */
  debt: number;
  /** 본인 포함 형제·자매 수. 3명 이상이고 미혼일 때만 공제된다. */
  siblings: number;
  /** 미혼 여부 — 형제·자매 공제 요건 */
  unmarried: boolean;
}

export interface BracketResult {
  /** 1~9. 300% 초과면 10 (구간 밖) */
  bracket: number;
  /** 국가장학금 지원 대상인지 (9구간 이하) */
  supported: boolean;
  /** 월 소득인정액 */
  recognizedIncome: number;
  /** 월 재산의 소득환산액 */
  propertyConverted: number;
  /** 적용된 형제·자매 공제액 */
  siblingDeduction: number;
  /** 이 가구 규모의 기준 중위소득(월) */
  medianIncome: number;
  /** 소득인정액이 기준 중위소득의 몇 %인지 */
  ratio: number;
  /** 한 구간 아래로 내려가려면 소득인정액을 얼마나 줄여야 하는지. 1구간이면 0 */
  gapToLowerBracket: number;
  /** 지금 구간을 유지하려면 소득인정액이 얼마까지 늘어도 되는지. 구간 밖이면 0 */
  roomToUpperBracket: number;
  /** 항목별 환산 내역 — 무엇이 구간을 밀어 올렸는지 보여주기 위한 값 */
  breakdown: {
    generalAfterDeduction: number;
    financialAfterDeduction: number;
    carValue: number;
    generalConverted: number;
    financialConverted: number;
    carConverted: number;
  };
}

/** 가구원 수에 해당하는 기준 중위소득(월). 7인 이상은 가산액으로 계산한다. */
export function medianIncome(householdSize: number): number {
  const size = Math.max(1, Math.floor(householdSize));
  if (size <= 6) return MEDIAN_INCOME[size];
  return MEDIAN_INCOME[6] + EXTRA_PER_MEMBER * (size - 6);
}

/** 소득인정액이 기준 중위소득의 몇 %인지로 구간을 정한다. 300% 초과는 10구간. */
export function bracketFromRatio(ratio: number): number {
  for (let i = 0; i < BRACKET_RATIOS.length; i += 1) {
    if (ratio <= BRACKET_RATIOS[i]) return i + 1;
  }
  return 10;
}

/** 구간의 소득인정액 상한(월). 10구간은 상한이 없으므로 Infinity. */
export function bracketCeiling(bracket: number, householdSize: number): number {
  if (bracket >= 10) return Infinity;
  return (medianIncome(householdSize) * BRACKET_RATIOS[bracket - 1]) / 100;
}

export function judgeBracket(input: BracketInput): BracketResult {
  const median = medianIncome(input.householdSize);

  // 부채는 일반재산에서 먼저 빼고, 남으면 금융재산에서 뺀다(재단 공시).
  // 기본재산액도 같은 순서로 차감한다. 자동차에서는 차감하지 않는다 —
  // 기초생활보장 소득인정액 산정과 같은 방식을 따랐다.
  const reduce = Math.max(0, input.debt) + BASIC_PROPERTY_DEDUCTION;

  const general = Math.max(0, input.generalProperty);
  const financial = Math.max(0, input.financialProperty);

  const generalAfterDeduction = Math.max(0, general - reduce);
  const leftover = Math.max(0, reduce - general);
  const financialAfterDeduction = Math.max(0, financial - leftover);
  const carValue = Math.max(0, input.carValue);

  const generalConverted = generalAfterDeduction * CONVERSION_RATE.general;
  const financialConverted = financialAfterDeduction * CONVERSION_RATE.financial;
  const carConverted = carValue * CONVERSION_RATE.car;
  const propertyConverted = Math.round(
    generalConverted + financialConverted + carConverted,
  );

  // 형제·자매 공제는 본인 포함 3명 이상인 미혼 학생만 받는다.
  const siblingDeduction =
    input.unmarried && input.siblings > SIBLING_DEDUCTION_BASE
      ? (input.siblings - SIBLING_DEDUCTION_BASE) * SIBLING_DEDUCTION_PER
      : 0;

  const recognizedIncome = Math.max(
    0,
    Math.round(
      Math.max(0, input.monthlyIncome) + propertyConverted - siblingDeduction,
    ),
  );

  const ratio = (recognizedIncome / median) * 100;
  const bracket = bracketFromRatio(ratio);

  const ceiling = bracketCeiling(bracket, input.householdSize);
  const roomToUpperBracket =
    ceiling === Infinity ? 0 : Math.max(0, Math.floor(ceiling - recognizedIncome));

  const lowerCeiling =
    bracket <= 1 ? 0 : bracketCeiling(bracket - 1, input.householdSize);
  const gapToLowerBracket =
    bracket <= 1 ? 0 : Math.max(0, Math.ceil(recognizedIncome - lowerCeiling));

  return {
    bracket,
    supported: bracket <= 9,
    recognizedIncome,
    propertyConverted,
    siblingDeduction,
    medianIncome: median,
    ratio,
    gapToLowerBracket,
    roomToUpperBracket,
    breakdown: {
      generalAfterDeduction,
      financialAfterDeduction,
      carValue,
      generalConverted: Math.round(generalConverted),
      financialConverted: Math.round(financialConverted),
      carConverted: Math.round(carConverted),
    },
  };
}
