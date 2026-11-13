import { links } from '../site';

export type RoomId = 'office' | 'server' | 'lounge' | 'lobby';

export interface ContentLink {
  readonly label: string;
  readonly href: string;
}

/** One interactive object in the office and the résumé content it opens. */
export interface GameObjectContent {
  readonly id: string;
  readonly room: RoomId;
  readonly title: string;
  readonly body: string;
  readonly links?: readonly ContentLink[];
}

export interface RoomContent {
  readonly title: string;
  readonly blurb: string;
}

export const roomOrder: readonly RoomId[] = ['office', 'server', 'lounge', 'lobby'];

export const rooms: Readonly<Record<RoomId, RoomContent>> = {
  office: { title: 'Office', blurb: 'Experience and skills' },
  server: { title: 'Server room', blurb: 'The AI agents I built' },
  lounge: { title: 'Lounge', blurb: 'Projects and results' },
  lobby: { title: 'Lobby', blurb: 'At a glance and contact' },
};

/* Facts and wording come from resume-recruiter/resume-recruiter.md. */
export const gameObjects: readonly GameObjectContent[] = [
  {
    id: 'desk-soulwise', room: 'office', title: 'Soulwise · 2025 – Present',
    body: 'Founder and solo product engineer of my own AI-powered consumer platform with 10k+ users. I built its AI features on OpenAI, Claude and Gemini with vector search, shipped native iOS and Android apps from one codebase, and made the app 36% faster to load.',
  },
  {
    id: 'desk-oboard', room: 'office', title: 'Oboard · 2022 – 2025',
    body: 'Senior Frontend Developer and Feature Owner on B2B OKR software. I owned a product area from idea to launch, reviewed every frontend change, shipped the product inside Monday.com, Salesforce, Jira and Confluence, and integrated payments.',
  },
  {
    id: 'archive-earlier', room: 'office', title: 'Earlier roles · 2017 – 2022',
    body: 'Frontend Developer (Vue.js and React) at ITOMYCH Studio, AnyforSoft, IT Svit, Codica and QPARD: 5+ years shipping web products for startups and agencies.',
  },
  {
    id: 'bookshelf-skills', room: 'office', title: 'Skills',
    body: 'TypeScript, Node.js, NestJS, Python and FastAPI. React, Next.js, Vue and Nuxt. Capacitor, Ionic and Electron for mobile and desktop. MongoDB, PostgreSQL, Redis, Docker and CI/CD underneath.',
  },
  {
    id: 'whiteboard-method', room: 'office', title: 'How I work',
    body: 'Spec first, tests first. I work with SDD, TDD and BDD, and I have packaged that workflow into reusable skills for AI coding agents: Claude Code, Codex, Windsurf and Devin.',
  },
  {
    id: 'rack-seo', room: 'server', title: 'SEO agent',
    body: 'An agent that adapts and translates content for search engines.',
  },
  {
    id: 'rack-content', room: 'server', title: 'Content agent',
    body: 'An agent that drafts marketing creatives and articles.',
  },
  {
    id: 'rack-qa', room: 'server', title: 'QA agent',
    body: 'An agent that tests every feature and writes its own documentation.',
  },
  {
    id: 'rack-social', room: 'server', title: 'Social agent',
    body: 'An agent that runs social media on its own using browser automation.',
  },
  {
    id: 'terminal-ai', room: 'server', title: 'AI in production',
    body: 'AI features connected to OpenAI, Claude and Gemini, with a Qdrant vector-search layer so answers come from real data, plus multi-provider fallback and cost control.',
  },
  {
    id: 'arcade-saas', room: 'lounge', title: 'Solo products',
    body: 'Three live consumer products where I am the whole team: Soulwise (an AI cycle and wellness app, 5K+ downloads on Google Play), Owlark (energy and sleep rhythm, live on iOS and the web) and Lunarbor (a mood, habit and cycle journal, live on Android).',
    links: [
      { label: 'Soulwise', href: 'https://play.google.com/store/apps/details?id=org.yakovliev.myzodiacai' },
      { label: 'Owlark', href: 'https://owlark.app/' },
      { label: 'Lunarbor', href: 'https://lunarbor.app/' },
    ],
  },
  {
    id: 'arcade-forge', room: 'lounge', title: 'speckit-product-forge',
    body: 'My open-source Spec-Driven Development framework, built on top of GitHub Spec Kit. It drives AI coding agents through a spec, tests and a first pass of code.',
    links: [{ label: 'View on GitHub', href: 'https://github.com/VaiYav/speckit-product-forge' }],
  },
  {
    id: 'arcade-multi', room: 'lounge', title: 'One codebase, 5+ versions',
    body: 'One product that runs as 5+ versions from a single codebase: a standalone web app, a Monday.com add-on, a Salesforce app, Atlassian apps and mobile.',
  },
  {
    id: 'shelf-results', room: 'lounge', title: 'Results',
    body: 'Internal tools that cut repetitive manual work by about 40% for QA, dev and hiring teams, and multiple products taken from 0 to 1.',
  },
  {
    id: 'reception-glance', room: 'lobby', title: 'At a glance',
    body: '8+ years building and shipping web, mobile and desktop products. 2+ years focused on AI, LLMs and agent systems in production. Remote from Ukraine, GMT+2.',
  },
  {
    id: 'table-consulting', room: 'lobby', title: 'AI consulting · 2025 – Present',
    body: 'Independent AI Integration Consultant for three product teams: AI adoption roadmaps, internal AI agents for development teams, and advice on agent architecture, RAG and cost control.',
  },
  {
    id: 'mailbox-contact', room: 'lobby', title: 'Contact',
    body: 'Email, LinkedIn, GitHub or Telegram: whichever is easiest for you.',
    links: [
      { label: 'Email', href: links.email },
      { label: 'LinkedIn', href: links.linkedin },
      { label: 'GitHub', href: links.github },
      { label: 'Telegram', href: links.telegram },
    ],
  },
  {
    id: 'exit-cv', room: 'lobby', title: 'Recruiter CV',
    body: 'The plain résumé, without the game. One click away at any time.',
    links: [{ label: 'Open the recruiter CV', href: links.cv }],
  },
];

/** Objects of one room, as a fresh array each call. */
export const objectsByRoom = (room: RoomId): GameObjectContent[] =>
  gameObjects.filter((object) => object.room === room);
