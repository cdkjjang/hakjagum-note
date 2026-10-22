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

/**
 * 구간 경계에 쓰는 기준 중위소득 — **가구원 수와 관계없이 4인 가구 값 하나**다.
 *
 * 2026-10-22 정정. 이전에는 가구원 수별 중위소득으로 경계를 나눠, 1~3인 가구는 구간이 실제보다
 * 높게(불리하게), 5인 이상은 낮게 나왔다. 근거:
 *   · 재단 「학자금 지원구간 경곗값」 공시 — 표가 4인 가구 기준 한 줄뿐이다
 *     (1구간 1,948,421원 = 6,494,738 × 30%). kosaf.go.kr tuition04_09_07
 *   · 공공데이터포털 재단 파일 설명 — "학자금지원구간 경곗값은 연단위로 산정하고,
 *     가족수에 영향을 받지 않아 … '가족수' 항목(컬럼)은 제공 정보에서 제외함" (data.go.kr 15070453)
 *   · 재단 산정절차 — 소득인정액 = 소득평가액 + 재산의 소득환산액 − 형제·자매 수에 따른 공제액.
 *     가족 규모는 경계가 아니라 이 공제로만 반영된다.
 * 그래서 계산기는 가구원 수를 묻지 않는다. MEDIAN_INCOME 표는 고시값 고정 테스트와 가이드 인용을
 * 위해 남겨 둔다.
 */
export const BRACKET_MEDIAN_HOUSEHOLD = 4;
export const BRACKET_MEDIAN = MEDIAN_INCOME[BRACKET_MEDIAN_HOUSEHOLD];

/**
 * 2027년 1학기부터 10구간을 '가~마' 5구간으로 묶는다. 지원 금액 기준은 그대로다
 * (재단 「2027년 학자금 지원구간 개편」 — 2026년 사전 공표 후 2027년 1학기부터 적용).
 * 1~3구간 → 가, 4~6 → 나, 7~8 → 다, 9 → 라, 10 → 마(미지원).
 */
export function bracketGroup2027(bracket: number): "가" | "나" | "다" | "라" | "마" {
  if (bracket <= 3) return "가";
  if (bracket <= 6) return "나";
  if (bracket <= 8) return "다";
  if (bracket === 9) return "라";
  return "마";
}

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
  /** 구간 경계에 쓴 기준 중위소득(월) — 4인 가구 값 */
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


/** 소득인정액이 기준 중위소득의 몇 %인지로 구간을 정한다. 300% 초과는 10구간. */
export function bracketFromRatio(ratio: number): number {
  for (let i = 0; i < BRACKET_RATIOS.length; i += 1) {
    if (ratio <= BRACKET_RATIOS[i]) return i + 1;
  }
  return 10;
}

/** 구간의 소득인정액 상한(월). 10구간은 상한이 없으므로 Infinity. */
// 재단 경곗값은 원 단위로 반올림한 값이다(70%: 4,546,316.6 → 4,546,317원 이하가 3구간).
// 비율로 비교하면 경계 1원에서 구간이 어긋나므로 반올림한 금액으로 비교한다.
export function bracketCeiling(bracket: number): number {
  if (bracket >= 10) return Infinity;
  return Math.round((BRACKET_MEDIAN * BRACKET_RATIOS[bracket - 1]) / 100);
}

/** 월 소득인정액으로 구간을 정한다. 재단 경곗값(반올림한 원 단위) 이하이면 그 구간이다. */
export function bracketFromIncome(recognizedIncome: number): number {
  for (let b = 1; b <= BRACKET_RATIOS.length; b += 1) {
    if (recognizedIncome <= bracketCeiling(b)) return b;
  }
  return 10;
}

export function judgeBracket(input: BracketInput): BracketResult {
  const median = BRACKET_MEDIAN;

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
  const bracket = bracketFromIncome(recognizedIncome);

  const ceiling = bracketCeiling(bracket);
  const roomToUpperBracket =
    ceiling === Infinity ? 0 : Math.max(0, Math.floor(ceiling - recognizedIncome));

  const lowerCeiling =
    bracket <= 1 ? 0 : bracketCeiling(bracket - 1);
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
