

const primaryPalette = [
  { name: "Дальневосточный синий", hex: "#0056a2", rgb: "0-86-162", cmyk: "100-75-00-00", pantone: "Pantone 286C" },
  { name: "Голубой", hex: "#22a8e0", rgb: "34-168-225", cmyk: "72-15-00-00" },
  { name: "Светло-синий", hex: "#9ec6eb", rgb: "158-198-235", cmyk: "24-13-00-00" },
  { name: "Ледяной голубой", hex: "#d4e6fa", rgb: "212-230-250", cmyk: "15-5-00-00" },
  { name: "Темно-синий", hex: "#001d37", rgb: "0-30-55", cmyk: "100-84-47-58" },
  { name: "Глубокий синий", hex: "#0c5082", rgb: "12-80-130", cmyk: "100-73-24-9" },
  { name: "Красный акцент", hex: "#de2327", rgb: "222-35-39", cmyk: "5-100-100-00", pantone: "Pantone 186C" },
];

const colorHeroTiles = [
  { id: "tile-blue", color: "#0056a2" },
  { id: "tile-sky", color: "#22a8e0" },
  { id: "tile-red", color: "#de2327" },
  { id: "tile-dark", color: "#001d37" },
];
const colorHeroGridStates = [
  {
    x: 50,
    y: 50,
  },
  {
    x: 24,
    y: 72,
  },
  {
    x: 78,
    y: 30,
  },
  {
    x: 35,
    y: 34,
  },
  {
    x: 68,
    y: 76,
  },
];
const colorHeroHoldDuration = 1;

function smoothStepEase(progress) {
  return progress * progress * (3 - 2 * progress);
}

function buildColorHeroRects(state) {
  const { x, y } = state;

  return [
    { left: 0, top: 0, width: x, height: y },
    { left: x, top: 0, width: 100 - x, height: y },
    { left: 0, top: y, width: x, height: 100 - y },
    { left: x, top: y, width: 100 - x, height: 100 - y },
  ];
}

const colorHeroTileStates = colorHeroGridStates.map(buildColorHeroRects);

const secondaryPalette = [
  { name: "Арктический изумрудный", hex: "#003b39", rgb: "0-59-57", cmyk: "91-47-61-59" },
  { name: "Изумрудный", hex: "#308d86", rgb: "48-141-134", cmyk: "78-24-49-7" },
  { name: "Глубокий изумрудный", hex: "#0a5c57", rgb: "10-92-87", cmyk: "87-38-58-35" },
  { name: "Светлый арктический", hex: "#cce0e6", rgb: "204-224-230", cmyk: "24-5-10-00" },
  { name: "Ледяной арктический", hex: "#e4f0f2", rgb: "228-240-242", cmyk: "13-2-6-00" },
];

const regimes = [
  { short: "ТОР", title: "Территории опережающего развития", color: "#762a57" },
  { short: "СПВ", title: "Свободный порт Владивосток", color: "#26579a" },
  { short: "КОРФ", title: "Курильские острова Российской Федерации", color: "#5c829f" },
  { short: "САР", title: "Специальный административный район", color: "#4d8b85" },
  { short: "АЗРФ", title: "Арктическая зона Российской Федерации", color: "#51a5da" },
  { short: "ИНТЦ", title: "Инновационный научно-технологический центр", color: "#b5a1ea" },
  { short: "Гектар", title: "Программа гектар", color: "#20453a" },
  { short: "Работа", title: "Программа работа", color: "#2b3a46" },
  { short: "Ипотека", title: "Ипотека 2%", color: "#8a6f8e" },
];

const subsidiaryHeroLogos = [
  { title: "КРДВ Амурская", file: "subsidiary-amurskaya-ru-horizontal.svg" },
  { title: "КРДВ Бурятия", file: "subsidiary-buryatia-ru-horizontal.svg" },
  { title: "КРДВ Камчатка", file: "subsidiary-kamchatka-ru-horizontal.svg" },
  { title: "КРДВ Мурманск", file: "subsidiary-murmansk-ru-horizontal.svg" },
  { title: "КРДВ Приморье", file: "subsidiary-primorye-ru-horizontal.svg" },
  { title: "КРДВ Сахалин и Курилы", file: "subsidiary-sakhalin-kurils-ru-horizontal.svg" },
  { title: "КРДВ Забайкалье", file: "subsidiary-zabaikalye-ru-horizontal.svg" },
  { title: "КРДВ Хабаровск", file: "subsidiary-khabarovsk-ru-horizontal.svg" },
  { title: "КРДВ Чукотка", file: "subsidiary-chukotka-ru-horizontal.svg" },
  { title: "КРДВ Якутия", file: "subsidiary-yakutia-ru-horizontal.svg" },
];

const regimeNotes = {
  ТОР: "Используется для коммуникаций о территориях опережающего развития: промышленные площадки, инфраструктура, резиденты и меры поддержки.",
  СПВ: "Маркирует материалы о свободном порте Владивосток, портовой инфраструктуре, логистике и международных сценариях.",
  КОРФ: "Подходит для коммуникаций о Курильских островах Российской Федерации и связанных проектах развития.",
  САР: "Используется в материалах о специальных административных районах и правовых режимах для бизнеса.",
  АЗРФ: "Выделяет арктическую повестку, Северный морской путь, инфраструктуру и проекты в Арктической зоне.",
  ИНТЦ: "Маркирует инновационные, научные и технологические проекты в системе поддержки КРДВ.",
  Гектар: "Применяется в сообщениях о земельной программе и возможностях развития территорий.",
  Работа: "Помогает быстро считывать кадровые, карьерные и образовательные коммуникации.",
  Ипотека: "Отдельный маркер для льготных ипотечных программ и жилищных сценариев.",
};

const regimeColorCoding = ["Гектар", "СПВ", "КОРФ", "ТОР", "САР", "Работа", "АЗРФ", "Ипотека", "ИНТЦ"]
  .map((short) => regimes.find((item) => item.short === short))
  .filter(Boolean);

const positioningPrinciples = [
  { title: "Качественно", text: "Экспертиза, точность и профессиональный опыт в каждом контакте с аудиторией." },
  { title: "Просто", text: "Понятный путь к мерам поддержки, цифровым сервисам и практическим решениям." },
  { title: "Выгодно", text: "Льготы, инфраструктура и условия, которые усиливают экономику проектов." },
  { title: "Надежно", text: "Ответственная поддержка граждан и бизнеса в долгих сценариях развития." },
];

const textRecommendationImages = [
  { title: "Кавычки", caption: "Контроль русских кавычек «елочки» и вложенных „лапок“.", file: "text-recommendation-1.png" },
  { title: "Тире", caption: "Разделение длинного тире в предложении и среднего тире в числовых интервалах.", file: "text-recommendation-2.png" },
  { title: "Деньги", caption: "Неразрывный пробел между суммой и знаком валюты при постпозиции.", file: "text-recommendation-3.png" },
  { title: "Телефоны", caption: "Единая запись номера с кодом страны, кодом города и группами цифр.", file: "text-recommendation-4.png" },
  { title: "Сокращения", caption: "Сокращенные слова с точкой и физические единицы СИ без точки.", file: "text-recommendation-5.png" },
  { title: "Млн и млрд", caption: "Количественные сокращения без точки в деловых и презентационных текстах.", file: "text-recommendation-6.png" },
  { title: "География", caption: "Родовые термины, стороны света, официальные и неофициальные названия регионов.", file: "text-recommendation-7.png" },
  { title: "Финальная проверка", caption: "Пробелы, служебные слова и знаки приводятся к единому наборному стандарту.", file: "text-recommendation-8.png" },
];

export { primaryPalette, colorHeroTiles, colorHeroHoldDuration, smoothStepEase, colorHeroTileStates, secondaryPalette, regimes, subsidiaryHeroLogos, regimeNotes, regimeColorCoding, positioningPrinciples, textRecommendationImages };
