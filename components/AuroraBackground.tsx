/*
 * AuroraBackground — Animated aurora blobs behind the entire page.
 * Design: "Obsidian Aurora" — organic light blobs that drift slowly.
 * Dark: vivid cyan/violet/rose on deep navy.  Light: pastel tints on white.
 */

import { useTheme } from "@/contexts/ThemeContext";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const AURORA_BG_DARK =
  "https://private-us-east-1.manuscdn.com/sessionFile/kDJEosmr7cTbDqbUygwLnl/sandbox/ChGTm59RWMnNKggheAhZlm-img-2_1770393146000_na1fn_YXVyb3JhLWJnLWRhcms.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUva0RKRW9zbXI3Y1RiRHFiVXlnd0xubC9zYW5kYm94L0NoR1RtNTlSV01uTktnZ2hlQWhabG0taW1nLTJfMTc3MDM5MzE0NjAwMF9uYTFmbl9ZWFZ5YjNKaExXSm5MV1JoY21zLmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=DCz-4ZOWrYHSjMEPuxpfiNsUHJv9L~56gYS21WpP-eoXpX-Z6uPs22N8xwd4pmDuJiT3n~CKw3P4Di3YWlXoO5A0sySjSwJTtVB7V7xnwTABwOJqeAXdtlE2Fl4NWUYSg6UHp~kNoPlRwDiTG5JqR4l9HiPgQdw6QU3YEeLU41KBLzMdtNjxnczAmPVZqHsShcHGByQd1cJCWyF5EOPa~RMttt4ygpKEGm7uEpU3Bsi2e7VcRVc-SznG965Qx8IQWeyId7O-6nwu79~l6ie7HuN4P8a2VTXZfnr-CrjaKAqorvO4~W0UkmADNqLEbHyWPckCE-ruuMRf2LK9QuLj1Q__";

const AURORA_BG_LIGHT =
  "https://private-us-east-1.manuscdn.com/sessionFile/kDJEosmr7cTbDqbUygwLnl/sandbox/ChGTm59RWMnNKggheAhZlm-img-3_1770393150000_na1fn_YXVyb3JhLWJnLWxpZ2h0.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUva0RKRW9zbXI3Y1RiRHFiVXlnd0xubC9zYW5kYm94L0NoR1RtNTlSV01uTktnZ2hlQWhabG0taW1nLTNfMTc3MDM5MzE1MDAwMF9uYTFmbl9ZWFZ5YjNKaExXSm5MV3hwWjJoMC5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=fQVFuX9eV~jyb9sSvwKJ0mOPUjimXPybdu6NsFHbFGv-FVX6xdstsl~VvoEjvSg~DxMWs-Hvi5~XLeWZv7eqBjrlkUR8unD9vrdXvuPmVoZjKNBbFNFLib5BJBES6Yvx4hRoGb~nVV4llogO~R5KW29EgZ5L5r7EPVCzUDKwJjb6bR-o-~~~71qK0Z3f9Qwp8HF0hCrCgkOPpK5UwvCi~qV3cf9BFpbFPmq-sT9h-uC8RaugUOOX65y4oIoiTyGakIPngCDC8AwkjrL1jYNNBo180kXGZM4AWDGpmWWt9g1laZ9Qix1EaorrzAT9zTxt799cdecbR-SZBywfkuotNg__";

export default function AuroraBackground() {
  const { theme } = useTheme();
  const reducedMotion = usePrefersReducedMotion();

  const bgImage = theme === "dark" ? AURORA_BG_DARK : AURORA_BG_LIGHT;
  const animDuration = reducedMotion ? "0s" : "25s";

  return (
    <div className="aurora-bg" aria-hidden="true">
      {/* Base background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${bgImage})`,
          opacity: theme === "dark" ? 0.45 : 0.55,
        }}
      />

      {/* Animated aurora blobs */}
      <div
        className="aurora-blob"
        style={{
          width: "55vw",
          height: "55vh",
          top: "-15%",
          left: "-10%",
          background: `radial-gradient(ellipse, var(--aurora-1), transparent 70%)`,
          animation: `aurora-drift-1 ${animDuration} ease-in-out infinite`,
        }}
      />
      <div
        className="aurora-blob"
        style={{
          width: "45vw",
          height: "45vh",
          top: "15%",
          right: "-8%",
          background: `radial-gradient(ellipse, var(--aurora-2), transparent 70%)`,
          animation: `aurora-drift-2 ${animDuration} ease-in-out infinite`,
        }}
      />
      <div
        className="aurora-blob"
        style={{
          width: "40vw",
          height: "40vh",
          bottom: "-5%",
          left: "25%",
          background: `radial-gradient(ellipse, var(--aurora-3), transparent 70%)`,
          animation: `aurora-drift-3 ${animDuration} ease-in-out infinite`,
        }}
      />
      {/* Fourth blob for more depth */}
      <div
        className="aurora-blob"
        style={{
          width: "35vw",
          height: "35vh",
          top: "50%",
          left: "-5%",
          background: `radial-gradient(ellipse, var(--aurora-2), transparent 65%)`,
          animation: `aurora-drift-1 ${animDuration} ease-in-out infinite reverse`,
          opacity: 0.6,
        }}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, ${
            theme === "dark" ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.45)"
          } 100%)`,
        }}
      />

      {/* Subtle noise overlay for anti-banding */}
      <div
        className="absolute inset-0"
        style={{
          opacity: theme === "dark" ? 0.03 : 0.02,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />
    </div>
  );
}
