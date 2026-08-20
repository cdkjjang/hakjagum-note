// 국가장학금 예상 지원액.
//
// 이 계산기가 반드시 드러내야 하는 것: **지원금은 등록금을 넘지 못한다.**
// "1구간이면 600만원"이라는 말이 널리 퍼져 있지만, 국가장학금은 등록금을 대신 내주는
// 제도라 등록금보다 많이 받을 수 없다. 등록금이 연 400만원인 국립대 1구간 학생은
// 600만원이 아니라 400만원을 받는다. 반대로 등록금 900만원인 사립대 1구간 학생은
// 600만원을 받고 300만원을 스스로 내야 한다. 같은 1구간인데 자기 부담이 정반대다.
//
// ⚠️ 갱신 대상 — 지원단가는 교육부가 예산으로 정한다(2025년 2학기부터 인상된 단가 적용).
//    9구간은 2026년에 신설됐다. 값을 고치면 `scholarship.test.ts`가 먼저 깨진다.

import { judgeBracket, type BracketInput } from "./bracket";

/** 다자녀 가구 안에서의 지위. 지원단가표가 달라진다. */
export type ChildOrder = "none" | "firstSecond" | "thirdPlus";

/** 기초생활수급자·차상위계층 여부. 구간과 별개로 우선한다. */
export type WelfareType = "none" | "basic" | "nearPoor";

export interface ScholarshipInput {
  bracket: BracketInput;
  /** 연간 등록금(입학금 포함). 지원액의 천장이 된다. */
  annualTuition: number;
  /** 다자녀 지위 */
  childOrder: ChildOrder;
  /** 기초·차상위 여부 */
  welfare: WelfareType;
  /** 직전 학기 성적(100점 만점 환산). 신입생·편입생은 undefined */
  gradeScore?: number;
  /** 직전 학기 이수 학점. 신입생·편입생은 undefined */
  credits?: number;
}

export interface ScholarshipResult {
  bracket: number;
  /** 구간·유형으로 정해지는 연간 지원단가. 전액 지원이면 등록금과 같다 */
  unitAmount: number;
  /** 전액 지원 대상인지 */
  fullSupport: boolean;
  /** 실제 예상 지원액 = min(단가, 등록금) */
  annualAmount: number;
  /** 학기당 예상 지원액 */
  semesterAmount: number;
  /** 지원 후 스스로 내야 하는 연간 금액 */
  selfPay: number;
  /** 단가가 등록금보다 커서 잘린 금액. 0이면 잘리지 않았다 */
  cappedBy: number;
  /** 적용된 지원단가표의 이름 */
  tableName: string;
  /** 성적 요건 판정 */
  grade: GradeCheck;
  /** 지원 대상이 아닌 이유. 대상이면 null */
  ineligibleReason: string | null;
}

export interface GradeCheck {
  /** 판정을 내릴 수 있었는지 (신입생·편입생은 false) */
  evaluated: boolean;
  /** 요건을 충족하는지 */
  passed: boolean;
  /** 이 학생에게 적용되는 최소 성적 */
  requiredScore: number;
  /** 최소 이수 학점 */
  requiredCredits: number;
  /** C학점 경고제 대상인지 (기초·차상위·1~3구간) */
  warningEligible: boolean;
  message: string;
}

/** 일반 학생 I유형 연간 지원단가 (2026년, 원). 인덱스는 구간 − 1. */
export const UNIT_GENERAL = [
  6_000_000, // 1구간
  6_000_000, // 2구간
  6_000_000, // 3구간
  4_400_000, // 4구간
  4_400_000, // 5구간
  4_400_000, // 6구간
  3_600_000, // 7구간
  3_600_000, // 8구간
  1_000_000, // 9구간 — 2026년 신설
] as const;

/** 다자녀 첫째·둘째 연간 지원단가 (2026년, 원). */
export const UNIT_MULTI_FIRST_SECOND = [
  6_100_000, 6_100_000, 6_100_000, 5_050_000, 5_050_000, 5_050_000, 4_650_000,
  4_650_000, 1_350_000,
] as const;

/** 다자녀 셋째 이상 — 1~8구간 전액, 9구간 200만원. */
export const UNIT_MULTI_THIRD_NINTH = 2_000_000;

/** 일반 성적 요건: 직전 학기 12학점 이상 + 100점 만점 80점(B학점) 이상. */
export const MIN_CREDITS = 12;
export const MIN_SCORE = 80;
/** 기초·차상위·1~3구간은 C학점(70점) 경고제로 2회까지 구제된다. */
export const WARNING_SCORE = 70;

function checkGrade(
  bracket: number,
  welfare: WelfareType,
  gradeScore?: number,
  credits?: number,
): GradeCheck {
  const warningEligible = welfare !== "none" || bracket <= 3;
  const requiredScore = warningEligible ? WARNING_SCORE : MIN_SCORE;

  if (gradeScore === undefined || credits === undefined) {
    return {
      evaluated: false,
      passed: true,
      requiredScore,
      requiredCredits: MIN_CREDITS,
      warningEligible,
      message:
        "신입생·편입생·재입학생은 첫 학기에 한해 성적 요건을 보지 않습니다. 직전 학기 성적을 입력하면 판정해 드립니다.",
    };
  }

  const creditsOk = credits >= MIN_CREDITS;
  const scoreOk = gradeScore >= requiredScore;
  const passed = creditsOk && scoreOk;

  let message: string;
  if (passed && warningEligible && gradeScore < MIN_SCORE) {
    message = `80점에는 못 미치지만 C학점 경고제 대상이라 지원받을 수 있습니다. 다만 경고는 재학 중 두 번까지만 쓸 수 있으니 다음 학기에는 80점을 넘기는 편이 안전합니다.`;
  } else if (passed) {
    message = "성적 요건을 충족합니다.";
  } else if (!creditsOk) {
    message = `직전 학기 이수 학점이 ${MIN_CREDITS}학점에 못 미칩니다. 성적이 아무리 좋아도 학점 수가 모자라면 지원받지 못합니다.`;
  } else {
    message = `직전 학기 성적이 ${requiredScore}점에 못 미칩니다. 이 학생에게 적용되는 기준은 ${requiredScore}점입니다.`;
  }

  return {
    evaluated: true,
    passed,
    requiredScore,
    requiredCredits: MIN_CREDITS,
    warningEligible,
    message,
  };
}

export function estimateScholarship(
  input: ScholarshipInput,
): ScholarshipResult {
  const { bracket } = judgeBracket(input.bracket);
  const tuition = Math.max(0, input.annualTuition);
  const grade = checkGrade(
    bracket,
    input.welfare,
    input.gradeScore,
    input.credits,
  );

  // 구간 밖(10구간)이면 소득 요건 미달이다. 기초·차상위는 이 판정보다 우선한다.
  const outOfBracket = bracket > 9 && input.welfare === "none";

  let unitAmount: number;
  let fullSupport = false;
  let tableName: string;

  if (input.welfare !== "none") {
    // 기초생활수급자·차상위계층은 구간과 무관하게 등록금 전액이다.
    unitAmount = tuition;
    fullSupport = true;
    tableName =
      input.welfare === "basic" ? "기초생활수급자 (전액)" : "차상위계층 (전액)";
  } else if (input.childOrder === "thirdPlus") {
    if (bracket <= 8) {
      unitAmount = tuition;
      fullSupport = true;
      tableName = "다자녀 셋째 이상 · 1~8구간 (전액)";
    } else {
      unitAmount = UNIT_MULTI_THIRD_NINTH;
      tableName = "다자녀 셋째 이상 · 9구간";
    }
  } else if (input.childOrder === "firstSecond") {
    unitAmount = outOfBracket ? 0 : UNIT_MULTI_FIRST_SECOND[bracket - 1];
    tableName = "다자녀 첫째·둘째";
  } else {
    unitAmount = outOfBracket ? 0 : UNIT_GENERAL[bracket - 1];
    tableName = "국가장학금 I유형 (일반)";
  }

  let ineligibleReason: string | null = null;
  if (outOfBracket) {
    ineligibleReason =
      "소득인정액이 기준 중위소득 300%를 넘어 학자금 지원구간 밖입니다. 국가장학금 I유형은 9구간 이하만 받습니다.";
  } else if (!grade.passed) {
    ineligibleReason = grade.message;
  }

  const uncapped = ineligibleReason ? 0 : unitAmount;
  const annualAmount = Math.min(uncapped, tuition);
  const cappedBy = Math.max(0, uncapped - tuition);

  return {
    bracket,
    unitAmount,
    fullSupport,
    annualAmount,
    semesterAmount: Math.round(annualAmount / 2),
    selfPay: Math.max(0, tuition - annualAmount),
    cappedBy,
    tableName,
    grade,
    ineligibleReason,
  };
}
