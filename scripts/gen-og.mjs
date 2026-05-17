// One-shot script: render public/og.png from an inline SVG.
// Run with: node scripts/gen-og.mjs
//
// Why a script (not a runtime endpoint): @resvg adds ~10MB to the
// deploy bundle. We only need to regenerate when the design changes,
// so we bake it at author time and commit the PNG.

import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "node:fs";

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0a0a0f"/>
  <defs>
    <radialGradient id="glow" cx="30%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2a2a35" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="700" y="0" width="500" height="630" fill="url(#grid)" opacity="0.6"/>
  <g transform="translate(80, 120)">
    <rect x="0" y="0" width="220" height="36" rx="18" fill="#14141b" stroke="#2a2a35" stroke-width="1"/>
    <circle cx="20" cy="18" r="4" fill="#22c55e"/>
    <text x="36" y="24" font-family="ui-sans-serif, system-ui, -apple-system, sans-serif" font-size="14" fill="#a8a8b3">
      Now booking June 2026
    </text>
  </g>
  <text x="80" y="260" font-family="ui-sans-serif, system-ui, -apple-system, sans-serif" font-size="72" font-weight="800" fill="#fafafa" letter-spacing="-2">
    Your website.
  </text>
  <text x="80" y="345" font-family="ui-sans-serif, system-ui, -apple-system, sans-serif" font-size="72" font-weight="800" fill="#fafafa" letter-spacing="-2">
    An AI assistant.
  </text>
  <text x="80" y="430" font-family="ui-sans-serif, system-ui, -apple-system, sans-serif" font-size="72" font-weight="800" fill="#6b6b78" letter-spacing="-2">
    One monthly fee.
  </text>
  <text x="80" y="490" font-family="ui-sans-serif, system-ui, -apple-system, sans-serif" font-size="24" fill="#a8a8b3">
    Productized websites + AI for small businesses. From $299/mo.
  </text>
  <g transform="translate(80, 555)">
    <text font-family="ui-sans-serif, system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" fill="#fafafa" letter-spacing="-1">
      Buildsite<tspan fill="#3b82f6">.</tspan>
    </text>
  </g>
  <text x="1120" y="585" text-anchor="end" font-family="ui-monospace, SFMono-Regular, monospace" font-size="16" fill="#6b6b78">
    buildsite.dev
  </text>
</svg>
`;

const resvg = new Resvg(svg, {
  background: "#0a0a0f",
  fitTo: { mode: "width", value: 1200 },
});

const png = resvg.render().asPng();
writeFileSync("public/og.png", png);
console.log("wrote public/og.png (" + png.length + " bytes)");
