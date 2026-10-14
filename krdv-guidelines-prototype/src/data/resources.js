import { regimes, regimeNotes } from "./palette.js";

const downloadResources = {
  subsidiaryLogos: {
    title: "Логотипы дочерних обществ",
    description: "Архив с логотипами ДО.",
    url: "https://disk.yandex.ru/d/YWZuuTkhvI0ijQ",
  },
  regimeLogos: {
    title: "Логотипы преференциальных режимов",
    description: "Архив со знаками и логотипами режимов.",
    url: "https://disk.yandex.ru/d/MKhMUbEWmLDgtQ",
  },
  businessCardsQr: {
    title: "Шаблон визиток с QR",
    description: "Макеты визиток, где контактный блок дополнен отдельной QR-зоной.",
    url: "https://disk.yandex.ru/d/Lx5eljRnfTYw7w",
  },
  businessCardsSubsidiary: {
    title: "Шаблон визиток ДО",
    description: "Комплект для адаптации визиток под фирменные знаки дочерних обществ.",
    url: "https://disk.yandex.ru/d/-3bHMVTnX4taLg",
  },
  subsidiaryLetterheads: {
    title: "Шаблон бланков ДО",
    description: "Фирменные бланки дочерних обществ с реквизитной частью.",
    url: "https://disk.yandex.ru/d/B70KKs8icO9yMA",
  },
  awards: {
    title: "Шаблон наградных документов",
    description: "Макеты грамот, благодарностей и писем с зонами фольгирования.",
    url: "https://disk.yandex.ru/d/CPo-pkUooJU_Lg",
  },
  madeSigns: {
    title: "Знак «Сделано в ТОР СПВ»",
    description: "Общий архив с версиями товарного знака.",
    url: "https://disk.yandex.ru/d/hwgUiBntRmelpA",
  },
  madeFarEastSigns: {
    title: "Знак «Сделано на Дальнем Востоке и в Арктике»",
    description: "Оригинальные версии знака и дополнительные форматы для скачивания.",
    url: "https://disk.yandex.ru/d/w1QaGJWiVcbf7Q",
  },
  socialGuide: {
    title: "Гайд по социальным сетям",
    description: "Материалы и правила оформления социальных сетей.",
    url: "https://disk.yandex.ru/d/ORusuBrCiRIEdw",
  },
};

const allDownloadResourceKeys = [
  "subsidiaryLogos",
  "regimeLogos",
  "businessCardsQr",
  "businessCardsSubsidiary",
  "subsidiaryLetterheads",
  "awards",
  "madeSigns",
  "madeFarEastSigns",
  "socialGuide",
];

const logoFormats = ["svg", "png", "jpg", "pdf", "eps"];
const regimeSignFormats = ["svg", "png", "pdf"];
const subsidiaryFormats = ["svg", "png", "pdf"];
const madeSignFormats = ["svg", "png", "jpg"];

const ttNormsFontFiles = [
  { label: "Thin", weight: 100, style: "normal", file: "TT-Norms-Pro-Thin.ttf" },
  { label: "Thin Italic", weight: 100, style: "italic", file: "TT-Norms-Pro-Thin-Italic.ttf" },
  { label: "ExtraLight", weight: 200, style: "normal", file: "TT-Norms-Pro-ExtraLight.ttf" },
  { label: "ExtraLight Italic", weight: 200, style: "italic", file: "TT-Norms-Pro-ExtraLight-Italic.ttf" },
  { label: "Light", weight: 300, style: "normal", file: "TT-Norms-Pro-Light.ttf" },
  { label: "Light Italic", weight: 300, style: "italic", file: "TT-Norms-Pro-Light-Italic.ttf" },
  { label: "Normal", weight: 350, style: "normal", file: "TT-Norms-Pro-Normal.ttf" },
  { label: "Normal Italic", weight: 350, style: "italic", file: "TT-Norms-Pro-Normal-Italic.ttf" },
  { label: "Regular", weight: 400, style: "normal", file: "TT-Norms-Pro-Regular.ttf" },
  { label: "Italic", weight: 400, style: "italic", file: "TT-Norms-Pro-Italic.ttf" },
  { label: "Medium", weight: 500, style: "normal", file: "TT-Norms-Pro-Medium.ttf" },
  { label: "Medium Italic", weight: 500, style: "italic", file: "TT-Norms-Pro-Medium-Italic.ttf" },
  { label: "DemiBold", weight: 600, style: "normal", file: "TT-Norms-Pro-DemiBold.ttf" },
  { label: "DemiBold Italic", weight: 600, style: "italic", file: "TT-Norms-Pro-DemiBold-Italic.ttf" },
  { label: "Bold", weight: 700, style: "normal", file: "TT-Norms-Pro-Bold.ttf" },
  { label: "Bold Italic", weight: 700, style: "italic", file: "TT-Norms-Pro-Bold-Italic.ttf" },
  { label: "ExtraBold", weight: 800, style: "normal", file: "TT-Norms-Pro-ExtraBold.ttf" },
  { label: "ExtraBold Italic", weight: 800, style: "italic", file: "TT-Norms-Pro-ExtraBold-Italic.ttf" },
  { label: "Black", weight: 900, style: "normal", file: "TT-Norms-Pro-Black.ttf" },
  { label: "Black Italic", weight: 900, style: "italic", file: "TT-Norms-Pro-Black-Italic.ttf" },
  { label: "ExtraBlack", weight: 950, style: "normal", file: "TT-Norms-Pro-ExtraBlack.ttf" },
  { label: "ExtraBlack Italic", weight: 950, style: "italic", file: "TT-Norms-Pro-ExtraBlack-Italic.ttf" },
];

const ttTsarsFontFiles = [
  { label: "Regular", weight: 400, style: "normal", file: "TT-Tsars-A-Regular.woff2" },
  { label: "Bold", weight: 700, style: "normal", file: "TT-Tsars-A-Bold.woff2" },
];

const fontFamilies = [
  {
    id: "norms",
    title: "TT Norms Pro",
    role: "Основная фирменная гарнитура",
    cssFamily: "TT Norms Pro",
    sample: "Единый стиль делает систему понятной",
    description: "Гротеск для заголовков, наборного текста, презентаций, рекламно-информационных материалов и интерфейсов.",
    defaultFile: "TT-Norms-Pro-DemiBold.ttf",
    files: ttNormsFontFiles,
  },
  {
    id: "serif",
    title: "TT Norms Pro Serif",
    role: "Акцидентная фирменная пара",
    cssFamily: "Georgia",
    sample: "Территория будущего начинается с ясной коммуникации",
    description: "Семейство используется как второй, преимущественно акцидентный элемент шрифтовой пары.",
    unavailable: "Для Serif-семейства используется отдельный лицензионный пакет TypeType.",
    files: [],
  },
  {
    id: "tsars",
    title: "TT Tsars A",
    role: "Торжественная документация",
    cssFamily: "TT Tsars",
    sample: "Грамота за развитие территорий",
    description: "Гарнитура для благодарностей, благодарственных писем, почетных грамот и других наградных документов.",
    defaultFile: "TT-Tsars-A-Regular.woff2",
    files: ttTsarsFontFiles,
  },
];

const logoVariants = {
  "ru-horizontal": {
    title: "Русская горизонтальная версия",
    role: "Дополнительная версия",
    description: "Дополнительная горизонтальная компоновка для широких носителей с ограниченной высотой.",
    preview: "krdv-logo-ru-horizontal.svg",
    kind: "horizontal",
    files: {
      svg: "krdv-logo-ru-horizontal.svg",
      png: "krdv-logo-ru-horizontal.png",
      jpg: "krdv-logo-ru-horizontal.jpg",
      pdf: "krdv-logo-ru-horizontal.pdf",
      eps: "krdv-logo-ru-horizontal.eps",
    },
  },
  "ru-square": {
    title: "Русская вертикальная версия",
    role: "Основная версия",
    description: "Основная фирменная компоновка для деловых, цифровых и рекламных материалов.",
    preview: "krdv-logo-ru-square.svg",
    kind: "square",
    files: {
      svg: "krdv-logo-ru-square.svg",
      png: "krdv-logo-ru-square.png",
      jpg: "krdv-logo-ru-square.jpg",
      pdf: "krdv-logo-ru-square.pdf",
      eps: "krdv-logo-ru-square.eps",
    },
  },
  "en-horizontal": {
    title: "Английская горизонтальная версия",
    role: "Дополнительная международная версия",
    description: "Дополнительная горизонтальная компоновка для англоязычных материалов.",
    preview: "krdv-logo-en-horizontal.svg",
    kind: "horizontal",
    files: {
      svg: "krdv-logo-en-horizontal.svg",
      png: "krdv-logo-en-horizontal.png",
      jpg: "krdv-logo-en-horizontal.jpg",
      pdf: "krdv-logo-en-horizontal.pdf",
      eps: "krdv-logo-en-horizontal.eps",
    },
  },
  "en-square": {
    title: "Английская вертикальная версия",
    role: "Основная международная версия",
    description: "Основная англоязычная компоновка для международных коммуникаций.",
    preview: "krdv-logo-en-square.svg",
    kind: "square",
    files: {
      svg: "krdv-logo-en-square.svg",
      png: "krdv-logo-en-square.png",
      jpg: "krdv-logo-en-square.jpg",
      pdf: "krdv-logo-en-square.pdf",
      eps: "krdv-logo-en-square.eps",
    },
  },
};

const subsidiaryVersionLabels = {
  "ru-horizontal": "Русская горизонтальная версия",
  "ru-vertical": "Русская вертикальная версия",
  "en-horizontal": "Английская горизонтальная версия",
  "en-vertical": "Английская вертикальная версия",
};

const subsidiaryLogos = [
  { set: "ru-horizontal", slug: "amurskaya", title: "КРДВ Амурская" },
  { set: "ru-horizontal", slug: "buryatia", title: "КРДВ Бурятия" },
  { set: "ru-horizontal", slug: "murmansk", title: "КРДВ Мурманск" },
  { set: "ru-horizontal", slug: "primorye", title: "КРДВ Приморье" },
  { set: "ru-horizontal", slug: "zabaikalye", title: "КРДВ Забайкалье" },
  { set: "ru-horizontal", slug: "kamchatka", title: "КРДВ Камчатка" },
  { set: "ru-horizontal", slug: "sakhalin-kurils", title: "КРДВ Сахалин и Курилы" },
  { set: "ru-horizontal", slug: "khabarovsk", title: "КРДВ Хабаровск" },
  { set: "ru-horizontal", slug: "chukotka", title: "КРДВ Чукотка" },
  { set: "ru-horizontal", slug: "yakutia", title: "КРДВ Якутия" },
  { set: "ru-vertical", slug: "amurskaya", title: "КРДВ Амурская" },
  { set: "ru-vertical", slug: "buryatia", title: "КРДВ Бурятия" },
  { set: "ru-vertical", slug: "murmansk", title: "КРДВ Мурманск" },
  { set: "ru-vertical", slug: "primorye", title: "КРДВ Приморье" },
  { set: "ru-vertical", slug: "khabarovsk", title: "КРДВ Хабаровск" },
  { set: "ru-vertical", slug: "sakhalin-kurils", title: "КРДВ Сахалин и Курилы" },
  { set: "ru-vertical", slug: "kamchatka", title: "КРДВ Камчатка" },
  { set: "ru-vertical", slug: "zabaikalye", title: "КРДВ Забайкалье" },
  { set: "ru-vertical", slug: "chukotka", title: "КРДВ Чукотка" },
  { set: "ru-vertical", slug: "yakutia", title: "КРДВ Якутия" },
  { set: "ru-vertical", slug: "kamchatka-extra", title: "КРДВ Камчатка", note: "Дополнительный вариант из архива." },
  { set: "en-horizontal", slug: "amurskaya", title: "FEDC Amurskaya" },
  { set: "en-horizontal", slug: "buryatia", title: "FEDC Buryatia" },
  { set: "en-horizontal", slug: "murmansk", title: "FEDC Murmansk" },
  { set: "en-horizontal", slug: "primorye", title: "FEDC Primorye" },
  { set: "en-horizontal", slug: "khabarovsk", title: "FEDC Khabarovsk" },
  { set: "en-horizontal", slug: "sakhalin-kurils", title: "FEDC Sakhalin and the Kurils" },
  { set: "en-horizontal", slug: "kamchatka", title: "FEDC Kamchatka" },
  { set: "en-horizontal", slug: "zabaikalye", title: "FEDC Zabaikalye" },
  { set: "en-horizontal", slug: "chukotka", title: "FEDC Chukotka" },
  { set: "en-horizontal", slug: "yakutia", title: "FEDC Yakutia" },
  { set: "en-vertical", slug: "amurskaya", title: "FEDC Amurskaya" },
  { set: "en-vertical", slug: "buryatia", title: "FEDC Buryatia" },
  { set: "en-vertical", slug: "murmansk", title: "FEDC Murmansk" },
  { set: "en-vertical", slug: "primorye", title: "FEDC Primorye" },
  { set: "en-vertical", slug: "khabarovsk", title: "FEDC Khabarovsk" },
  { set: "en-vertical", slug: "sakhalin-kurils", title: "FEDC Sakhalin and the Kurils" },
  { set: "en-vertical", slug: "kamchatka", title: "FEDC Kamchatka" },
  { set: "en-vertical", slug: "zabaikalye", title: "FEDC Zabaikalye" },
  { set: "en-vertical", slug: "chukotka", title: "FEDC Chukotka" },
  { set: "en-vertical", slug: "yakutia", title: "FEDC Yakutia" },
].map((item) => {
  const [lang, orientation] = item.set.split("-");
  const base = `subsidiary-${item.slug}-${lang}-${orientation}`;

  return {
    ...item,
    orientation,
    versionLabel: subsidiaryVersionLabels[item.set],
    preview: `${base}.svg`,
    files: {
      svg: `${base}.svg`,
      png: `${base}.png`,
      pdf: `${base}.pdf`,
    },
  };
});

const subsidiaryLogoSets = subsidiaryLogos.reduce((sets, item) => {
  sets[item.set] = [...(sets[item.set] || []), item];
  return sets;
}, {});

const regimeSignLogos = [
  { slug: "tor", short: "ТОР", title: "Территории опережающего развития" },
  { slug: "spv", short: "СПВ", title: "Свободный порт Владивосток" },
  { slug: "korf", short: "КОРФ", title: "Курильские острова Российской Федерации" },
  { slug: "sar", short: "САР", title: "Специальный административный район" },
  { slug: "azrf", short: "АЗРФ", title: "Арктическая зона Российской Федерации" },
  { slug: "intc", short: "ИНТЦ", title: "Инновационный научно-технологический центр" },
].map((item) => ({
  ...item,
  color: regimes.find((regime) => regime.short === item.short)?.color || "#050505",
  description: regimeNotes[item.short],
  preview: `regime-${item.slug}.svg`,
  files: {
    svg: `regime-${item.slug}.svg`,
    png: `regime-${item.slug}.png`,
    pdf: `regime-${item.slug}.pdf`,
  },
}));

const madeSignVariants = [
  { slug: "made-tor-spv-ru-purple", title: "Русская фиолетовая версия", tone: "purple" },
  { slug: "made-tor-spv-ru-black", title: "Русская черная версия", tone: "black" },
  { slug: "made-tor-spv-ru-outline", title: "Русская контурная версия", tone: "outline" },
  { slug: "made-tor-spv-ru-white", title: "Русская белая версия", tone: "white" },
  { slug: "made-tor-spv-en-purple", title: "Английская фиолетовая версия", tone: "purple" },
  { slug: "made-tor-spv-en-black", title: "Английская черная версия", tone: "black" },
  { slug: "made-tor-spv-en-outline", title: "Английская контурная версия", tone: "outline" },
].map((item) => ({
  ...item,
  preview: `${item.slug}.svg`,
  files: {
    svg: `${item.slug}.svg`,
    png: `${item.slug}.png`,
    jpg: `${item.slug}.jpg`,
  },
}));

const madeFarEastVariants = [
  { slug: "made-dvia-ru-purple", title: "Русская фиолетовая версия", tone: "purple" },
  { slug: "made-dvia-en-purple", title: "Английская фиолетовая версия", tone: "purple" },
  { slug: "made-dvia-ru-black", title: "Русская черная версия", tone: "black" },
  { slug: "made-dvia-en-black", title: "Английская черная версия", tone: "black" },
].map((item) => ({
  ...item,
  preview: item.slug + ".svg",
  files: { svg: item.slug + ".svg" },
}));
const madeBrandingImages = [
  { title: "Упаковка резидента", caption: "Знак размещается как подтверждение происхождения продукции.", file: "made-branding-1.webp" },
  { title: "Пищевая продукция", caption: "Маркировка работает на этикетке и поддерживает доверие к производителю.", file: "made-branding-2.webp" },
  { title: "Серия упаковок", caption: "Единый знак помогает связать несколько товаров в одну линейку.", file: "made-branding-3.webp" },
  { title: "Бирка товара", caption: "Малый носитель сохраняет знак читаемым без лишней графики.", file: "made-branding-4.webp" },
  { title: "Потребительская тара", caption: "Размещение подбирается под форму и контраст упаковки.", file: "made-branding-5.webp" },
  { title: "Полка продукции", caption: "Серийное нанесение делает маркировку заметной в группе товаров.", file: "made-branding-6.webp", wide: true },
];

const photostyleImages = {
  infrastructure: [
    { title: "Ледокол и Северный морской путь", caption: "Инфраструктурный кадр для тем Арктики и транспортного развития.", file: "photostyle-composition-1.webp" },
    { title: "Командный кадр", caption: "Сюжет единства, общих целей и прогресса.", file: "photostyle-composition-2.webp" },
    { title: "Промышленный объект", caption: "Работающее предприятие как подтверждение результата.", file: "photostyle-composition-3.webp" },
    { title: "Проект на территории", caption: "Региональный проект с понятным контекстом места.", file: "photostyle-composition-4.webp" },
    { title: "Технологичное производство", caption: "Производственная среда и выращивание продукции.", file: "photostyle-composition-11.webp" },
    { title: "Инфраструктура города", caption: "Мост, портовый и городской масштаб Дальнего Востока.", file: "photostyle-composition-12.webp" },
  ],
  events: [
    { title: "Вовлеченная аудитория", caption: "Событие с участниками, которые включены в процесс.", file: "photostyle-composition-7.webp" },
  ],
  nature: [
    { title: "Полярное сияние", caption: "Захватывающий природный кадр Арктики.", file: "photostyle-composition-10.webp" },
    { title: "Вулканический пейзаж", caption: "Достоверный региональный пейзаж Дальнего Востока.", file: "photostyle-composition-9.webp" },
    { title: "Арктический маршрут", caption: "Природа и маршрут в условиях северного региона.", file: "photostyle-composition-15.webp" },
  ],
  people: [
    { title: "Культурный сюжет", caption: "Люди в контексте традиций и региональной культуры.", file: "photostyle-composition-5.webp" },
    { title: "Аутентичный сюжет", caption: "Сюжет с действием и культурным контекстом.", file: "photostyle-composition-13.webp" },
    { title: "Люди Арктики", caption: "Портретный сюжет с северной повседневностью.", file: "photostyle-composition-14.webp" },
    { title: "Традиционное выступление", caption: "Эмоциональный кадр людей и культуры региона.", file: "photostyle-composition-16.webp" },
  ],
};


const logoMisuseImages = [
  { title: "Старые версии", caption: "Запрещено использовать старые версии логотипа.", file: "logo-misuse-1.png" },
  { title: "Цвет", caption: "Запрещено изменение цвета.", file: "logo-misuse-2.png" },
  { title: "Знак без текста", caption: "Не допускается использование знака без текстовой части логотипа.", file: "logo-misuse-3.png" },
  { title: "Пропорции", caption: "Не допускается искажение пропорций элементов логотипа.", file: "logo-misuse-4.png" },
  { title: "Изменение типографики", caption: "Запрещено изменять типографику логотипа.", file: "logo-misuse-5.png" },
  { title: "Эффекты", caption: "Запрещено использовать дополнительные эффекты для элементов логотипа.", file: "logo-misuse-6.png" },
];

const logoBackgroundRuleImages = Array.from({ length: 8 }, (_, index) => ({
  title: `Фон и контраст ${index + 1}`,
  file: `logo-background-rule-${index + 1}.png`,
  embeddedText: true,
}));

export { downloadResources, allDownloadResourceKeys, logoFormats, regimeSignFormats, subsidiaryFormats, madeSignFormats, fontFamilies, logoVariants, subsidiaryLogos, subsidiaryLogoSets, regimeSignLogos, madeSignVariants, madeFarEastVariants, madeBrandingImages, photostyleImages, logoMisuseImages, logoBackgroundRuleImages };
