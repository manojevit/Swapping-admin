import Image from "next/image";

// The official EVCHARGEX lockup (wordmark + tagline). tone="light" is the white
// art for dark/brand backgrounds; tone="dark" is the ink art for light ones.
const ASPECT = 3230 / 470;

export function Logo({
  tone = "dark",
  width = 180,
  className,
}: {
  tone?: "dark" | "light";
  width?: number;
  className?: string;
}) {
  const src = tone === "light" ? "/brand/logo-white.png" : "/brand/logo-ink.png";
  return (
    <Image
      src={src}
      alt="EVCHARGEX"
      width={width}
      height={Math.round(width / ASPECT)}
      priority
      className={className}
      style={{ width, height: "auto" }}
    />
  );
}
