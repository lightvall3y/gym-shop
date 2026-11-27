// Placeholder product images: a generated SVG per product, so the repo needs no image assets.
const PALETTES: [string, string][] = [
  ["#f97316", "#7c2d12"], ["#0ea5e9", "#0c4a6e"], ["#22c55e", "#14532d"], ["#a855f7", "#4c1d95"],
  ["#ef4444", "#7f1d1d"], ["#eab308", "#713f12"], ["#14b8a6", "#134e4a"], ["#64748b", "#0f172a"],
];

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hash = [...slug].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const [from, to] = PALETTES[hash % PALETTES.length];
  const words = slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1));
  const lines = [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")].filter(Boolean);
  const text = lines
    .map((l, i) => `<text x="300" y="${300 + i * 44}" text-anchor="middle" font-family="sans-serif" font-size="36" font-weight="700" fill="white">${l.replace(/[<&>]/g, "")}</text>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" role="img" aria-label="${words.join(" ")}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
<rect width="600" height="600" fill="url(#g)"/><circle cx="480" cy="120" r="140" fill="white" fill-opacity=".08"/>${text}</svg>`;
  return new Response(svg, { headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400" } });
}
