const en = {
  meta: {
    title: "Footy Highlight Hub",
    template: "%s | Footy Highlight Hub",
    description:
      "Official football highlights from FIFA, UEFA, Premier League, and more — aggregated in one place.",
    ogDescription: "Latest official football highlights from trusted sources.",
  },
  brand: {
    full: "Footy Highlight Hub",
    short: "Footy Hub",
  },
  nav: {
    main: "Main navigation",
    latest: "Latest",
    browse: "Browse",
    sources: "Sources",
    watch: "Watch",
    footer: "Footer navigation",
  },
  locale: {
    switch: "Language",
    switchTo: "Switch to {language}",
  },
  hero: {
    badge: "Official highlights only",
    titleLine1: "Every goal.",
    titleLine2: "One hub.",
    description:
      "FIFA, UEFA, Fox Soccer, and top leagues — curated from official channels so you never miss the action.",
    browseCompetitions: "Browse competitions",
    trustedSources: "Trusted sources",
  },
  home: {
    eyebrow: "Fresh from the pitch",
    title: "Latest Highlights",
    description: "Official match highlights from FIFA, UEFA, Fox Soccer, and top leagues.",
    emptyConfig:
      "Configure Supabase environment variables and run the migration to see highlights.",
    emptyVideos:
      "No highlights yet. Ingest runs automatically when someone visits the site (about every 2 hours).",
  },
  browse: {
    eyebrow: "Competitions",
    title: "Browse by Competition",
    description: "Explore highlights and matches organized by season and month.",
    emptyConfig: "Configure Supabase to browse competitions.",
    season: "Season {label}",
    seasonDescription: "Highlights and matches organized by month.",
    emptySeason:
      "No videos for this season yet. Data will appear as official channels publish content.",
    emptyMonth: "No videos for this month.",
    months: "Months",
  },
  sources: {
    eyebrow: "Trusted feeds",
    title: "Official Sources",
    description: "Videos are aggregated from these trusted official channels and websites.",
    emptyConfig: "Configure Supabase to view sources.",
    viewVideos: "View videos",
    officialPage: "Official page",
  },
  watch: {
    extended: "Extended Highlights",
    fullMatch: "Full Match",
    watchOn: "Watch on {source}",
    officialSite: "official site",
    browseSeason: "Browse season",
    externalMessage: "This video must be watched on the official source.",
  },
  filters: {
    extendedOnly: "Extended only",
    highlights: "Highlights",
    fullMatches: "Full Matches",
    soon: "(soon)",
  },
  video: {
    extended: "Extended",
    fullMatch: "Full Match",
    noThumbnail: "No thumbnail",
  },
  seasonNav: {
    allMonths: "All months",
    empty: "No archived videos yet. Check back after the next ingest run.",
    highlights: "{count} highlights",
    fullMatches: "{count} full matches",
    highlightsAndMatches: "{highlights}, {fullMatches}",
  },
  time: {
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: "{count} days ago",
    weeksAgo: "{count} weeks ago",
  },
  footer: {
    disclaimer:
      "All videos belong to their respective rights holders. This is an unofficial aggregator of publicly available official highlights and match content.",
    builtWith: "Built with Next.js, Supabase, and official channel APIs.",
  },
} as const;

export type Messages = {
  [K in keyof typeof en]: {
    [P in keyof (typeof en)[K]]: string;
  };
};

export default en;
