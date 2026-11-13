import type { Locale } from './site';

interface Fact { readonly lead: string; readonly text: string }
interface Step { readonly title: string; readonly text: string }

export interface HomeCopy {
  readonly skip: string;
  readonly nav: { readonly products: string; readonly about: string; readonly rescue: string; readonly notes: string; readonly cv: string; readonly label: string; readonly language: string };
  readonly arcade: { readonly label: string; readonly title: string; readonly text: string; readonly soon: string; readonly start: string; readonly fallback: string; readonly coverAlt: string };
  readonly facts: readonly Fact[];
  readonly factsLabel: string;
  readonly about: { readonly index: string; readonly title: string; readonly intro: string; readonly portraitAlt: string; readonly caption: string };
  readonly rescue: { readonly index: string; readonly steps: readonly Step[] };
  readonly contactEyebrow: string;
  readonly footer: { readonly pages: string; readonly contact: string; readonly ai: string; readonly fullStack: string; readonly product: string; readonly telegram: string };
}

export const homeCopy: Readonly<Record<Locale, HomeCopy>> = {
  en: {
    skip: 'Skip to content',
    nav: { products: 'Products', about: 'About', rescue: 'Product rescue', notes: 'Notes', cv: 'Recruiter CV', label: 'Primary navigation', language: 'Choose language' },
    arcade: {
      label: 'Interactive résumé',
      title: 'Walk through the work.',
      text: 'A small pixel office you can explore. Every object in it opens a part of my résumé.',
      soon: 'In development, opens here soon',
      start: 'Start the game',
      fallback: 'Read the CV for now',
      coverAlt: 'Valentyn Yakovliev lit in magenta and cyan, the title screen of the résumé game',
    },
    factsLabel: 'In short',
    facts: [
      { lead: '3 live products', text: 'designed, built and shipped solo' },
      { lead: 'Web, iOS, Android', text: 'from the first decision to the store release' },
      { lead: 'AI in production', text: 'agents, retrieval and cost control that hold up' },
    ],
    about: {
      index: 'About',
      title: 'Useful context, plainly stated.',
      intro: 'Short answers for a recruiter or founder who needs to understand the work quickly.',
      portraitAlt: 'Portrait of Valentyn Yakovliev',
      caption: 'Valentyn Yakovliev, product builder',
    },
    rescue: {
      index: 'Product rescue',
      steps: [
        { title: 'Clarify', text: 'Find the actual user, decision and constraint behind the noisy brief.' },
        { title: 'Prioritize', text: 'Turn the unknowns into a sequence of choices the team can own.' },
        { title: 'Launch', text: 'Define the smallest credible release and the proof it must create.' },
      ],
    },
    contactEyebrow: 'Start with the real situation',
    footer: { pages: 'Pages', contact: 'Contact', ai: 'AI engineer', fullStack: 'Full-stack engineer', product: 'Product engineer', telegram: 'Telegram' },
  },
  uk: {
    skip: 'Перейти до змісту',
    nav: { products: 'Продукти', about: 'Про мене', rescue: 'Product rescue', notes: 'Нотатки', cv: 'CV для рекрутера', label: 'Основна навігація', language: 'Оберіть мову' },
    arcade: {
      label: 'Інтерактивне резюме',
      title: 'Пройдіться по моїй роботі.',
      text: 'Невеликий піксельний офіс, яким можна ходити. Кожен предмет у ньому відкриває частину мого резюме.',
      soon: 'У розробці, скоро відкриється тут',
      start: 'Почати гру',
      fallback: 'Поки що відкрити CV',
      coverAlt: 'Валентин Яковлєв у маджентовому й ціановому світлі, титульний екран гри-резюме',
    },
    factsLabel: 'Коротко',
    facts: [
      { lead: '3 живі продукти', text: 'спроєктовані, зроблені й запущені самотужки' },
      { lead: 'Web, iOS, Android', text: 'від першого рішення до релізу в сторі' },
      { lead: 'AI у production', text: 'агенти, retrieval і контроль вартості, які витримують навантаження' },
    ],
    about: {
      index: 'Про мене',
      title: 'Корисний контекст, сказаний прямо.',
      intro: 'Короткі відповіді для рекрутера чи фаундера, якому треба швидко зрозуміти, чим я займаюсь.',
      portraitAlt: 'Портрет Валентина Яковлєва',
      caption: 'Валентин Яковлєв, product builder',
    },
    rescue: {
      index: 'Product rescue',
      steps: [
        { title: 'Прояснити', text: 'Знайти справжнього користувача, рішення й обмеження за шумним брифом.' },
        { title: 'Пріоритизувати', text: 'Перетворити невідоме на послідовність рішень, за які команда може відповідати.' },
        { title: 'Запустити', text: 'Визначити найменший реалістичний реліз і доказ, який він має дати.' },
      ],
    },
    contactEyebrow: 'Почніть із реальної ситуації',
    footer: { pages: 'Сторінки', contact: 'Контакти', ai: 'AI-інженер', fullStack: 'Full-stack інженер', product: 'Product engineer', telegram: 'Telegram' },
  },
  ru: {
    skip: 'Перейти к содержанию',
    nav: { products: 'Продукты', about: 'Обо мне', rescue: 'Product rescue', notes: 'Заметки', cv: 'CV для рекрутера', label: 'Основная навигация', language: 'Выберите язык' },
    arcade: {
      label: 'Интерактивное резюме',
      title: 'Пройдитесь по моей работе.',
      text: 'Небольшой пиксельный офис, по которому можно ходить. Каждый предмет в нём открывает часть моего резюме.',
      soon: 'В разработке, скоро откроется здесь',
      start: 'Начать игру',
      fallback: 'Пока открыть CV',
      coverAlt: 'Валентин Яковлев в маджентовом и циановом свете, титульный экран игры-резюме',
    },
    factsLabel: 'Коротко',
    facts: [
      { lead: '3 живых продукта', text: 'спроектированы, сделаны и запущены в одиночку' },
      { lead: 'Web, iOS, Android', text: 'от первого решения до релиза в сторе' },
      { lead: 'AI в production', text: 'агенты, retrieval и контроль стоимости, которые выдерживают нагрузку' },
    ],
    about: {
      index: 'Обо мне',
      title: 'Полезный контекст, сказанный прямо.',
      intro: 'Короткие ответы для рекрутера или фаундера, которому нужно быстро понять, чем я занимаюсь.',
      portraitAlt: 'Портрет Валентина Яковлева',
      caption: 'Валентин Яковлев, product builder',
    },
    rescue: {
      index: 'Product rescue',
      steps: [
        { title: 'Прояснить', text: 'Найти настоящего пользователя, решение и ограничение за шумным брифом.' },
        { title: 'Приоритизировать', text: 'Превратить неизвестное в последовательность решений, за которые команда может отвечать.' },
        { title: 'Запустить', text: 'Определить минимальный реалистичный релиз и доказательство, которое он должен дать.' },
      ],
    },
    contactEyebrow: 'Начните с реальной ситуации',
    footer: { pages: 'Страницы', contact: 'Контакты', ai: 'AI-инженер', fullStack: 'Full-stack инженер', product: 'Product engineer', telegram: 'Telegram' },
  },
};
