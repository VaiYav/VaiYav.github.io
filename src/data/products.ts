import type { Locale } from './site';

type Localized = Readonly<Record<Locale, string>>;

export interface ProductStatus {
  readonly label: Localized;
  readonly live: boolean;
}

export interface ProductLink {
  readonly label: string;
  readonly href: string;
}

export interface SoloProduct {
  readonly id: string;
  readonly name: string;
  readonly kind: Localized;
  readonly statuses: readonly ProductStatus[];
  readonly points: readonly Localized[];
  readonly links: readonly ProductLink[];
}

const same = (text: string): Localized => ({ en: text, uk: text, ru: text });

export const soloProductsCopy: Readonly<Record<Locale, { index: string; title: string; intro: string; caseLabel: string }>> = {
  en: {
    index: 'Live now — solo products',
    title: 'Built and shipped alone.',
    intro: 'Three live consumer products where I am the whole team: product decisions, design, web and mobile engineering, subscriptions, store releases and the marketing site.',
    caseLabel: 'Case',
  },
  uk: {
    index: 'Вже працюють — соло-продукти',
    title: 'Зроблено й запущено самотужки.',
    intro: 'Три живі споживчі продукти, де вся команда — це я: продуктові рішення, дизайн, веб- і мобільна розробка, підписки, релізи в сторах і маркетинговий сайт.',
    caseLabel: 'Кейс',
  },
  ru: {
    index: 'Уже работают — соло-продукты',
    title: 'Сделано и запущено в одиночку.',
    intro: 'Три живых потребительских продукта, где вся команда — это я: продуктовые решения, дизайн, веб- и мобильная разработка, подписки, релизы в сторах и маркетинговый сайт.',
    caseLabel: 'Кейс',
  },
};

export const soloProducts: readonly SoloProduct[] = [
  {
    id: 'my-zodiac-ai',
    name: 'My Zodiac AI',
    kind: {
      en: 'AI astrology web app with Soulwise, its cycle & wellness app for Android',
      uk: 'AI-астрологія у вебі та Soulwise — застосунок про цикл і самопочуття для Android',
      ru: 'AI-астрология в вебе и Soulwise — приложение о цикле и самочувствии для Android',
    },
    statuses: [
      { label: same('Web · live'), live: true },
      { label: same('Android · live'), live: true },
      { label: same('Soulwise · 5K+ on Google Play'), live: false },
    ],
    points: [
      {
        en: 'Natal charts calculated with Swiss Ephemeris and drawn as an interactive D3 chart wheel, then explained by AI in plain language.',
        uk: 'Натальні карти рахуються через Swiss Ephemeris, малюються інтерактивним колом на D3, а AI пояснює їх простою мовою.',
        ru: 'Натальные карты считаются через Swiss Ephemeris, рисуются интерактивным кругом на D3, а AI объясняет их простым языком.',
      },
      {
        en: 'Soulwise on Android: 30-second mood and cycle check-ins, and an AI companion that remembers them.',
        uk: 'Soulwise на Android: 30-секундні чек-іни настрою та циклу й AI-компаньйон, який їх памʼятає.',
        ru: 'Soulwise на Android: 30-секундные чек-ины настроения и цикла и AI-компаньон, который их помнит.',
      },
      {
        en: 'Freemium model with a daily free quota and a Premium subscription; cycle data encrypted with a personal key.',
        uk: 'Freemium із денною безкоштовною квотою та Premium-підпискою; дані циклу шифруються особистим ключем.',
        ru: 'Freemium с дневной бесплатной квотой и Premium-подпиской; данные цикла шифруются личным ключом.',
      },
    ],
    links: [
      { label: 'my-zodiac-ai.com', href: 'https://my-zodiac-ai.com/' },
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=org.yakovliev.myzodiacai' },
    ],
  },
  {
    id: 'owlark',
    name: 'Owlark',
    kind: {
      en: 'Energy & sleep rhythm app: find your best hours without a wearable',
      uk: 'Застосунок про енергію та ритм сну: знайдіть свої найкращі години без трекера',
      ru: 'Приложение об энергии и ритме сна: найдите свои лучшие часы без трекера',
    },
    statuses: [
      { label: same('iOS · live'), live: true },
      { label: same('Web app · live'), live: true },
      { label: { en: 'Android · closed testing', uk: 'Android · закритий тест', ru: 'Android · закрытый тест' }, live: false },
    ],
    points: [
      {
        en: 'A two-minute quiz based on the validated rMEQ and μMCTQ questionnaires becomes an hour-by-hour energy curve and a daily plan for light, coffee and sleep.',
        uk: 'Двохвилинний тест на основі валідованих опитувальників rMEQ і μMCTQ стає погодинною кривою енергії та планом дня: світло, кава, сон.',
        ru: 'Двухминутный тест на основе валидированных опросников rMEQ и μMCTQ превращается в почасовую кривую энергии и план дня: свет, кофе, сон.',
      },
      {
        en: 'Optional read-only Apple Health and Health Connect import, home-screen widgets and a consent-based view for two.',
        uk: 'Необовʼязковий імпорт з Apple Health і Health Connect лише на читання, віджети на головному екрані та режим для двох за згодою.',
        ru: 'Необязательный импорт из Apple Health и Health Connect только на чтение, виджеты на главном экране и режим для двоих по согласию.',
      },
      {
        en: 'Every tip cites its study; monthly and yearly in-app subscriptions, with a free trial on the yearly plan.',
        uk: 'Кожна порада посилається на дослідження; місячна й річна підписки в застосунку, пробний період — на річному плані.',
        ru: 'Каждый совет ссылается на исследование; месячная и годовая подписки в приложении, пробный период — на годовом плане.',
      },
    ],
    links: [
      { label: 'owlark.app', href: 'https://owlark.app/' },
      { label: 'App Store', href: 'https://apps.apple.com/us/app/owlark-energy-sleep-rhythm/id6831557343' },
    ],
  },
  {
    id: 'lunarbor',
    name: 'Lunarbor',
    kind: {
      en: 'Mood, habit & cycle journal where a floating garden grows from your days',
      uk: 'Щоденник настрою, звичок і циклу, де з ваших днів виростає сад на острові',
      ru: 'Дневник настроения, привычек и цикла, где из ваших дней вырастает сад на острове',
    },
    statuses: [
      { label: same('Android · live'), live: true },
      { label: { en: 'iOS · coming soon', uk: 'iOS · незабаром', ru: 'iOS · скоро' }, live: false },
    ],
    points: [
      {
        en: 'A one-minute daily check-in drives a game layer: an island that grows, levels, companions and a year drawn as a dome of stars.',
        uk: 'Хвилинний щоденний чек-ін рухає ігровий шар: острів росте, є рівні, компаньйони, а рік стає куполом зірок.',
        ru: 'Минутный ежедневный чек-ин двигает игровой слой: остров растёт, есть уровни, компаньоны, а год становится куполом звёзд.',
      },
      {
        en: 'Selene, an AI companion with a free daily quota and a Premium tier; partner linking by invite that shares only today\'s phase.',
        uk: 'Selene — AI-компаньйон із безкоштовною денною квотою та Premium; партнер підключається за запрошенням і бачить лише сьогоднішню фазу.',
        ru: 'Selene — AI-компаньон с бесплатной дневной квотой и Premium; партнёр подключается по приглашению и видит только сегодняшнюю фазу.',
      },
      {
        en: 'Privacy by design: cycle data encrypted on the phone, notes encrypted with the user\'s own key, hosting in Germany.',
        uk: 'Приватність із самого початку: дані циклу шифруються на телефоні, нотатки — ключем користувача, хостинг у Німеччині.',
        ru: 'Приватность с самого начала: данные цикла шифруются на телефоне, заметки — ключом пользователя, хостинг в Германии.',
      },
    ],
    links: [
      { label: 'lunarbor.app', href: 'https://lunarbor.app/' },
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.myzodiac.companion' },
    ],
  },
];
