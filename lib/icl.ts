// 취업 후 상환 학자금대출(ICL) 의무상환액.
//
// 이 계산기가 반드시 드러내야 하는 것: **기준은 연봉이 아니라 소득금액이다.**
// "연 3천만원 벌면 갚는다"는 말이 흔한데, 상환기준소득 1,898만원은 총급여가 아니라
// 근로소득공제를 뺀 뒤의 소득금액이다. 총급여로 환산하면 2,851만원이라 체감이 꽤 다르다.
// 그리고 갚는 것은 초과분의 20%일 뿐이라, 기준을 갓 넘으면 연 상환액이 몇만원에 그친다.
//
// ⚠️ 갱신 대상
//   · 상환기준소득 — 매년 국세청 고시(전년도 귀속 소득 기준). 2026년 1,898만원
//   · 대출 금리 — 학기마다 교육부가 고시. 2026년 1학기 연 1.7%
//   값을 고치면 `icl.test.ts`의 리터럴 고정 테스트가 먼저 깨진다.

/** 2026년 상환기준소득 — **소득금액** 기준. 총급여가 아니다. */
export const THRESHOLD_INCOME = 18_980_000;

/** 의무상환 비율. 학부는 초과분의 20%, 대학원은 25%. */
export const REPAY_RATE = { undergraduate: 0.2, graduate: 0.25 } as const;

/** 2026년 1학기 학자금대출 금리 (연). */
export const LOAN_RATE = 0.017;

export type StudentType = "undergraduate" | "graduate";

/**
 * 근로소득공제 구간 (소득세법 제47조).
 * 총급여 → 근로소득금액을 구하는 데 쓴다. ICL 상환기준소득이 소득금액 기준이라
 * "내 연봉이면 갚아야 하나"에 답하려면 이 환산이 반드시 필요하다.
 */
export const EARNED_INCOME_DEDUCTION = [
  { upTo: 5_000_000, base: 0, rate: 0.7, from: 0 },
  { upTo: 15_000_000, base: 3_500_000, rate: 0.4, from: 5_000_000 },
  { upTo: 45_000_000, base: 7_500_000, rate: 0.15, from: 15_000_000 },
  { upTo: 100_000_000, base: 12_000_000, rate: 0.05, from: 45_000_000 },
  { upTo: Infinity, base: 14_750_000, rate: 0.02, from: 100_000_000 },
] as const;

/** 총급여 → 근로소득공제액. */
export function earnedIncomeDeduction(grossSalary: number): number {
  const gross = Math.max(0, grossSalary);
  const tier =
    EARNED_INCOME_DEDUCTION.find((t) => gross <= t.upTo) ??
    EARNED_INCOME_DEDUCTION[EARNED_INCOME_DEDUCTION.length - 1];
  const deduction = tier.base + (gross - tier.from) * tier.rate;
  // 공제액은 총급여를 넘을 수 없다(총급여 500만원 이하에서 70% 적용 시 자동 충족).
  return Math.min(gross, Math.round(deduction));
}

/** 총급여 → 근로소득금액(= 소득금액). */
export function incomeFromSalary(grossSalary: number): number {
  const gross = Math.max(0, grossSalary);
  return Math.max(0, gross - earnedIncomeDeduction(gross));
}

/**
 * 근로소득금액 → 총급여 (역산).
 * 상환기준소득 1,898만원이 연봉으로 얼마인지 보여주기 위한 것이다.
 * 구간별 1차식이라 닫힌 형태로 풀린다.
 */
export function salaryFromIncome(income: number): number {
  const target = Math.max(0, income);
  for (const tier of EARNED_INCOME_DEDUCTION) {
    // 이 구간의 총급여 G에 대해 소득금액 = G − base − (G − from) × rate
    //                                = G(1 − rate) − base + from × rate
    const gross = (target + tier.base - tier.from * tier.rate) / (1 - tier.rate);
    if (gross <= tier.upTo) return Math.round(gross);
  }
  return Math.round(target);
}

export interface IclInput {
  /** 연간 소득금액 또는 총급여 — `inputMode`로 구분한다 */
  amount: number;
  inputMode: "salary" | "income";
  studentType: StudentType;
  /** 남은 대출 잔액(원금 + 누적이자). 소진 기간 추정에 쓴다. 0이면 추정하지 않는다 */
  balance: number;
}

export interface IclResult {
  /** 연간 소득금액 */
  income: number;
  /** 총급여 환산액 */
  grossSalary: number;
  /** 상환 의무가 생겼는지 */
  liable: boolean;
  /** 상환기준소득 초과분 */
  excess: number;
  /** 적용 상환율 */
  rate: number;
  /** 연간 의무상환액 */
  annualRepayment: number;
  /** 월 환산 의무상환액 (원천공제되는 대략적인 금액) */
  monthlyRepayment: number;
  /** 소득금액 대비 의무상환액 비율(%) */
  burdenRatio: number;
  /** 상환기준소득에 해당하는 총급여 — "연봉 얼마부터인가"의 답 */
  thresholdSalary: number;
  /** 상환 의무가 없다면, 총급여가 얼마 더 늘면 생기는지 */
  salaryToThreshold: number;
  /** 지금 소득이 유지될 때 잔액이 소진되기까지 걸리는 햇수. 추정 불가면 null */
  yearsToClear: number | null;
  /** 그동안 붙는 이자 총액. 추정 불가면 null */
  totalInterest: number | null;
}

/** 상환기준소득에 해당하는 총급여. */
export const THRESHOLD_SALARY = salaryFromIncome(THRESHOLD_INCOME);

export function calculateIcl(input: IclInput): IclResult {
  const grossSalary =
    input.inputMode === "salary"
      ? Math.max(0, input.amount)
      : salaryFromIncome(Math.max(0, input.amount));
  const income =
    input.inputMode === "income"
      ? Math.max(0, input.amount)
      : incomeFromSalary(Math.max(0, input.amount));

  const excess = Math.max(0, income - THRESHOLD_INCOME);
  const rate = REPAY_RATE[input.studentType];
  const liable = excess > 0;
  // 의무상환액은 10원 미만을 절사한다.
  const annualRepayment = Math.floor((excess * rate) / 10) * 10;

  const balance = Math.max(0, input.balance);
  let yearsToClear: number | null = null;
  let totalInterest: number | null = null;

  if (balance > 0) {
    if (annualRepayment <= 0) {
      // 갚는 금액이 없으면 이자만 쌓인다 — 영원히 줄지 않는다.
      yearsToClear = null;
      totalInterest = null;
    } else {
      let remaining = balance;
      let interest = 0;
      let years = 0;
      // 연 1회 이자를 붙이고 의무상환액을 낸다. 이자가 상환액보다 크면 줄지 않으므로
      // 50년에서 끊는다.
      while (remaining > 0 && years < 50) {
        const yearInterest = remaining * LOAN_RATE;
        const next = remaining + yearInterest - annualRepayment;
        if (next >= remaining) {
          years = -1;
          break;
        }
        interest += yearInterest;
        remaining = next;
        years += 1;
      }
      if (years >= 0 && remaining <= 0) {
        yearsToClear = years;
        totalInterest = Math.round(interest);
      }
    }
  }

  return {
    income,
    grossSalary,
    liable,
    excess,
    rate,
    annualRepayment,
    monthlyRepayment: Math.floor(annualRepayment / 12 / 10) * 10,
    burdenRatio: income > 0 ? (annualRepayment / income) * 100 : 0,
    thresholdSalary: THRESHOLD_SALARY,
    salaryToThreshold: Math.max(0, THRESHOLD_SALARY - grossSalary),
    yearsToClear,
    totalInterest,
  };
}
