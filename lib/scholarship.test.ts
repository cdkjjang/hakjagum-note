import { describe, expect, it } from "vitest";
import type { BracketInput } from "./bracket";
import {
  MIN_CREDITS,
  MIN_SCORE,
  UNIT_GENERAL,
  UNIT_MULTI_FIRST_SECOND,
  UNIT_MULTI_THIRD_NINTH,
  WARNING_SCORE,
  estimateScholarship,
  type ScholarshipInput,
} from "./scholarship";

/** 월소득만으로 구간을 만든다. 4인 가구·재산 없음 기준. */
function household(monthlyIncome: number): BracketInput {
  return {
    householdSize: 4,
    monthlyIncome,
    generalProperty: 0,
    financialProperty: 0,
    carValue: 0,
    debt: 0,
    siblings: 2,
    unmarried: true,
  };
}

// 4인 가구 기준 중위소득 6,494,738원에 대응하는 월소득
const INCOME_1 = 1_500_000; // 23.1% → 1구간
const INCOME_5 = 6_400_000; // 98.5% → 5구간
const INCOME_8 = 12_500_000; // 192.5% → 8구간
const INCOME_9 = 18_000_000; // 277.1% → 9구간
const INCOME_OUT = 25_000_000; // 385% → 10구간

function input(over: Partial<ScholarshipInput> = {}): ScholarshipInput {
  return {
    bracket: household(INCOME_1),
    annualTuition: 8_000_000,
    childOrder: "none",
    welfare: "none",
    gradeScore: 85,
    credits: 15,
    ...over,
  };
}

// ─────────────────────────────────────────────────────────────
// 고시값 고정 테스트 — 지원단가는 교육부 예산으로 정해진다.
// ─────────────────────────────────────────────────────────────
describe("지원단가 고정 (2026년)", () => {
  it("I유형 일반 — 1~3구간 600만, 4~6구간 440만, 7~8구간 360만, 9구간 100만", () => {
    expect([...UNIT_GENERAL]).toEqual([
      6_000_000, 6_000_000, 6_000_000, 4_400_000, 4_400_000, 4_400_000,
      3_600_000, 3_600_000, 1_000_000,
    ]);
  });

  it("다자녀 첫째·둘째 — 610/505/465/135만", () => {
    expect([...UNIT_MULTI_FIRST_SECOND]).toEqual([
      6_100_000, 6_100_000, 6_100_000, 5_050_000, 5_050_000, 5_050_000,
      4_650_000, 4_650_000, 1_350_000,
    ]);
  });

  it("다자녀 셋째 이상 9구간은 200만원", () => {
    expect(UNIT_MULTI_THIRD_NINTH).toBe(2_000_000);
  });

  it("성적 요건은 12학점·80점, 경고제는 70점", () => {
    expect(MIN_CREDITS).toBe(12);
    expect(MIN_SCORE).toBe(80);
    expect(WARNING_SCORE).toBe(70);
  });
});

describe("등록금이 지원액의 천장이다 — 이 계산기의 핵심", () => {
  it("등록금 400만원인 1구간 학생은 600만원이 아니라 400만원을 받는다", () => {
    const r = estimateScholarship(input({ annualTuition: 4_000_000 }));
    expect(r.bracket).toBe(1);
    expect(r.unitAmount).toBe(6_000_000);
    expect(r.annualAmount).toBe(4_000_000);
    expect(r.cappedBy).toBe(2_000_000);
    expect(r.selfPay).toBe(0);
  });

  it("등록금 900만원인 1구간 학생은 600만원을 받고 300만원을 낸다", () => {
    const r = estimateScholarship(input({ annualTuition: 9_000_000 }));
    expect(r.annualAmount).toBe(6_000_000);
    expect(r.cappedBy).toBe(0);
    expect(r.selfPay).toBe(3_000_000);
  });

  it("학기당 지원액은 연간의 절반이다", () => {
    const r = estimateScholarship(input({ annualTuition: 9_000_000 }));
    expect(r.semesterAmount).toBe(3_000_000);
  });
});

describe("구간별 지원액", () => {
  it("5구간 → 440만원", () => {
    const r = estimateScholarship(input({ bracket: household(INCOME_5) }));
    expect(r.bracket).toBe(5);
    expect(r.annualAmount).toBe(4_400_000);
  });

  it("8구간 → 360만원", () => {
    const r = estimateScholarship(input({ bracket: household(INCOME_8) }));
    expect(r.bracket).toBe(8);
    expect(r.annualAmount).toBe(3_600_000);
  });

  it("9구간은 2026년 신설이라 100만원뿐이다", () => {
    const r = estimateScholarship(input({ bracket: household(INCOME_9) }));
    expect(r.bracket).toBe(9);
    expect(r.annualAmount).toBe(1_000_000);
    expect(r.selfPay).toBe(7_000_000);
  });

  it("10구간은 지원 대상이 아니다", () => {
    const r = estimateScholarship(input({ bracket: household(INCOME_OUT) }));
    expect(r.bracket).toBe(10);
    expect(r.annualAmount).toBe(0);
    expect(r.ineligibleReason).toContain("300%");
  });
});

describe("기초·차상위와 다자녀", () => {
  it("기초생활수급자는 구간과 무관하게 등록금 전액이다", () => {
    const r = estimateScholarship(
      input({ bracket: household(INCOME_9), welfare: "basic" }),
    );
    expect(r.fullSupport).toBe(true);
    expect(r.annualAmount).toBe(8_000_000);
    expect(r.selfPay).toBe(0);
  });

  it("차상위계층도 전액이다", () => {
    const r = estimateScholarship(input({ welfare: "nearPoor" }));
    expect(r.annualAmount).toBe(8_000_000);
  });

  it("다자녀 첫째·둘째는 같은 구간에서 일반보다 많이 받는다", () => {
    const normal = estimateScholarship(input({ bracket: household(INCOME_5) }));
    const multi = estimateScholarship(
      input({ bracket: household(INCOME_5), childOrder: "firstSecond" }),
    );
    expect(normal.annualAmount).toBe(4_400_000);
    expect(multi.annualAmount).toBe(5_050_000);
  });

  it("다자녀 셋째 이상은 8구간까지 전액이다", () => {
    const r = estimateScholarship(
      input({ bracket: household(INCOME_8), childOrder: "thirdPlus" }),
    );
    expect(r.fullSupport).toBe(true);
    expect(r.annualAmount).toBe(8_000_000);
  });

  it("다자녀 셋째 이상이어도 9구간은 200만원이다", () => {
    const r = estimateScholarship(
      input({ bracket: household(INCOME_9), childOrder: "thirdPlus" }),
    );
    expect(r.fullSupport).toBe(false);
    expect(r.annualAmount).toBe(2_000_000);
  });
});

describe("성적 요건", () => {
  it("12학점에 못 미치면 성적이 좋아도 탈락한다", () => {
    const r = estimateScholarship(input({ credits: 9, gradeScore: 100 }));
    expect(r.grade.passed).toBe(false);
    expect(r.annualAmount).toBe(0);
    expect(r.ineligibleReason).toContain("학점");
  });

  it("1~3구간은 70점 경고제로 구제된다", () => {
    const r = estimateScholarship(input({ gradeScore: 72 }));
    expect(r.grade.warningEligible).toBe(true);
    expect(r.grade.requiredScore).toBe(70);
    expect(r.grade.passed).toBe(true);
    expect(r.grade.message).toContain("경고");
    expect(r.annualAmount).toBe(6_000_000);
  });

  it("4구간 이상은 경고제가 없어 80점을 넘어야 한다", () => {
    const r = estimateScholarship(
      input({ bracket: household(INCOME_5), gradeScore: 72 }),
    );
    expect(r.grade.warningEligible).toBe(false);
    expect(r.grade.requiredScore).toBe(80);
    expect(r.grade.passed).toBe(false);
    expect(r.annualAmount).toBe(0);
  });

  it("기초·차상위는 구간과 무관하게 경고제 대상이다", () => {
    const r = estimateScholarship(
      input({ bracket: household(INCOME_8), welfare: "basic", gradeScore: 72 }),
    );
    expect(r.grade.warningEligible).toBe(true);
    expect(r.annualAmount).toBe(8_000_000);
  });

  it("신입생은 성적을 입력하지 않으면 판정을 보류하고 지원액을 보여준다", () => {
    const r = estimateScholarship(
      input({ gradeScore: undefined, credits: undefined }),
    );
    expect(r.grade.evaluated).toBe(false);
    expect(r.grade.passed).toBe(true);
    expect(r.annualAmount).toBe(6_000_000);
  });
});
