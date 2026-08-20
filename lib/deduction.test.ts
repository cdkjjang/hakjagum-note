import { describe, expect, it } from "vitest";
import {
  CREDIT_RATE,
  LIMIT_FIELD_TRIP,
  LIMIT_SCHOOL,
  LIMIT_UNIFORM,
  LIMIT_UNIVERSITY,
  calculateDeduction,
  type DeductionInput,
} from "./deduction";

function input(over: Partial<DeductionInput> = {}): DeductionInput {
  return {
    selfTuition: 0,
    loanRepayment: 0,
    dependents: [],
    specialEducation: 0,
    determinedTax: 3_000_000,
    ...over,
  };
}

// ─────────────────────────────────────────────────────────────
// 고시값 고정 테스트 — 소득세법 제59조의4.
// ─────────────────────────────────────────────────────────────
describe("법정값 고정", () => {
  it("교육비 세액공제율은 15%", () => {
    expect(CREDIT_RATE).toBe(0.15);
  });

  it("한도 — 대학생 900만, 초·중·고 300만, 교복 50만, 체험학습 30만", () => {
    expect(LIMIT_UNIVERSITY).toBe(9_000_000);
    expect(LIMIT_SCHOOL).toBe(3_000_000);
    expect(LIMIT_UNIFORM).toBe(500_000);
    expect(LIMIT_FIELD_TRIP).toBe(300_000);
  });
});

// 이 계산기의 핵심 — 학자금대출은 갚을 때 공제받는다.
describe("학자금대출 상환액", () => {
  it("상환액 300만원 → 45만원을 돌려받는다", () => {
    const r = calculateDeduction(input({ loanRepayment: 3_000_000 }));
    expect(r.loanEligible).toBe(3_000_000);
    expect(r.creditBeforeCap).toBe(450_000);
    expect(r.credit).toBe(450_000);
    expect(r.creditWithLocalTax).toBe(495_000);
  });

  it("본인 교육비는 한도가 없어 대학원비도 전액 들어간다", () => {
    const r = calculateDeduction(
      input({ selfTuition: 12_000_000, loanRepayment: 3_000_000 }),
    );
    expect(r.selfEligible).toBe(15_000_000);
    expect(r.totalTrimmed).toBe(0);
    expect(r.creditBeforeCap).toBe(2_250_000);
  });

  it("결정세액이 모자라면 그만큼은 돌려받지 못한다", () => {
    const r = calculateDeduction(
      input({ loanRepayment: 10_000_000, determinedTax: 500_000 }),
    );
    expect(r.creditBeforeCap).toBe(1_500_000);
    expect(r.credit).toBe(500_000);
    expect(r.wasted).toBe(1_000_000);
  });

  it("결정세액이 0이면 공제받을 세금 자체가 없다", () => {
    const r = calculateDeduction(
      input({ loanRepayment: 5_000_000, determinedTax: 0 }),
    );
    expect(r.credit).toBe(0);
    expect(r.wasted).toBe(750_000);
  });
});

describe("부양가족 교육비 한도", () => {
  it("대학생 자녀 등록금 1,000만원은 900만원까지만 들어간다", () => {
    const r = calculateDeduction(
      input({
        dependents: [
          {
            level: "university",
            tuition: 10_000_000,
            uniform: 0,
            fieldTrip: 0,
          },
        ],
      }),
    );
    expect(r.dependentLines[0].eligible).toBe(9_000_000);
    expect(r.dependentLines[0].trimmed).toBe(1_000_000);
    expect(r.creditBeforeCap).toBe(1_350_000);
  });

  it("초·중·고는 300만원까지다", () => {
    const r = calculateDeduction(
      input({
        dependents: [
          { level: "school", tuition: 4_000_000, uniform: 0, fieldTrip: 0 },
        ],
      }),
    );
    expect(r.dependentLines[0].eligible).toBe(3_000_000);
  });

  it("교복비는 50만원까지만 한도 안에 들어간다", () => {
    const r = calculateDeduction(
      input({
        dependents: [
          { level: "school", tuition: 1_000_000, uniform: 800_000, fieldTrip: 0 },
        ],
      }),
    );
    expect(r.dependentLines[0].raw).toBe(1_500_000);
    expect(r.dependentLines[0].itemTrimmed).toBe(300_000);
  });

  it("현장체험학습비는 30만원까지다", () => {
    const r = calculateDeduction(
      input({
        dependents: [
          {
            level: "school",
            tuition: 1_000_000,
            uniform: 0,
            fieldTrip: 500_000,
          },
        ],
      }),
    );
    expect(r.dependentLines[0].raw).toBe(1_300_000);
    expect(r.dependentLines[0].itemTrimmed).toBe(200_000);
  });

  it("대학생에게는 교복·체험학습 항목이 없다", () => {
    const r = calculateDeduction(
      input({
        dependents: [
          {
            level: "university",
            tuition: 5_000_000,
            uniform: 500_000,
            fieldTrip: 300_000,
          },
        ],
      }),
    );
    expect(r.dependentLines[0].raw).toBe(5_000_000);
  });

  it("자녀가 여럿이면 한도가 각자 따로 적용된다", () => {
    const r = calculateDeduction(
      input({
        dependents: [
          { level: "school", tuition: 4_000_000, uniform: 0, fieldTrip: 0 },
          { level: "school", tuition: 4_000_000, uniform: 0, fieldTrip: 0 },
        ],
      }),
    );
    expect(r.totalEligible).toBe(6_000_000);
  });

  it("장애인 특수교육비는 한도 없이 전액이다", () => {
    const r = calculateDeduction(
      input({ specialEducation: 20_000_000, determinedTax: 10_000_000 }),
    );
    expect(r.totalEligible).toBe(20_000_000);
    expect(r.creditBeforeCap).toBe(3_000_000);
  });
});

describe("입력 방어", () => {
  it("음수는 0으로 처리한다", () => {
    const r = calculateDeduction(
      input({ selfTuition: -100, loanRepayment: -200, determinedTax: -1 }),
    );
    expect(r.totalEligible).toBe(0);
    expect(r.credit).toBe(0);
  });

  it("아무것도 입력하지 않으면 0이다", () => {
    const r = calculateDeduction(input());
    expect(r.totalEligible).toBe(0);
    expect(r.creditBeforeCap).toBe(0);
  });
});
