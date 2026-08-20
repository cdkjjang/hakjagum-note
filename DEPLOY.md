# 배포 — 학자금노트 (hakjagum.lifebanjang.com)

생활반장 노트 시리즈의 배포 방식을 그대로 따른다. **배포는 `git push origin main`만 사용**(Vercel 자동 배포). CLI 직접 배포 금지.

> **순서를 지킬 것.** 퇴사노트·상속노트·건강보험노트에서 세 번 검증된 방법이다.
> 도메인이 붙기 전에 다른 사이트의 크로스링크부터 배포하면 18개 사이트 푸터 =
> 2,000여 페이지에 죽은 링크가 생긴다. 그래서 **지금은 다른 노트에 hakjagum 항목을
> 아예 넣지 않은 상태**다. 1~3단계로 도메인을 띄운 뒤 4단계에서 한 번에 넣는다.

## 0. 애드센스 승인 전에는 배포하지 않는다

2026-08-19 "가치 없는 콘텐츠"로 반려된 뒤 재신청을 앞두고 있다. 승인 확인 전에
새 서브도메인을 얹으면 반려 사유를 되살릴 수 있다. **승인 후 배포한다.**

## 1. GitHub 저장소 생성 — **사용자가 해야 함**

포터블 `gh`는 인증돼 있지 않고 `gh auth login`은 대화형이라 Claude가 만들 수 없다.
github.com에서 **`hakjagum-note`** 저장소를 private·빈 상태로 만들면 된다.

```powershell
$env:Path = "E:\클로드\tools\node;$env:Path"
cd E:\클로드\hakjagum-note
git push -u origin main
```

> 새로 `git init`한 저장소는 자격증명 헬퍼가 없어 푸시가 막힐 수 있다.
> 먼저 `git config credential.helper manager`를 설정할 것.

## 2. Vercel 연결 — **사용자가 해야 함**

1. Vercel 대시보드 → Add New Project → `hakjagum-note` 저장소 임포트
2. Framework: Next.js (자동 감지)
3. 환경변수: `NEXT_PUBLIC_SITE_URL` = `https://hakjagum.lifebanjang.com`
   - `NEXT_PUBLIC_ADSENSE_CLIENT`는 설정하지 않아도 된다. 코드에 기본값
     `ca-pub-6029964277117053`이 들어 있다.
4. Deploy

## 3. 도메인 연결 — **사용자가 해야 함**

1. Vercel 프로젝트 → Settings → Domains → `hakjagum.lifebanjang.com` 추가
2. 가비아 DNS에 CNAME 추가 — 호스트 `hakjagum`, 값 `cname.vercel-dns.com`
3. 전파 후 Vercel에서 유효성 확인 (보통 몇 분)

## 4. 크로스링크 게이팅 해제 — 도메인이 살아난 뒤에

도메인이 실제로 200을 반환하는 것을 확인한 다음에 넣는다.

- **허브 `lib/notes.ts`** — hakjagum 항목 추가 (`status: "live"`)
- **허브 `lib/article-intros.ts`** — `/articles/hakjagum` 해설 추가
- **허브 `scripts/gen-note-guides.mjs`** — NOTE_DIRS에 hakjagum 추가 후
  `npm run gen:note-guides` 재실행 (363 → **373편**)
- **18개 사이트 `components/FamilyLinks.tsx`** — SITES 배열에 아래 줄 추가

  ```ts
  { slug: "hakjagum", name: "학자금노트", url: "https://hakjagum.lifebanjang.com", desc: "지원구간·국가장학금·학자금대출" },
  ```

- 전체 빌드 후 `.next/server/app/**/*.html`에 `hakjagum.lifebanjang.com`이 나타나는지
  확인하고, 19개 저장소를 커밋·푸시한다.

## 5. 검색엔진 등록

- **구글**: `sc-domain:lifebanjang.com` 도메인 속성으로 자동 커버된다.
  Search Console → Sitemaps에서 `https://hakjagum.lifebanjang.com/sitemap.xml`만 제출.
- **네이버**: 서치어드바이저에 개별 등록해야 한다.
  `app/layout.tsx`의 `metadata`에 **verification이 비어 있다**(다른 노트 코드를 그대로
  두면 소유확인이 실패하므로 지워 두었다).
  1. 서치어드바이저에서 `https://hakjagum.lifebanjang.com` 등록
  2. 발급받은 값으로 `app/layout.tsx`에 추가

     ```ts
     verification: { other: { "naver-site-verification": "<발급받은 값>" } },
     ```
  3. 커밋·푸시 후 소유확인 → 사이트맵 제출

> 건강보험노트 때 서치콘솔 사이트맵 제출이 UI에서 안 먹힌 적이 있다.
> **같은 증상이면 붙들지 말고 사용자에게 넘길 것.** `robots.txt`에 `Sitemap:` 줄이
> 있어 크롤러가 자동 발견은 한다.

## 6. 배포 후 확인

```powershell
$ProgressPreference='SilentlyContinue'
foreach($p in @("/","/calc/bracket","/calc/scholarship","/calc/icl","/calc/deduction","/guide","/ads.txt","/sitemap.xml")){
  try{ $r=Invoke-WebRequest "https://hakjagum.lifebanjang.com$p" -UseBasicParsing -TimeoutSec 30; "$p => $($r.StatusCode)" }
  catch{ "$p => ERR" }
}
```

- `/ads.txt`가 `google.com, pub-6029964277117053, DIRECT, f08c47fec0942fa0`를 반환하는지
- 홈 원본 HTML `<head>`에 애드센스 script 태그가 있는지
- 사이트맵 URL(정적 7 + 계산기 4 + 가이드 10 = **21개**)이 전부 200인지
- 가이드 본문에 `**` 별표가 남아 있지 않은지 (`<strong>`으로 변환됐는지)
- `/guide` 목록의 링크 텍스트 비율이 25% 아래인지 (광고 없는 페이지지만 확인)

## 7. 로컬 완료 상태

- 계산기 4종 + 가이드 10편 + 테스트 **81개** 통과, 빌드 exit 0 (27개 라우트)
- 워크스페이스 `.claude/launch.json` — `hakjagum-note-dev` (포트 4800)
- **허브·다른 노트에는 아직 아무것도 넣지 않았다** (게이팅 상태)
