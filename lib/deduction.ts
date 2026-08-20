// 교육비 세액공제.
//
// 이 계산기가 반드시 드러내야 하는 것 둘.
//
// ① **학자금대출은 갚을 때 공제받는다.** 등록금을 낸 해가 아니라 원리금을 상환한 해에
//    본인 교육비로 넣는다. 재학 중에는 소득이 없어 공제받을 게 없으니, 제도가 그렇게
//    설계돼 있다. 취업하고 나서 이걸 몰라 놓치는 사람이 많다.
// ② **국가장학금으로 낸 등록금은 공제 대상이 아니다.** 공제는 내가 부담한 금액에만
//    적용된다. 등록금 700만원 중 600만원을 장학금으로 받았다면 100만원만 넣는다.
//    이걸 700만원으로 넣으면 나중에 가산세와 함께 추징된다.
//
// ⚠️ 갱신 대상 — 공제율·한도는 소득세법 제59조의4 개정 시. 값을 고치면
//    `deduction.test.ts`의 리터럴 고정 테스트가 먼저 깨진다.

/** 교육비 세액공제율 — 15%. */
export const CREDIT_RATE = 0.15;

/** 대학생 1명당 연 한도. 본인에게는 한도가 없다. */
export const LIMIT_UNIVERSITY = 9_000_000;
/** 취학전 아동·초·중·고 1명당 연 한도. */
export const LIMIT_SCHOOL = 3_000_000;
/** 교복구입비는 중·고생 1명당 연 50만원까지만 위 한도에 넣을 수 있다. */
export const LIMIT_UNIFORM = 500_000;
/** 현장체험학습비는 1명당 연 30만원까지. */
export const LIMIT_FIELD_TRIP = 300_000;

export type DependentLevel = "preschool" | "school" | "university";

export interface DependentEducation {
  level: DependentLevel;
  /** 수업료·급식비·교과서대·방과후 수강료 등 */
  tuition: number;
  /** 교복구입비 (중·고생만) */
  uniform: number;
  /** 현장체험학습비 */
  fieldTrip: number;
}

export interface DeductionInput {
  /** 본인이 부담한 대학·대학원 등록금 — 장학금으로 충당한 금액은 제외 */
  selfTuition: number;
  /** 올해 상환한 학자금대출 원리금 */
  loanRepayment: number;
  /** 부양가족 교육비 */
  dependents: DependentEducation[];
  /** 장애인 특수교육비 — 한도 없이 전액 대상 */
  specialEducation: number;
  /** 올해 결정세액. 세액공제는 이 금액을 넘겨 돌려받지 못한다 */
  determinedTax: number;
}

export interface DependentLine {
  level: DependentLevel;
  limit: number;
  /** 한도 적용 전 합계 */
  raw: number;
  /** 한도 적용 후 공제 대상액 */
  eligible: number;
  /** 한도에 걸려 잘린 금액 */
  trimmed: number;
  /** 항목별 한도(교복·체험학습)에 걸려 잘린 금액 */
  itemTrimmed: number;
}

export interface DeductionResult {
  /** 본인 교육비 공제 대상액 (등록금 + 학자금대출 상환액, 한도 없음) */
  selfEligible: number;
  /** 그중 학자금대출 상환액 몫 */
  loanEligible: number;
  dependentLines: DependentLine[];
  specialEducation: number;
  /** 전체 공제 대상액 */
  totalEligible: number;
  /** 한도에 걸려 잘린 총액 */
  totalTrimmed: number;
  /** 산출된 세액공제액 (결정세액 한도 적용 전) */
  creditBeforeCap: number;
  /** 실제로 줄어드는 세금 */
  credit: number;
  /** 결정세액이 모자라 못 받는 금액 */
  wasted: number;
  /** 지방소득세까지 포함한 체감 절세액 (세액공제 × 1.1) */
  creditWithLocalTax: number;
}

const LIMIT_BY_LEVEL: Record<DependentLevel, number> = {
  preschool: LIMIT_SCHOOL,
  school: LIMIT_SCHOOL,
  university: LIMIT_UNIVERSITY,
};

export function calculateDeduction(input: DeductionInput): DeductionResult {
  const selfTuition = Math.max(0, input.selfTuition);
  const loanEligible = Math.max(0, input.loanRepayment);
  // 본인 교육비는 대학원비까지 한도 없이 전액이다. 학자금대출 상환액도 여기 들어간다.
  const selfEligible = selfTuition + loanEligible;

  const dependentLines: DependentLine[] = input.dependents.map((d) => {
    const limit = LIMIT_BY_LEVEL[d.level];
    const tuition = Math.max(0, d.tuition);

    // 교복·현장체험학습비는 각각 자체 한도가 먼저 걸린다.
    const uniformRaw = Math.max(0, d.uniform);
    const fieldTripRaw = Math.max(0, d.fieldTrip);
    const uniform =
      d.level === "school" ? Math.min(uniformRaw, LIMIT_UNIFORM) : 0;
    const fieldTrip =
      d.level === "university" ? 0 : Math.min(fieldTripRaw, LIMIT_FIELD_TRIP);
    const itemTrimmed =
      uniformRaw - uniform + (d.level === "university" ? 0 : fieldTripRaw - fieldTrip);

    const raw = tuition + uniform + fieldTrip;
    const eligible = Math.min(raw, limit);

    return {
      level: d.level,
      limit,
      raw,
      eligible,
      trimmed: Math.max(0, raw - eligible),
      itemTrimmed: Math.max(0, itemTrimmed),
    };
  });

  const special = Math.max(0, input.specialEducation);
  const dependentEligible = dependentLines.reduce((s, l) => s + l.eligible, 0);
  const totalEligible = selfEligible + dependentEligible + special;
  const totalTrimmed = dependentLines.reduce(
    (s, l) => s + l.trimmed + l.itemTrimmed,
    0,
  );

  const creditBeforeCap = Math.floor(totalEligible * CREDIT_RATE);
  const determinedTax = Math.max(0, input.determinedTax);
  const credit = Math.min(creditBeforeCap, determinedTax);

  return {
    selfEligible,
    loanEligible,
    dependentLines,
    specialEducation: special,
    totalEligible,
    totalTrimmed,
    creditBeforeCap,
    credit,
    wasted: Math.max(0, creditBeforeCap - credit),
    creditWithLocalTax: Math.round(credit * 1.1),
  };
}
