/**
 * 이 노트의 계산기를 쓴 사람이 **다음에 마주칠 질문**과, 그 답이 있는
 * 다른 노트의 계산기.
 *
 * ⚠️ 이 파일은 워크스페이스 생성기로 만든다. 손으로 고치면 다음 생성 때 덮인다.
 *
 * 규칙 (components/RelatedTools.tsx 주석 참조):
 *   - 계산기마다 최대 3개. 페이지마다 내용이 달라야 한다.
 *   - 같은 노트 안의 계산기는 넣지 않는다.
 *   - "관련 계산기"가 아니라 그 사람이 실제로 다음에 겪는 일로 적는다.
 */
export type RelatedTool = {
  /** 그 사람이 다음에 던지는 질문 — 링크 텍스트가 된다 */
  question: string;
  /** 어느 노트인지 */
  note: string;
  /** 어떤 계산기인지 */
  tool: string;
  /** 전체 URL (다른 도메인이므로 절대 경로) */
  href: string;
};

export const RELATED_TOOLS: Record<string, RelatedTool[]> = {
  "/calc/bracket": [
    {
      question: "부모님 연봉이면 실수령액이 얼마인가요",
      note: "급여노트",
      tool: "연봉 실수령액 계산기",
      href: "https://salary.lifebanjang.com/calc/salary",
    },
    {
      question: "학생도 피부양자로 남을 수 있나요",
      note: "건강보험노트",
      tool: "피부양자 자격 계산기",
      href: "https://health.lifebanjang.com/calc/dependent",
    },
    {
      question: "청년 목돈 마련 제도는 무엇이 있나요",
      note: "청년정책노트",
      tool: "청년내일저축계좌 계산기",
      href: "https://youth.lifebanjang.com/calc/savings",
    },
  ],
  "/calc/scholarship": [
    {
      question: "자취하면 월세 지원을 받을 수 있나요",
      note: "청년정책노트",
      tool: "청년 월세지원 계산기",
      href: "https://youth.lifebanjang.com/calc/rent",
    },
    {
      question: "아르바이트 주휴수당은 얼마인가요",
      note: "급여노트",
      tool: "시급·주휴수당 계산기",
      href: "https://salary.lifebanjang.com/calc/hourly",
    },
    {
      question: "부모님 연말정산에 영향이 있나요",
      note: "세금노트",
      tool: "연말정산 계산기",
      href: "https://tax.lifebanjang.com/calc/year-end",
    },
  ],
  "/calc/icl": [
    {
      question: "제 연봉이면 실수령액이 얼마인가요",
      note: "급여노트",
      tool: "연봉 실수령액 계산기",
      href: "https://salary.lifebanjang.com/calc/salary",
    },
    {
      question: "학자금대출도 DSR에 잡히나요",
      note: "대출노트",
      tool: "DSR 계산기",
      href: "https://loan.lifebanjang.com/calc/dsr",
    },
    {
      question: "갚은 원리금을 연말정산에서 공제받나요",
      note: "세금노트",
      tool: "연말정산 계산기",
      href: "https://tax.lifebanjang.com/calc/year-end",
    },
  ],
  "/calc/deduction": [
    {
      question: "연말정산 전체로는 얼마를 돌려받나요",
      note: "세금노트",
      tool: "연말정산 계산기",
      href: "https://tax.lifebanjang.com/calc/year-end",
    },
    {
      question: "제 연봉이면 실수령액이 얼마인가요",
      note: "급여노트",
      tool: "연봉 실수령액 계산기",
      href: "https://salary.lifebanjang.com/calc/salary",
    },
    {
      question: "연금저축도 함께 넣으면 어떤가요",
      note: "연금노트",
      tool: "연금저축 세액공제 계산기",
      href: "https://pension.lifebanjang.com/calc/savings",
    },
  ],
};
