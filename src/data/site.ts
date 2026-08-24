export type Locale = 'en' | 'uk' | 'ru';

export const siteUrl = 'https://vaiyav.online';
export const locales: Locale[] = ['en', 'uk', 'ru'];

export const localePath = (locale: Locale, path = '') => {
  const clean = path.replace(/^\//, '').replace(/\/$/, '');
  if (locale === 'en') return clean ? `/${clean}/` : '/';
  return clean ? `/${locale}/${clean}/` : `/${locale}/`;
};

export const copy = {
  en: {
    lang: 'en', title: 'Product Engineer & AI Systems Builder',
    description: 'Valentyn Yakovliev helps founders and small teams turn unclear product opportunities into working systems through product strategy, design and engineering.',
    role: 'Product strategy, systems & delivery',
    hero: 'From a product possibility to a <em>working system.</em>',
    heroText: 'I turn high-potential product ambiguity into a product people can use, pay for and grow with — from the decision to the release.',
    heroNote: 'Remote from Ukraine · open to senior / lead product engineering roles',
    primary: 'View recruiter CV →', secondary: 'Start with a Product rescue note', email: 'Email me',
    proofTitle: 'The work is the point.',
    proofIntro: 'I work across the seams that usually slow a team down: product judgment, interface design, production engineering and the systems that let the work continue after launch.',
    productTitle: 'Product rescue', productText: 'A focused entry point for founders and small teams carrying a real opportunity through an expensive moment of uncertainty.',
    productLink: 'See how I work →',
    whatTitle: 'What I do', whatText: 'Shape the decision, design the experience, build the product and make the next release credible.',
    whoTitle: 'Who I work with', whoText: 'Founders, small product teams and companies that need one accountable owner across product, design and engineering.',
    stackTitle: 'Tech stack', stackText: 'TypeScript · Vue · React · Node.js · NestJS · Python · FastAPI · AI agents · RAG · PostgreSQL · Docker',
    availabilityTitle: 'Availability', availabilityText: 'Open to remote senior / lead roles and focused product engineering engagements.',
    experienceTitle: 'Experience', experienceText: 'Experience across product companies, studios and independent builds — with production AI systems and end-to-end product ownership.',
    methodTitle: 'Make the next move obvious.', methodText: 'Clarify the actual problem, prioritize the decisions and define the smallest credible release.',
    contactTitle: 'Bring the part that is still unclear.', contactText: 'Start with the recruiter CV for a role conversation, or send the product situation that needs a sharper next move.',
    footer: 'Valentyn Yakovliev · Product Engineer & AI Systems Builder',
  },
  uk: {
    lang: 'uk', title: 'Product Engineer і розробник AI-систем',
    description: 'Валентин Яковлєв допомагає фаундерам і малим командам перетворювати нечіткі продуктові можливості на робочі системи — через стратегію, дизайн та інженерію.',
    role: 'Продуктова стратегія, системи й delivery',
    hero: 'Від продуктової можливості до <em>робочої системи.</em>',
    heroText: 'Перетворюю сильну, але нечітку продуктову можливість на продукт, яким користуються, за який платять і який можна розвивати.',
    heroNote: 'Працюю віддалено з України · відкритий до senior / lead ролей',
    primary: 'Відкрити CV для рекрутера →', secondary: 'Почати Product rescue', email: 'Написати email',
    proofTitle: 'Важливий результат роботи.', proofIntro: 'Працюю на стиках, які зазвичай сповільнюють команду: продуктові рішення, дизайн інтерфейсу, production-інженерія та системи після запуску.',
    productTitle: 'Product rescue', productText: 'Сфокусована точка входу для фаундерів і малих команд у момент дорогої продуктової невизначеності.', productLink: 'Як я працюю →',
    whatTitle: 'Що я роблю', whatText: 'Формулюю рішення, проєктую досвід, створюю продукт і роблю наступний реліз реалістичним.',
    whoTitle: 'З ким я працюю', whoText: 'З фаундерами, малими продуктовими командами й компаніями, яким потрібна відповідальність за продукт, дизайн та інженерію.',
    stackTitle: 'Технології', stackText: 'TypeScript · Vue · React · Node.js · NestJS · Python · FastAPI · AI-агенти · RAG · PostgreSQL · Docker',
    availabilityTitle: 'Доступність', availabilityText: 'Відкритий до віддалених senior / lead ролей і сфокусованих продуктових задач.',
    experienceTitle: 'Досвід', experienceText: 'Досвід у продуктових компаніях, студіях і незалежних запусках — із production AI-системами та повною відповідальністю за продукт.',
    methodTitle: 'Зробити наступний крок очевидним.', methodText: 'Уточнити проблему, визначити пріоритети й окреслити найменший реалістичний реліз.',
    contactTitle: 'Принесіть частину, яка досі нечітка.', contactText: 'Почніть із CV для рекрутера або надішліть продуктовий контекст, якому потрібен чіткіший наступний крок.',
    footer: 'Валентин Яковлєв · Product Engineer і розробник AI-систем',
  },
  ru: {
    lang: 'ru', title: 'Product Engineer и разработчик AI-систем',
    description: 'Валентин Яковлев помогает фаундерам и небольшим командам превращать неясные продуктовые возможности в работающие системы — через стратегию, дизайн и инженерию.',
    role: 'Продуктовая стратегия, системы и delivery',
    hero: 'От продуктовой возможности к <em>рабочей системе.</em>',
    heroText: 'Превращаю сильную, но неясную продуктовую возможность в продукт, которым пользуются, за который платят и который можно развивать.',
    heroNote: 'Работаю удалённо из Украины · открыт к senior / lead ролям',
    primary: 'Открыть CV для рекрутера →', secondary: 'Начать Product rescue', email: 'Написать email',
    proofTitle: 'Важен результат работы.', proofIntro: 'Работаю на стыках, которые обычно замедляют команду: продуктовые решения, дизайн интерфейса, production-инженерия и системы после запуска.',
    productTitle: 'Product rescue', productText: 'Сфокусированная точка входа для фаундеров и небольших команд в момент дорогой продуктовой неопределённости.', productLink: 'Как я работаю →',
    whatTitle: 'Что я делаю', whatText: 'Формулирую решение, проектирую опыт, создаю продукт и делаю следующий релиз реалистичным.',
    whoTitle: 'С кем я работаю', whoText: 'С фаундерами, небольшими продуктовыми командами и компаниями, которым нужна ответственность за продукт, дизайн и инженерию.',
    stackTitle: 'Технологии', stackText: 'TypeScript · Vue · React · Node.js · NestJS · Python · FastAPI · AI-агенты · RAG · PostgreSQL · Docker',
    availabilityTitle: 'Доступность', availabilityText: 'Открыт к удалённым senior / lead ролям и сфокусированным продуктовым задачам.',
    experienceTitle: 'Опыт', experienceText: 'Опыт в продуктовых компаниях, студиях и независимых запусках — с production AI-системами и полной ответственностью за продукт.',
    methodTitle: 'Сделать следующий шаг очевидным.', methodText: 'Уточнить проблему, расставить приоритеты и определить минимальный реалистичный релиз.',
    contactTitle: 'Принесите часть, которая всё ещё неясна.', contactText: 'Начните с CV для рекрутера или отправьте продуктовый контекст, которому нужен более чёткий следующий шаг.',
    footer: 'Валентин Яковлев · Product Engineer и разработчик AI-систем',
  },
} as const;

export type Copy = (typeof copy)[Locale];

export const links = {
  cv: '/resume-recruiter/resume-recruiter.html',
  email: 'mailto:yakovlev.valentin97@gmail.com',
  linkedin: 'https://www.linkedin.com/in/valentyn-yakovliev-960303140/',
  github: 'https://github.com/vaiyav',
  telegram: 'https://t.me/VaiYav',
};
