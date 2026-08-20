import { describe, expect, it } from "vitest";
import {
  BASIC_PROPERTY_DEDUCTION,
  BRACKET_RATIOS,
  CONVERSION_RATE,
  MEDIAN_INCOME,
  SIBLING_DEDUCTION_PER,
  bracketFromRatio,
  judgeBracket,
  medianIncome,
  type BracketInput,
} from "./bracket";

// 재산·부채가 없는 기본형. 각 테스트에서 필요한 값만 덮어쓴다.
function base(over: Partial<BracketInput> = {}): BracketInput {
  return {
    householdSize: 4,
    monthlyIncome: 3_000_000,
    generalProperty: 0,
    financialProperty: 0,
    carValue: 0,
    debt: 0,
    siblings: 2,
    unmarried: true,
    ...over,
  };
}

// ─────────────────────────────────────────────────────────────
// 고시값 고정 테스트 — 값 자체를 리터럴로 박는다.
// 다른 테스트는 상수를 기호로 참조하므로 값이 1년 낡아도 전부 통과한다.
// 고시가 바뀌면 여기가 먼저 깨져서, 조용히 낡는 대신 눈에 띈다.
// ─────────────────────────────────────────────────────────────
describe("고시값 고정 (2026년)", () => {
  it("기준 중위소득 — 보건복지부 고시 제2025-135호", () => {
    expect(MEDIAN_INCOME[1]).toBe(2_564_238);
    expect(MEDIAN_INCOME[2]).toBe(4_199_292);
    expect(MEDIAN_INCOME[3]).toBe(5_359_036);
    expect(MEDIAN_INCOME[4]).toBe(6_494_738);
    expect(MEDIAN_INCOME[5]).toBe(7_556_719);
    expect(MEDIAN_INCOME[6]).toBe(8_555_952);
  });

  it("기본재산액 공제는 전국 단일 6,900만원", () => {
    expect(BASIC_PROPERTY_DEDUCTION).toBe(69_000_000);
  });

  it("월 소득환산율 — 일반·자동차 4.17%/3, 금융 6.26%/3", () => {
    expect(CONVERSION_RATE.general).toBeCloseTo(0.0139, 10);
    expect(CONVERSION_RATE.car).toBeCloseTo(0.0139, 10);
    expect(CONVERSION_RATE.financial).toBeCloseTo(0.0626 / 3, 10);
  });

  it("형제·자매 공제는 1명당 40만원", () => {
    expect(SIBLING_DEDUCTION_PER).toBe(400_000);
  });

  it("구간 경계는 중위소득 30/50/70/90/100/130/150/200/300%", () => {
    expect([...BRACKET_RATIOS]).toEqual([
      30, 50, 70, 90, 100, 130, 150, 200, 300,
    ]);
  });
});

describe("기준 중위소득", () => {
  it("7인 이상은 6인 값에 가산액을 더한다", () => {
    expect(medianIncome(7)).toBe(8_555_952 + 999_233);
    expect(medianIncome(8)).toBe(8_555_952 + 999_233 * 2);
  });

  it("가구원 수가 1 미만이면 1인 가구로 본다", () => {
    expect(medianIncome(0)).toBe(MEDIAN_INCOME[1]);
  });
});

describe("구간 판정", () => {
  it("경계값은 그 구간에 포함된다", () => {
    expect(bracketFromRatio(30)).toBe(1);
    expect(bracketFromRatio(30.01)).toBe(2);
    expect(bracketFromRatio(300)).toBe(9);
    expect(bracketFromRatio(300.01)).toBe(10);
  });

  it("4인 가구 월 300만원, 재산 없음 → 2구간", () => {
    const r = judgeBracket(base());
    expect(r.recognizedIncome).toBe(3_000_000);
    expect(r.ratio).toBeCloseTo(46.19, 1);
    expect(r.bracket).toBe(2);
    expect(r.supported).toBe(true);
  });

  // 이 노트의 핵심 논지 — 소득이 같아도 재산이 있으면 구간이 올라간다.
  it("같은 소득인데 일반재산 2억이 있으면 2구간 → 4구간", () => {
    const r = judgeBracket(base({ generalProperty: 200_000_000 }));
    // (2억 − 6,900만) × 0.0139 = 1,820,900원
    expect(r.propertyConverted).toBe(1_820_900);
    expect(r.recognizedIncome).toBe(4_820_900);
    expect(r.bracket).toBe(4);
  });

  it("재산이 기본재산액 이하면 소득환산액이 0이다", () => {
    const r = judgeBracket(base({ generalProperty: 69_000_000 }));
    expect(r.propertyConverted).toBe(0);
    expect(r.bracket).toBe(2);
  });

  it("금융재산은 환산율이 높아 같은 금액이라도 더 크게 잡힌다", () => {
    const general = judgeBracket(base({ generalProperty: 169_000_000 }));
    const financial = judgeBracket(base({ financialProperty: 169_000_000 }));
    expect(financial.propertyConverted).toBeGreaterThan(
      general.propertyConverted,
    );
    // 1억 × 0.0139 = 1,390,000 vs 1억 × 0.0626/3 = 2,086,667
    expect(general.propertyConverted).toBe(1_390_000);
    expect(financial.propertyConverted).toBe(2_086_667);
  });

  it("자동차는 기본재산액 공제를 받지 못한다", () => {
    const r = judgeBracket(base({ carValue: 20_000_000 }));
    expect(r.breakdown.carConverted).toBe(278_000); // 2,000만 × 0.0139
    expect(r.propertyConverted).toBe(278_000);
  });

  it("부채는 일반재산에서 먼저 빼고 남으면 금융재산에서 뺀다", () => {
    const r = judgeBracket(
      base({
        generalProperty: 50_000_000,
        financialProperty: 100_000_000,
        debt: 30_000_000,
      }),
    );
    // 차감액 = 부채 3,000만 + 기본재산액 6,900만 = 9,900만
    // 일반재산 5,000만이 먼저 소진되고, 잔여 4,900만이 금융재산에서 빠진다
    expect(r.breakdown.generalAfterDeduction).toBe(0);
    expect(r.breakdown.financialAfterDeduction).toBe(51_000_000);
  });

  it("형제·자매 3명 이상 미혼이면 공제가 붙는다", () => {
    const three = judgeBracket(base({ siblings: 3 }));
    expect(three.siblingDeduction).toBe(400_000);
    expect(three.recognizedIncome).toBe(2_600_000);

    const two = judgeBracket(base({ siblings: 2 }));
    expect(two.siblingDeduction).toBe(0);
  });

  it("기혼이면 형제·자매 공제를 받지 못한다", () => {
    const r = judgeBracket(base({ siblings: 4, unmarried: false }));
    expect(r.siblingDeduction).toBe(0);
  });

  it("중위소득 300%를 넘으면 10구간이라 국가장학금 대상이 아니다", () => {
    const r = judgeBracket(base({ monthlyIncome: 20_000_000 }));
    expect(r.bracket).toBe(10);
    expect(r.supported).toBe(false);
    expect(r.roomToUpperBracket).toBe(0);
  });

  it("한 구간 아래로 가려면 얼마를 줄여야 하는지 알려준다", () => {
    const r = judgeBracket(base());
    // 2구간이므로 1구간 상한(중위 30% = 1,948,421)까지의 차이
    expect(r.gapToLowerBracket).toBe(3_000_000 - Math.floor(6_494_738 * 0.3));
    expect(r.roomToUpperBracket).toBe(
      Math.floor(6_494_738 * 0.5) - 3_000_000,
    );
  });

  it("1구간은 더 내려갈 곳이 없다", () => {
    const r = judgeBracket(base({ monthlyIncome: 1_000_000 }));
    expect(r.bracket).toBe(1);
    expect(r.gapToLowerBracket).toBe(0);
  });

  it("음수 입력은 0으로 처리한다", () => {
    const r = judgeBracket(
      base({ monthlyIncome: -100, generalProperty: -500, debt: -1 }),
    );
    expect(r.recognizedIncome).toBe(0);
    expect(r.bracket).toBe(1);
  });
});
