/**
 * 核心数据源定义（文章、项目、实验、客户徽标、画廊等）
 */

export interface ArticleItem {
  title: string;
  description: string;
  year: string;
  href: string;
  readingMin: number;
  sticker: string;
  live: boolean;
  tag?: string;
  tagTone?: "pink" | "gray";
}

export interface ProjectItem {
  title: string;
  description: string;
  year: string;
  href: string;
  preview?: string;
  previewType?: "image" | "video";
  sticker?: string;
  draft?: boolean;
  live?: boolean;
}

export interface ClientLogo {
  src: string;
  title: { en: string; fr: string } | string;
  rotate: number;
}

export interface CraftMediaItem {
  src: string;
  label: string;
  kind: "photo" | "stamp" | "video";
  aspect?: string;
  city?: string;
  numeral?: string;
}

export const ARTICLES: ArticleItem[] = [
  {
    title: "Designing the yippee",
    description: "The wait is where they decide whether it works. The yippee is where they decide whether it was worth it. Three intensities, and the bill for the wrong one.",
    year: "Sep 17, 2026",
    href: "/writing/designing-the-yippee",
    readingMin: 6,
    sticker: "/images/stickers/writing-yippee.svg",
    live: true,
  },
  {
    title: "Designing the wait",
    description: "With a model in the loop, the wait is most of the interaction. Latency as a material: thresholds, loaders, streaming cadence, interruption.",
    year: "Sep 21, 2026",
    href: "/writing/designing-the-wait",
    readingMin: 7,
    sticker: "/images/stickers/writing-wait.svg",
    live: true,
    tag: "New",
    tagTone: "pink",
  },
  {
    title: "Create a voice AI component",
    description: "The voice is not part of the product, it is the product. Designed as a component: three registers, six states, a word budget.",
    year: "Aug 31, 2026",
    href: "/writing/designing-a-voice-component",
    readingMin: 8,
    sticker: "/images/stickers/writing-voice.svg",
    live: false,
    tag: "Soon",
  },
  {
    title: "The button AI can't finish",
    description: "AI hands you a correct button in seconds. The part you can feel is the part it can't finish.",
    year: "Aug 31, 2026",
    href: "/writing/the-button-ai-cant-finish",
    readingMin: 5,
    sticker: "/images/stickers/writing-button.svg",
    live: true,
  },
  {
    title: "The one-person product team",
    description: "One person, a laptop, a good prompt. The org chart is catching up to what tools already enabled.",
    year: "Jul 15, 2026",
    href: "/writing/one-person-product-team",
    readingMin: 5,
    sticker: "/images/stickers/writing-team.svg",
    live: true,
  },
  {
    title: "The spec is the new wireframe",
    description: "Wireframes are dying. Specs are the new design skill.",
    year: "Jun 29, 2026",
    href: "/writing/spec-new-wireframe",
    readingMin: 3,
    sticker: "/images/stickers/writing-spec.svg",
    live: true,
  },
  {
    title: "The handoff is dead. Now what?",
    description: "AI exposed how broken the design-to-dev handoff always was",
    year: "Jun 16, 2026",
    href: "/writing/handoff-is-dead",
    readingMin: 5,
    sticker: "/images/stickers/writing-handoff.svg",
    live: true,
  },
  {
    title: "The 70/30 Rule",
    description: "Where AI stops and craft begins in the design process",
    year: "May 21, 2026",
    href: "/writing/the-70-30-rule",
    readingMin: 6,
    sticker: "/images/stickers/writing-7030.svg",
    live: true,
  },
];

export const PROJECTS: ProjectItem[] = [
  {
    title: "The audioguide that disappears",
    description: "Reinventing the museum audioguide for a major Parisian art foundation's 2028 opening. The work continues today",
    year: "2025 – now",
    href: "/work/museum-audioguide",
    preview: "/work/museum-audioguide/immersion-4-artwork.png",
    previewType: "image",
    sticker: "/images/stickers/giacometti.svg",
    live: true,
  },
  {
    title: "Scientific enterprise (company name kept confidential)",
    description: "Internal AI tool for R&D teams in a specialty chemicals group. One-week pitch delivered with a custom AI-augmented workflow.",
    year: "2026",
    href: "/work/specialty-chemicals",
    preview: "/images/lab-ai-companion.png",
    previewType: "image",
    sticker: "/images/stickers/specialty-chemicals.svg",
    draft: true,
  },
  {
    title: "Evaneos",
    description: "An immersive AI experience that turns a dream trip into three responsible alternatives",
    year: "2025",
    href: "/work/evaneos",
    preview: "/work/evaneos/mockup.png",
    previewType: "image",
    sticker: "/images/stickers/evaneos.svg",
    live: true,
  },
  {
    title: "Ensweet",
    description: "Sole product designer at a teletherapy platform for cardiac rehabilitation. Built the design system from scratch and led the company's complete rebrand, then redesigned mobile and desktop end-to-end on top of them.",
    year: "2022 – 2024",
    href: "/work/ensweet",
    preview: "/work/ensweet/mockup.png",
    previewType: "image",
    live: false,
    draft: true,
  },
  {
    title: "Robertet",
    description: "Naturia, the internal AI tool I've been leading as design lead for Robertet's perfumers and aromatic specialists, alongside a team of developers and data scientists. In daily use in production since 2024. I also maintain and grow their design system.",
    year: "2024 – now",
    href: "/work/robertet",
    sticker: "/images/stickers/robertet.svg",
    draft: true,
  },
];

export const CLIENT_LOGOS: ClientLogo[] = [
  { src: "/images/logos/sephora.png", title: "Sephora", rotate: -6 },
  { src: "/images/logos/renault.png?v=2", title: "Renault", rotate: -4 },
  { src: "/images/logos/mad.png", title: { en: "Museum of Decorative Arts", fr: "Musée des Arts Décoratifs" }, rotate: 6 },
  { src: "/images/logos/canalplus.png?v=2", title: "Canal+", rotate: -5 },
  { src: "/images/logos/astrazeneca.png?v=4", title: "AstraZeneca", rotate: -6 },
];

export const CRAFT_ITEMS: CraftMediaItem[] = [
  { src: "/images/craft/greenhouse.jpg?v=2", label: "Greenhouse", kind: "photo", aspect: "4/5" },
  { src: "/images/stamps/paris-eiffel.jpg?v=5", city: "PARIS", numeral: "II", label: "Timbre Paris, la tour Eiffel", kind: "stamp", aspect: "3/4" },
  { src: "/images/craft/run-leaves.jpg", label: "Autumn run", kind: "photo", aspect: "1/1" },
  { src: "/images/stamps/nancy-stanislas.jpg?v=5", city: "NANCY", numeral: "III", label: "Timbre Nancy, la place Stanislas", kind: "stamp", aspect: "3/4" },
  { src: "/images/craft/road-cat.jpg?v=3", label: "Road cat", kind: "photo", aspect: "4/5" },
  { src: "/images/craft/matcha.jpg", label: "Morning matcha", kind: "photo", aspect: "1/1" },
  { src: "/images/craft/crochet-hung.jpg", label: "Handmade crochet", kind: "photo", aspect: "3/4" },
  { src: "/images/craft/pool.jpg", label: "Summer pool", kind: "photo", aspect: "4/5" },
  { src: "/images/craft/cat-table.jpg", label: "Cat by the table", kind: "photo", aspect: "1/1" },
  { src: "/images/craft/train-sketch.jpg", label: "Train sketchbook", kind: "photo", aspect: "4/5" },
];
