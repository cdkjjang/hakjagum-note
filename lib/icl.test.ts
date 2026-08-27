import { describe, expect, it } from "vitest";
import {
  EARNED_INCOME_DEDUCTION_CAP,
  LOAN_RATE,
  REPAY_RATE,
  THRESHOLD_INCOME,
  THRESHOLD_SALARY,
  calculateIcl,
  earnedIncomeDeduction,
  incomeFromSalary,
  salaryFromIncome,
  type IclInput,
} from "./icl";

// 근로소득공제 한도는 급여노트·세금노트와 같은 값이어야 한다.
// 예전에 이 파일에만 한도가 없어 고소득 구간에서 셋이 다른 답을 냈다.
describe("근로소득공제 한도 (소득세법 제47조 제1항 단서)", () => {
  it("한도는 2,000만원", () => {
    expect(EARNED_INCOME_DEDUCTION_CAP).toBe(20_000_000);
  });

  it("총급여 3억 6,250만원에서 한도에 닿고 그 위로는 고정된다", () => {
    expect(earnedIncomeDeduction(300_000_000)).toBe(18_750_000); // 한도 미달
    expect(earnedIncomeDeduction(362_500_000)).toBe(20_000_000); // 경계
    expect(earnedIncomeDeduction(500_000_000)).toBe(20_000_000); // 고정
  });

  it("한도 위에서도 총급여 ↔ 소득금액 왕복이 맞는다", () => {
    for (const gross of [300_000_000, 362_500_000, 400_000_000, 500_000_000]) {
      expect(salaryFromIncome(incomeFromSalary(gross))).toBe(gross);
    }
  });
});

function input(over: Partial<IclInput> = {}): IclInput {
  return {
    amount: 40_000_000,
    inputMode: "salary",
    studentType: "undergraduate",
    balance: 0,
    ...over,
  };
}

// ─────────────────────────────────────────────────────────────
// 고시값 고정 테스트 — 상환기준소득은 매년, 금리는 학기마다 바뀐다.
// ─────────────────────────────────────────────────────────────
describe("고시값 고정 (2026년)", () => {
  it("상환기준소득은 소득금액 1,898만원", () => {
    expect(THRESHOLD_INCOME).toBe(18_980_000);
  });

  it("상환율은 학부 20% · 대학원 25%", () => {
    expect(REPAY_RATE.undergraduate).toBe(0.2);
    expect(REPAY_RATE.graduate).toBe(0.25);
  });

  it("대출 금리는 연 1.7%", () => {
    expect(LOAN_RATE).toBe(0.017);
  });
});

// 이 노트가 반드시 설명해야 하는 것 — 기준은 연봉이 아니라 소득금액이다.
describe("총급여 ↔ 소득금액 환산", () => {
  it("상환기준소득 1,898만원은 총급여 2,851만원에 해당한다", () => {
    expect(THRESHOLD_SALARY).toBe(28_505_882);
  });

  it("환산은 왕복해도 값이 유지된다", () => {
    expect(incomeFromSalary(THRESHOLD_SALARY)).toBe(THRESHOLD_INCOME);
  });

  it("근로소득공제 — 총급여 4,000만원이면 1,125만원", () => {
    // 750만 + (4,000만 − 1,500만) × 15%
    expect(earnedIncomeDeduction(40_000_000)).toBe(11_250_000);
    expect(incomeFromSalary(40_000_000)).toBe(28_750_000);
  });

  it("총급여 500만원 이하는 70% 공제라 소득금액이 30%만 남는다", () => {
    expect(earnedIncomeDeduction(4_000_000)).toBe(2_800_000);
    expect(incomeFromSalary(4_000_000)).toBe(1_200_000);
  });

  it("공제액은 총급여를 넘지 않는다", () => {
    expect(earnedIncomeDeduction(0)).toBe(0);
    expect(incomeFromSalary(0)).toBe(0);
  });

  it("역산도 구간을 넘나들며 맞는다", () => {
    for (const salary of [6_000_000, 20_000_000, 50_000_000, 120_000_000]) {
      expect(salaryFromIncome(incomeFromSalary(salary))).toBe(salary);
    }
  });
});

describe("의무상환액", () => {
  it("총급여 4,000만원 학부생 → 연 195만 4,000원", () => {
    const r = calculateIcl(input());
    expect(r.income).toBe(28_750_000);
    expect(r.liable).toBe(true);
    expect(r.excess).toBe(9_770_000);
    expect(r.annualRepayment).toBe(1_954_000);
    expect(r.monthlyRepayment).toBe(162_830);
  });

  it("대학원생은 같은 소득에 25%라 더 많이 갚는다", () => {
    const r = calculateIcl(input({ studentType: "graduate" }));
    expect(r.annualRepayment).toBe(2_442_500);
  });

  // 자주 오해하는 지점 — 기준을 갓 넘으면 상환액이 아주 적다.
  it("기준을 조금만 넘으면 연 상환액이 몇만원에 그친다", () => {
    const r = calculateIcl(input({ amount: 29_000_000 }));
    expect(r.liable).toBe(true);
    expect(r.annualRepayment).toBeLessThan(100_000);
  });

  it("기준 이하면 상환 의무가 없다", () => {
    const r = calculateIcl(input({ amount: 25_000_000 }));
    expect(r.liable).toBe(false);
    expect(r.annualRepayment).toBe(0);
    expect(r.salaryToThreshold).toBe(THRESHOLD_SALARY - 25_000_000);
  });

  it("소득금액을 직접 입력해도 같은 결과가 나온다", () => {
    const bySalary = calculateIcl(input({ amount: 40_000_000 }));
    const byIncome = calculateIcl(
      input({ amount: 28_750_000, inputMode: "income" }),
    );
    expect(byIncome.annualRepayment).toBe(bySalary.annualRepayment);
    expect(byIncome.grossSalary).toBe(40_000_000);
  });

  it("상환기준소득 정확히 일치하면 의무가 없다", () => {
    const r = calculateIcl(input({ amount: THRESHOLD_INCOME, inputMode: "income" }));
    expect(r.excess).toBe(0);
    expect(r.liable).toBe(false);
  });
});

// 계산기 페이지(app/calc/icl/page.tsx)의 해설 표에 그대로 쓴 숫자다.
// 상수를 고치면 여기가 깨져서 본문 숫자도 함께 고쳐야 한다는 것을 알려 준다.
describe("해설 표 숫자 고정", () => {
  const rows = [
    { salary: 28_000_000, income: 18_550_000, repay: 0 },
    { salary: 29_000_000, income: 19_400_000, repay: 84_000 },
    { salary: 35_000_000, income: 24_500_000, repay: 1_104_000 },
    { salary: 40_000_000, income: 28_750_000, repay: 1_954_000 },
    { salary: 50_000_000, income: 37_750_000, repay: 3_754_000 },
  ];

  it.each(rows)(
    "총급여 $salary → 소득금액 $income · 연 상환액 $repay",
    ({ salary, income, repay }) => {
      const r = calculateIcl(input({ amount: salary }));
      expect(r.income).toBe(income);
      expect(r.annualRepayment).toBe(repay);
    },
  );
});

describe("잔액 소진 기간", () => {
  it("총급여 4,000만원으로 2,000만원을 갚으면 12년 걸린다", () => {
    const r = calculateIcl(input({ balance: 20_000_000 }));
    expect(r.yearsToClear).toBe(12);
    expect(r.totalInterest).toBeGreaterThan(0);
  });

  it("소득이 늘면 기간이 짧아진다", () => {
    const low = calculateIcl(input({ amount: 40_000_000, balance: 20_000_000 }));
    const high = calculateIcl(input({ amount: 70_000_000, balance: 20_000_000 }));
    expect(high.yearsToClear!).toBeLessThan(low.yearsToClear!);
  });

  // 이자만 쌓이고 원금이 줄지 않는 경우 — 숫자를 지어내지 않고 null로 돌려준다.
  it("상환 의무가 없으면 잔액이 줄지 않으므로 기간을 추정하지 않는다", () => {
    const r = calculateIcl(input({ amount: 25_000_000, balance: 20_000_000 }));
    expect(r.yearsToClear).toBeNull();
    expect(r.totalInterest).toBeNull();
  });

  it("상환액이 이자보다 적으면 기간을 추정하지 않는다", () => {
    // 연 상환액이 매우 적은데 잔액이 크면 이자가 상환액을 넘어선다
    const r = calculateIcl(input({ amount: 29_000_000, balance: 300_000_000 }));
    expect(r.yearsToClear).toBeNull();
  });

  it("잔액을 입력하지 않으면 추정하지 않는다", () => {
    const r = calculateIcl(input({ balance: 0 }));
    expect(r.yearsToClear).toBeNull();
  });
});
