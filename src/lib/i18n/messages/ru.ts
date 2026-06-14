import type { Messages } from "./en";

const ru: Messages = {
  meta: {
    title: "Footy Highlight Hub",
    template: "%s | Footy Highlight Hub",
    description:
      "Официальные футбольные обзоры матчей FIFA, UEFA, АПЛ и других турниров — в одном месте.",
    ogDescription: "Последние официальные футбольные обзоры из проверенных источников.",
  },
  brand: {
    full: "Footy Highlight Hub",
    short: "Footy Hub",
  },
  nav: {
    main: "Основная навигация",
    latest: "Свежее",
    browse: "Обзор",
    sources: "Источники",
    watch: "Смотреть",
    footer: "Навигация в подвале",
  },
  locale: {
    switch: "Язык",
    switchTo: "Переключить на {language}",
  },
  hero: {
    badge: "Только официальные обзоры",
    titleLine1: "Каждый гол.",
    titleLine2: "В одном месте.",
    description:
      "FIFA, UEFA, Fox Soccer и топ-лиги — подборка с официальных каналов, чтобы вы не пропустили главное.",
    browseCompetitions: "Смотреть по турнирам",
    trustedSources: "Проверенные источники",
  },
  home: {
    eyebrow: "Свежее с поля",
    title: "Последние обзоры",
    description: "Официальные обзоры матчей FIFA, UEFA, Fox Soccer и топ-лиг.",
    emptyConfig:
      "Настройте переменные окружения Supabase и выполните миграцию, чтобы увидеть обзоры.",
    emptyVideos:
      "Обзоров пока нет. Загрузка видео запускается автоматически при посещении сайта.",
  },
  browse: {
    eyebrow: "Турниры",
    title: "Обзор по турнирам",
    description: "Обзоры и матчи по сезонам и месяцам.",
    emptyConfig: "Настройте Supabase, чтобы просматривать турниры.",
    season: "Сезон {label}",
    seasonDescription: "Обзоры и матчи по месяцам.",
    emptySeason:
      "В этом сезоне пока нет видео. Они появятся, когда официальные каналы опубликуют контент.",
    emptyMonth: "В этом месяце нет видео.",
    months: "Месяцы",
  },
  sources: {
    eyebrow: "Проверенные каналы",
    title: "Официальные источники",
    description: "Видео собираются с этих проверенных официальных каналов и сайтов.",
    emptyConfig: "Настройте Supabase, чтобы просмотреть источники.",
    viewVideos: "Смотреть видео",
    officialPage: "Официальная страница",
  },
  watch: {
    extended: "Расширенный обзор",
    fullMatch: "Полный матч",
    watchOn: "Смотреть на {source}",
    officialSite: "официальном сайте",
    browseSeason: "Смотреть сезон",
    externalMessage: "Это видео нужно смотреть на официальном источнике.",
  },
  filters: {
    extendedOnly: "Только расширенные",
    highlights: "Обзоры",
    fullMatches: "Полные матчи",
    soon: "(скоро)",
  },
  video: {
    extended: "Расширенный",
    fullMatch: "Полный матч",
    noThumbnail: "Нет превью",
  },
  seasonNav: {
    allMonths: "Все месяцы",
    empty: "Архивных видео пока нет. Загляните после следующего запуска ingest.",
    highlights: "{count} обзоров",
    fullMatches: "{count} полных матчей",
    highlightsAndMatches: "{highlights}, {fullMatches}",
  },
  time: {
    today: "Сегодня",
    yesterday: "Вчера",
    daysAgo: "{count} дн. назад",
    weeksAgo: "{count} нед. назад",
  },
  footer: {
    disclaimer:
      "Все видео принадлежат их правообладателям. Это неофициальный агрегатор публично доступных официальных обзоров и матчей.",
    builtWith: "Сделано на Next.js, Supabase и официальных API каналов.",
  },
};

export default ru;
