// 생활반장 허브의 상황별 가이드로 연결한다.
// 이 노트 하나로 끝나지 않는 상황(대학 진학 전체 흐름)을 순서대로 정리한 글이라,
// 등록금을 막 알아보기 시작한 사람에게 자연스러운 다음 단계가 된다.
// 노트가 허브로 보내기만 하고 못 받는 단방향 구조를 메우는 자리이기도 하다.

const HUB = {
  href: "https://lifebanjang.com/guide/university-entrance",
  title: "자녀 대학 보낼 때 — 등록금보다 주거비가 문제입니다",
  desc: "국가장학금 신청 시기·기숙사와 자취 비용·학자금대출까지 순서대로",
};

export default function HubGuideLink() {
  return (
    <section className="mt-8 rounded-2xl border border-border-soft bg-card p-5">
      <p className="text-xs font-bold text-accent-strong">이 상황 전체 흐름 보기</p>
      <a
        href={HUB.href}
        className="mt-2 block font-bold leading-snug underline-offset-4 hover:text-accent hover:underline"
      >
        {HUB.title} →
      </a>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{HUB.desc}</p>
      <p className="mt-3 text-xs text-muted">
        생활반장 허브 — 여러 사이트에 걸친 상황을 한 번에 정리한 글입니다.
      </p>
    </section>
  );
}
