// SNS 공유 시 표시되는 OG 이미지 — 빌드 시 정적 생성
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "학자금노트 — 지원구간·국가장학금·학자금대출";

const TITLE = "등록금, 어디서 돈이 갈리나";
const SUB = "학자금 지원구간 · 국가장학금 · 대출 상환 · 세액공제";
const BRAND = "학자금노트";

async function loadKoreanFont(text: string): Promise<ArrayBuffer> {
  const css = await (
    await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=${encodeURIComponent(text)}`
    )
  ).text();
  const match = css.match(/src:\s*url\((.+?)\)\s*format\('(?:truetype|opentype|woff)'\)/);
  if (!match) throw new Error("OG 이미지용 폰트 URL을 찾지 못했습니다");
  return await (await fetch(match[1])).arrayBuffer();
}

export default async function OpengraphImage() {
  const font = await loadKoreanFont(TITLE + SUB + BRAND);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage:
            "linear-gradient(135deg, #2b2352 0%, #4c4192 60%, #a79ce8 100%)",
          fontFamily: "NotoSansKR",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2 }}>{TITLE}</div>
        <div style={{ marginTop: 28, fontSize: 28, opacity: 0.92 }}>{SUB}</div>
        <div
          style={{
            marginTop: 56,
            display: "flex",
            alignItems: "center",
            backgroundColor: "#ffffff",
            color: "#2b2352",
            fontSize: 34,
            fontWeight: 700,
            padding: "14px 44px",
            borderRadius: 999,
          }}
        >
          {BRAND}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "NotoSansKR", data: font, weight: 700, style: "normal" }],
    }
  );
}
