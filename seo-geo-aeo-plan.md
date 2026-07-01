# SEO / AEO / GEO Optimization Plan — vaiyav.github.io

Covers both live domains: `https://vaiyav.github.io/` (GitHub Pages, canonical) and `https://vai-yav-github-io.vercel.app/` (Vercel, auto-deployed mirror of the same repo — no `vercel.json` found, so it's zero-config static hosting triggered by every push).

## 0. Current state, honestly

Checked both domains live. They currently serve the **old, pre-redesign** homepage — no `robots.txt`, no `sitemap.xml`, no `llms.txt`, meta description still says "Built My Zodiac AI solo." Nothing from this session is live yet; it's all sitting uncommitted in the working tree:

- Rewritten `index.html` — scrollable, real crawlable content, enriched JSON-LD `@graph` (Person + WebSite + BreadcrumbList, `knowsAbout` with 22 entities), OG/Twitter image tags.
- New `robots.txt`, `sitemap.xml`, `llms.txt`.
- Repo-wide purge of "My Zodiac AI" / "Soulwise AI" / astrology-adjacent language across 17 files (done this session, verified with a zero-match grep across everything except `interviews/`, which is intentionally untouched — those are your private notes).

**Nothing goes live until you push.** That's the prerequisite for every step below — a plan for content that isn't deployed yet is just a plan.

One structural thing already working in your favor: the canonical tag is hardcoded into the HTML itself (`<link rel="canonical" href="https://vaiyav.github.io/">`), and since Vercel serves the identical file, its copy also self-declares GitHub Pages as canonical. That means the dual-domain setup won't cause a duplicate-content penalty once you push — Google should consolidate ranking signals to the `.github.io` version on its own.

---

## 1. Ship it (prerequisite — do this first)

1. `git add -A && git commit && git push` — I have not done this and won't without you saying so; pushing to a public repo that auto-deploys to two live domains falls under "publishing," which needs your explicit go-ahead.
2. Once pushed, both GitHub Pages and Vercel redeploy automatically (GH Pages: ~30–60s via Actions; Vercel: its own webhook, similar speed).
3. Immediately after: submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools, and use GSC's URL Inspection tool to request re-indexing of the homepage specifically (don't wait for organic recrawl — could take weeks otherwise).
4. Run the new homepage through Google's [Rich Results Test](https://search.google.com/test/rich-results) and [schema.org validator](https://validator.schema.org/) to confirm the JSON-LD parses clean in the wild (I validated it statically via JSON.loads — the syntax is valid — but the live-rendering test is the real check for warnings/enhancements Google might flag).

## 2. Decide what the Vercel mirror is for

Right now it's a second live, publicly indexable copy of the exact same site, serving no distinct purpose I can find (no separate `vercel.json`, no separate content, no edge functions). Two options:

- **Leave it** — harmless as-is, since the canonical tag already tells crawlers which copy is authoritative.
- **Explicitly de-index it** (recommended, low effort) — add a `vercel.json` with a response header so Vercel serves `X-Robots-Tag: noindex` on every route. That way there is exactly one crawlable, citable origin, and zero chance an AI agent or search engine surfaces the Vercel URL instead of your real one.

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Robots-Tag", "value": "noindex" }
      ]
    }
  ]
}
```

## 3. Technical SEO checklist

Already shipped (pending push): robots.txt, sitemap.xml, canonical tags on every major page, OG/Twitter cards, JSON-LD.

Gaps found, worth closing:

- **`resume-recruiter/resume-recruiter.html` has no canonical tag, no OG tags, and no JSON-LD at all** — it only has `<title>` and meta description. It's in the sitemap at priority 0.8, so it should carry the same tagging as `v2/index.html` and `2000/resume-2000.html` already do.
- **No `404.html`** — GitHub Pages' default 404 is a bare, unhelpful page. A custom one that links back to the homepage costs nothing and slightly helps bounce/crawl behavior.
- **No `humans.txt`** — pure legitimacy signal, near-zero cost, some crawlers and a few AI agents check for it. Optional but trivial.
- Confirm mobile responsiveness of the new scrollable `index.html` on an actual small viewport — I verified structurally (balanced tags, valid CSS/JS) but never got a real rendered screenshot (local `file://` navigation is blocked for me in this browser tool). Worth 30 seconds of your own eyes before or right after push.
- Run a Lighthouse pass once live (Performance/Accessibility/SEO/Best Practices) — the `lighthouse-audit` skill in your toolkit can do this against the live URL once it's up.

## 4. On-page content

- Heading hierarchy: confirm one `<h1>` and logical `<h2>`/`<h3>` nesting on the new homepage (this is how AI engines and Google both segment a page into extractable chunks).
- Keyword coverage: "Full-Stack Product Engineer," "Vue.js," "NestJS," "AI agent engineer," "Valentyn Yakovliev" should appear naturally in visible headings and body copy, not just meta tags — already mostly true in the rewrite, worth a final skim.
- A lightweight "now" line (what you're currently building/learning) is a cheap freshness signal or you can drop it, it's optional, and freshness matters more for blogs than static resumes.

## 5. AEO — optimizing for ChatGPT / Perplexity / Bing Chat-style answer engines

These engines reward extractable, self-contained answer blocks more than dense narrative prose. Concretely, add short (40–60 word) blocks that directly answer the exact questions a recruiter or AI agent is likely to ask, each under its own heading:

- "What does Valentyn Yakovliev do?"
- "What's his tech stack?"
- "Is he open to remote roles?"
- "How much experience does he have?"

Wrap these in a proper `FAQPage` JSON-LD block — but only once the same Q&A text is visibly present on the page (Google requires visible/markup parity; a schema block with no matching visible content is a red flag, not a boost).

## 6. GEO — optimizing for "who is X" queries in Claude / ChatGPT / Gemini directly, and for Exa

You specifically mentioned Exa (the semantic search engine several agent frameworks, including Claude's, use for web search). There's no special Exa meta tag — Exa indexes and embeds page content much like a search crawler. The highest-leverage levers are the same ones covered above, plus:

- **Static, JS-free HTML** — confirmed, your site already is this. This matters because Exa (and most crawlers) can't reliably execute JavaScript-rendered content.
- **`Person.sameAs` completeness** — currently has LinkedIn + GitHub. If you have a live dev.to, X/Twitter, or personal blog, add those too; more corroborating profile links strengthen entity resolution.
- **`knowsAbout` array** — already has 22 items in the new JSON-LD; expand only with things that are demonstrably true, since fabricated entity claims are actively penalized post-March-2026 per current Google guidance.
- **`llms.txt` freshness** — keep it in sync with `sitemap.xml` every time a page is added or retired.
- **Inbound corroboration** — the single highest-leverage GEO lever isn't anything on your own site, it's other crawlable pages (GitHub README, LinkedIn About section, any OSS project readme) independently stating the same name + role + stack. Multi-source corroboration is what actually moves entity confidence for an LLM, not additional markup on the site itself.
- Spot-check monthly: ask ChatGPT/Perplexity/Claude "who is Valentyn Yakovliev, full-stack engineer" and see whether/how they cite the site. No tooling needed, just a qualitative pulse-check.

## 7. Structured data still worth adding

- `FAQPage` (see AEO section above).
- `ProfilePage` — schema.org has a type built exactly for personal profile/portfolio pages, with a `mainEntity` pointing at the existing Person node. Net-new, safe, directly applicable, not yet used anywhere in the repo.
- Minimal `WebPage` + `BreadcrumbList` JSON-LD on `resume-recruiter.html` specifically (see gap noted in §3) — the other two resume variants already have this.
- Do **not** add review/rating schema — no real reviews exist, and fabricating them would violate schema guidelines and risk a manual action.

## 8. Off-page signals

- **GitHub profile README** (`github.com/vaiyav`) — if it doesn't already link to `vaiyav.github.io`, add it. GitHub READMEs are heavily crawled and frequently cited by AI coding agents and Exa specifically.
- **LinkedIn About/Contact section** — confirm it plainly links the portfolio URL, not just the Featured post.
- **speckit-product-forge OSS repo** — its README should link back to the canonical portfolio URL too; every corroborating, independently-crawlable mention of "Valentyn Yakovliev + this stack + this site" compounds entity confidence for both classic SEO and GEO.
- A single dev.to or blog post about the speckit-product-forge project would be a legitimate, low-effort backlink + content play, given you already have a real shipped artifact to write about. Not required, but high leverage for the effort.

## 9. Measurement

- Google Search Console — index coverage, query performance, Core Web Vitals.
- Bing Webmaster Tools — feeds Bing and Copilot.
- Rich Results Test + schema.org validator, right after push.
- Monthly manual AI-citation spot check (see §6).
- Optional: a privacy-friendly analytics script (Plausible/Fathom) if you want traffic numbers — GitHub Pages has nothing built in; Vercel has a free analytics tier but only for the mirror domain, which is exactly the one this plan suggests de-indexing.

## 10. Priority order

**This week:** push to git → submit sitemap to GSC + Bing → Rich Results Test → decide on Vercel `noindex` → add missing tags to `resume-recruiter.html`.

**This month:** FAQ/AEO blocks + `FAQPage` schema → `ProfilePage` schema → custom `404.html` → Lighthouse pass → GitHub README backlink check.

**Ongoing:** keep `llms.txt`/`sitemap.xml` in sync with any new pages → monthly AI-citation spot check → any new public writing/OSS work should always link back to the canonical URL.

---

## Still-open decisions from earlier (unrelated to this plan, but still pending)

- The 10K+ vs 100k+ user-count discrepancy between your LinkedIn edit and every other document — which number is correct?
- The LinkedIn URL typo in `v2/index.html`'s JSON-LD (`yakovlev` missing the second "i") from a pre-existing uncommitted edit — want it fixed?
- Whether to draft (not send) a LinkedIn endorsement-request message.
