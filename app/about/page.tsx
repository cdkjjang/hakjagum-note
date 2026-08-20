import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "소개",
  description:
    "학자금노트는 학자금 지원구간과 국가장학금, 학자금대출 상환액, 교육비 세액공제를 계산기와 가이드로 정리한 생활 정보 서비스입니다.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="space-y-4 text-[15px] leading-relaxed">
      <h1 className="text-2xl font-extrabold">{SITE_NAME} 소개</h1>
      <p>
        {SITE_NAME}는 등록금에 관한 것들을 미리 확인하는 무료 도구 모음입니다.
        우리 집이 몇 구간인지, 국가장학금을 얼마나 받는지, 남는 등록금은 얼마인지,
        학자금대출은 연봉 얼마부터 갚는지, 갚은 돈으로 세금을 얼마나 돌려받는지를
        몇 가지 값만 넣어 바로 계산합니다.
      </p>
      <p>
        이 주제에서 사람들이 가장 많이 막히는 지점은 <strong>&ldquo;우리 집은 몇
        구간이냐&rdquo;</strong>입니다. 구간이 부모님 연봉으로 정해지지 않기
        때문입니다. 소득에 재산을 소득으로 환산한 값을 더한 소득인정액으로
        정해지고, 그래서 소득이 같아도 집이 있으면 구간이 두 단계 올라가기도
        합니다. 이 사이트가 재산과 부채까지 넣어 계산하는 이유입니다.
      </p>
      <p>
        모든 계산은 「한국장학재단 설립 등에 관한 법률」과 「취업 후 학자금 상환
        특별법」, 소득세법, 보건복지부의 기준 중위소득 고시, 한국장학재단의 학자금
        지원구간 산정 기준 등 공개된 근거를 따릅니다. 각 계산기 페이지에 어떤
        조문과 고시를 적용했는지 함께 표기하고, 기준이 개정되면 계산 로직과 설명을
        함께 갱신한 뒤 갱신일을 표시합니다. 고시값을 리터럴로 고정한 자동 검증
        테스트를 두어, 값이 바뀌면 테스트가 먼저 실패하도록 해 두었습니다.
      </p>
      <p>
        이 사이트의 계산은 <strong>참고용 추정치</strong>이며 세무·금융 자문이
        아닙니다. 한국장학재단은 소득·재산 자료를 공적 자료로 직접 조회하고,
        소득평가액에 항목별 공제를 더 적용하며, 재산도 시세가 아니라 공시가격·
        기준시가로 평가합니다. 그래서 여기서 나온 구간과 실제 통지가 다를 수
        있습니다. 확정 판단은 한국장학재단(1599-2000)과 국세청 홈택스에서
        확인하세요.
      </p>
      <p>
        <strong>확실하지 않은 것은 계산하지 않습니다.</strong> 국가장학금 II유형과
        교내장학금은 대학이 자체 기준으로 배분해 학교마다 금액이 다르므로 계산에
        넣지 않고 학교 장학팀 확인으로 안내합니다. 어설픈 추정이 잘못된 판단을
        부르기 때문입니다.
      </p>
      <p>
        입력한 소득·재산·급여 정보는 이용자의 브라우저 안에서만 계산되며 서버로
        전송·저장되지 않습니다. 회원가입도 없습니다. 문의는{" "}
        <a
          href="mailto:cdkjjang@gmail.com"
          className="text-accent underline-offset-4 hover:underline"
        >
          cdkjjang@gmail.com
        </a>
        으로 보내주세요.
      </p>
      <p>
        {SITE_NAME}는 생활반장(lifebanjang.com) 노트 시리즈의 하나입니다. 세금노트가
        연말정산 전반을 다룬다면 이 노트는 교육비 쪽만, 급여노트가 재직 중의 급여를
        다룬다면 이 노트는 그 급여에서 학자금대출을 얼마나 갚는지를 맡습니다. 작성
        기준과 근거 자료는{" "}
        <Link
          href="/editorial"
          className="text-accent underline-offset-4 hover:underline"
        >
          편집 원칙
        </Link>
        에 공개해 두었습니다.
      </p>
      <p>
        <Link href="/" className="text-accent underline-offset-4 hover:underline">
          홈으로 →
        </Link>
      </p>
    </div>
  );
}
