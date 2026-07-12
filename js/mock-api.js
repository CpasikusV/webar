/**
 * MOCK-API
 * -----------------------------------------------------------------------
 * Данные ниже — выгрузка склада "65 ряд" (файл 65_ряд_1_5.xls), 91 ячейка,
 * плюс 3 демо-записи (DEMO-001..003) для тестовых QR из assets/.
 *
 * Готового API-слоя над WMS/1С ещё нет (Этап 0 из ТЗ), поэтому этот файл
 * по-прежнему имитирует будущий middleware-эндпоинт:
 *
 *   GET https://wms-middleware.company.local/api/v1/cell/{marker_id}
 *
 * Когда появится реальный API — замените fetchCellFromNetwork() в api.js,
 * форма ответа (cell/sku/name/qty/status) сохраняется без изменений.
 *
 * Статус "reserved" по умолчанию присваивается всем строкам, чей статус
 * из выгрузки не входит в STATUS_MAP ниже (сейчас все 91 строка имеют
 * статус "Кондиция" -> "ok"). Когда в выгрузке появятся "Брак"/"Резерв" —
 * допишите их в STATUS_MAP при следующей генерации данных.
 * -----------------------------------------------------------------------
 */

const MOCK_DB = {
  "650111": { cell: "650111", sku: "995417", name: "Корм для котів Favore з м'ясом тунця та лосося (80г)", qty: 624, status: "ok" },
  "650112": { cell: "650112", sku: "5573", name: "Горчица ВХС Винницкая (125г)", qty: 720, status: "ok" },
  "650211": { cell: "650211", sku: "868755", name: "Вермут Salute Bianco белый десертный (1л)", qty: 12, status: "ok" },
  "650212": { cell: "650212", sku: "703869", name: "Вермут Fratelli МохитоБел (1л)", qty: 12, status: "ok" },
  "650311": { cell: "650311", sku: "887817", name: "Настойка Nemiroff De Luxe Пекучая груша (0,1л)", qty: 60, status: "ok" },
  "650411": { cell: "650411", sku: "990219", name: "Настоянка Hetman Citrus (500мл)", qty: 12, status: "ok" },
  "650412": { cell: "650412", sku: "991323", name: "Нaпій Живчик з соком яблук та екстракт лаванди з/б (0,33л)", qty: 144, status: "ok" },
  "650511": { cell: "650511", sku: "932033", name: "Вино Les Sonnailles Rouge червоне сухе (0,75л)", qty: 6, status: "ok" },
  "650512": { cell: "650512", sku: "1002544", name: "Помідори Favore цілі очищені в томатному соку (400г)", qty: 24, status: "ok" },
  "650611": { cell: "650611", sku: "932041", name: "Вино ігристе J.Kieffer Demi-Sec Rose рож н/солодке (0,75л)", qty: 96, status: "ok" },
  "650612": { cell: "650612", sku: "1025243", name: "Напій винний Bolgrad Алазанська долина черв н/сол (0,75л)", qty: 24, status: "ok" },
  "65071": { cell: "65071", sku: "1014628", name: "Паштет Banga з ікри та печінки тріски (100г)", qty: 3780, status: "ok" },
  "65081": { cell: "65081", sku: "924575", name: "Пиво Lowenbrau Original світле (0,5л)", qty: 620, status: "ok" },
  "65091": { cell: "65091", sku: "977746", name: "Напій слабоалког Punch Club Grapefruit Collins газ (250мл)", qty: 1212, status: "ok" },
  "65101": { cell: "65101", sku: "1011531", name: "Вино ігристе Paul Bernard Semi sweet біле (0,75л)", qty: 12, status: "ok" },
  "65111": { cell: "65111", sku: "1001565", name: "Напій слабоалкогол Tairovo Джин смак грейпфрут з/б (0,5л)", qty: 516, status: "ok" },
  "65121": { cell: "65121", sku: "907570", name: "Напиток соковый Shake SparklingStrawber сил/г жб (330мл)", qty: 768, status: "ok" },
  "65131": { cell: "65131", sku: "966763", name: "Джем Migros полуничний (380г)", qty: 1452, status: "ok" },
  "65161": { cell: "65161", sku: "995038", name: "Вино Aetos Carmenere Reserva червоне сухе (0,75л)", qty: 168, status: "ok" },
  "65171": { cell: "65171", sku: "1023314", name: "Вино ігристе Conde de Caralt Cava Semi seco біле (0,75л)", qty: 294, status: "ok" },
  "65181": { cell: "65181", sku: "965987", name: "Оливки La Explanada фаршировані блакитним сиром (350г)", qty: 1080, status: "ok" },
  "65191": { cell: "65191", sku: "985625", name: "Вино La Croix Carillan CoteauxBourguig AOC чер сух (0,75л)", qty: 168, status: "ok" },
  "65201": { cell: "65201", sku: "993922", name: "Напій винний Таїрово Fragolino білий н/солод газ (1,5л)", qty: 144, status: "ok" },
  "65211": { cell: "65211", sku: "950440", name: "Тунець Favore шматочки в олії (185г)", qty: 720, status: "ok" },
  "65221": { cell: "65221", sku: "1000036", name: "Віскі Horse Rider Бурбон (0,7л)", qty: 426, status: "ok" },
  "65231": { cell: "65231", sku: "982959", name: "Вино Asymmetric Marlborough SauvignonBlanc біл сух (0,75л)", qty: 312, status: "ok" },
  "65241": { cell: "65241", sku: "952773", name: "Горілка Миронівська Пшенична нива (0,1л)", qty: 468, status: "ok" },
  "65251": { cell: "65251", sku: "982824", name: "Вино Tomai Embraced by Time Isabella червоне н/сол (1л)", qty: 246, status: "ok" },
  "65261": { cell: "65261", sku: "975415", name: "Вино Castillo Lagomar red (0,75л)", qty: 528, status: "ok" },
  "65271": { cell: "65271", sku: "947908", name: "Напій слабоалкогол King's Bridge Gin&Berry 7% з/б (500мл)", qty: 1512, status: "ok" },
  "65281": { cell: "65281", sku: "993947", name: "Напій алкогольний Fort of Georgia оригінальний 3* (0,5л)", qty: 300, status: "ok" },
  "65291": { cell: "65291", sku: "1009916", name: "Пиво Maradona Lager світле з/б (330мл)", qty: 528, status: "ok" },
  "65301": { cell: "65301", sku: "994708", name: "Напій енергетичний Best Shot Zero Sugar б/алк з/б (500мл)", qty: 264, status: "ok" },
  "65311": { cell: "65311", sku: "963631", name: "Напій соковий Camlica Лимон газований с/б (200мл)", qty: 648, status: "ok" },
  "65321": { cell: "65321", sku: "1015174", name: "Бренді Shabo V.S.O.P 5 зірок (0,5л)", qty: 180, status: "ok" },
  "65331": { cell: "65331", sku: "853424", name: "Вино ігристе Light House безалкогольне (0,75л)", qty: 6, status: "ok" },
  "65341": { cell: "65341", sku: "929318", name: "Вино Montequinto Verdejo біле сухе (0,75л)", qty: 570, status: "ok" },
  "65361": { cell: "65361", sku: "1016064", name: "Бренді Georgian Legend 3 зірки (0,7л)", qty: 252, status: "ok" },
  "65371": { cell: "65371", sku: "929317", name: "Вино Montequinto Bobal рожеве сухе (0,75л)", qty: 126, status: "ok" },
  "65381": { cell: "65381", sku: "1010583", name: "Маслини Oscar без кісточки з/б (200г)", qty: 1440, status: "ok" },
  "65391": { cell: "65391", sku: "998247", name: "Коктейль Bevello Bellini Strawbery н/солодкий (0,75л)", qty: 414, status: "ok" },
  "65401": { cell: "65401", sku: "878772", name: "Джин Finsbury Wild Strawberry (0,7л)", qty: 12, status: "ok" },
  "65411": { cell: "65411", sku: "942604", name: "Джин Stamford London Dry (0,7л)", qty: 360, status: "ok" },
  "65421": { cell: "65421", sku: "739667", name: "Вода минеральная Набеглави газированная ж/б (0,33л)", qty: 1656, status: "ok" },
  "65431": { cell: "65431", sku: "982827", name: "Вино Costa Alicante червоне сухе (0,75л)", qty: 180, status: "ok" },
  "65441": { cell: "65441", sku: "969290", name: "Гриби Favore печериці мариновані пастеризовані (280г)", qty: 1428, status: "ok" },
  "65461": { cell: "65461", sku: "946606", name: "Оливки La Explanada зелені без кісточки з/б (300мл)", qty: 444, status: "ok" },
  "65471": { cell: "65471", sku: "931859", name: "Вино Cadao Douro Vinho Tinto червоне сухе (0,75л)", qty: 42, status: "ok" },
  "65481": { cell: "65481", sku: "932037", name: "Вино La Francette Merlot червоне сухе (0,75л)", qty: 384, status: "ok" },
  "65521": { cell: "65521", sku: "878772", name: "Джин Finsbury Wild Strawberry (0,7л)", qty: 384, status: "ok" },
  "65531": { cell: "65531", sku: "783176", name: "Лосось Riga Extra атлантич в масле с лимоном club (120г)", qty: 2662, status: "ok" },
  "65541": { cell: "65541", sku: "879219", name: "Масло Vera кокосовое рафинированное (500мл)", qty: 948, status: "ok" },
  "65551": { cell: "65551", sku: "374278", name: "Лікер Jagermeister 0,7 л (0,7л)", qty: 12, status: "ok" },
  "65561": { cell: "65561", sku: "997694", name: "Гірчиця Favore Французька в зернах (190г)", qty: 580, status: "ok" },
  "65571": { cell: "65571", sku: "1014627", name: "Сардини Banga в томатному соусі (240г)", qty: 1608, status: "ok" },
  "65581": { cell: "65581", sku: "914220", name: "Сік томатний Dawtona гострий с/б (0,3л)", qty: 684, status: "ok" },
  "65591": { cell: "65591", sku: "950441", name: "Тунець Favore шматочки в розсолі (185г)", qty: 2640, status: "ok" },
  "65601": { cell: "65601", sku: "879652", name: "Пиво Golden Castle Export светлое ж/б (0,5л)", qty: 240, status: "ok" },
  "65621": { cell: "65621", sku: "1005119", name: "Салат Favore Каліфорнія з тунцем та овочами (160г)", qty: 1920, status: "ok" },
  "65631": { cell: "65631", sku: "1003451", name: "Пиво Classe Royale Premium Lager світле з/б (440мл)", qty: 1776, status: "ok" },
  "65641": { cell: "65641", sku: "945365", name: "Квасоля Зірковий вибір консерв в ніжному соусі з/б (400г)", qty: 744, status: "ok" },
  "65671": { cell: "65671", sku: "929318", name: "Вино Montequinto Verdejo біле сухе (0,75л)", qty: 6, status: "ok" },
  "65681": { cell: "65681", sku: "921563", name: "Пиво Львівське 1715 светлое ж/б (0,48л)", qty: 960, status: "ok" },
  "65691": { cell: "65691", sku: "975417", name: "Вино Castillo Lagomar Rose (0,75л)", qty: 540, status: "ok" },
  "65701": { cell: "65701", sku: "969831", name: "Вино ігристе Salute біле напівсолодке (750мл)", qty: 384, status: "ok" },
  "65711": { cell: "65711", sku: "975417", name: "Вино Castillo Lagomar Rose (0,75л)", qty: 36, status: "ok" },
  "65721": { cell: "65721", sku: "949426", name: "Вино Rudolf Muller Riesling Kabinett біл н/солодке (0,75л)", qty: 180, status: "ok" },
  "65731": { cell: "65731", sku: "989862", name: "Вино ігр Klipfel Cremant D'Alsace Blanc Brut біле (0,75л)", qty: 168, status: "ok" },
  "65741": { cell: "65741", sku: "971054", name: "Напій винний Fratelli Fragolino Bianco н/солод газ (0,75л)", qty: 384, status: "ok" },
  "65751": { cell: "65751", sku: "727555", name: "Водка Хлібний Дар Классическая (0,18л)", qty: 360, status: "ok" },
  "65761": { cell: "65761", sku: "530", name: "Напиток слабоалкогольный Оболонь Ром-кола (0,33л)", qty: 36, status: "ok" },
  "65771": { cell: "65771", sku: "33390", name: "Вино игристое АЗШВ Артемовское белое полусладкое (0,75л)", qty: 138, status: "ok" },
  "65781": { cell: "65781", sku: "953742", name: "Напій енергетичний Best Shot б/алк з/б (500мл)", qty: 480, status: "ok" },
  "65791": { cell: "65791", sku: "1016060", name: "Бренді Koblevo VS 3 зірки (0,25л)", qty: 540, status: "ok" },
  "65801": { cell: "65801", sku: "1000030", name: "Джин Kensington London Dry (0,7л)", qty: 228, status: "ok" },
  "65811": { cell: "65811", sku: "59800", name: "Водка Хлібний Дар Классическая (0,5л)", qty: 60, status: "ok" },
  "65821": { cell: "65821", sku: "957509", name: "Пиво Закарпатське №0 світле безалкогольне з/б (0,5л)", qty: 1008, status: "ok" },
  "65831": { cell: "65831", sku: "478563", name: "Пиво Hoegaarden White ж/б (0,5л)", qty: 1512, status: "ok" },
  "65841": { cell: "65841", sku: "1014629", name: "Кілька Banga у томатному соусі (240г)", qty: 888, status: "ok" },
  "65851": { cell: "65851", sku: "930468", name: "Вино Castillo Infante Blanco біле напівсолодке (0,75л)", qty: 144, status: "ok" },
  "65861": { cell: "65861", sku: "744358", name: "Пиво Kronenbourg Бланк ж/б (0,33л)", qty: 504, status: "ok" },
  "65871": { cell: "65871", sku: "1025567", name: "Напій винний Bolgrad Шато де Він білий н/солодкий (0,75л)", qty: 276, status: "ok" },
  "65881": { cell: "65881", sku: "977747", name: "Напій слабоалког Punch Club Mango Passionfruit газ (250мл)", qty: 804, status: "ok" },
  "65891": { cell: "65891", sku: "891698", name: "Лікер Jack Daniel's Tennessee Apple (0,7л)", qty: 252, status: "ok" },
  "65901": { cell: "65901", sku: "1019002", name: "Пиво Grimbergen Double Ambree спеціальне темне з/б (0,5л)", qty: 552, status: "ok" },
  "65911": { cell: "65911", sku: "940938", name: "Оливки Helcom з пастою з паприки (195г)", qty: 2020, status: "ok" },
  "65921": { cell: "65921", sku: "445401", name: "Водка Nemiroff Delikat мягкая (1л)", qty: 228, status: "ok" },
  "65931": { cell: "65931", sku: "990109", name: "Свинина Зірковий вибір Українська в желе (500г)", qty: 468, status: "ok" },
  "65941": { cell: "65941", sku: "777154", name: "Водка Гетьман (0,5л)", qty: 24, status: "ok" },
  "65951": { cell: "65951", sku: "985093", name: "Пиво Seth&Riley's Garage Pineberry mint (440мл)", qty: 180, status: "ok" },
  "65961": { cell: "65961", sku: "253629", name: "Водка Medoff Классик New (0,5л)", qty: 360, status: "ok" },
  "DEMO-001": { cell: "DEMO-001", sku: "0", name: "Тестовая позиция №1 (демо)", qty: 57, status: "ok" },
  "DEMO-002": { cell: "DEMO-002", sku: "0", name: "Тестовая позиция №2 (демо)", qty: 2, status: "reserved" },
  "DEMO-003": { cell: "DEMO-003", sku: "0", name: "Тестовая позиция №3 (демо)", qty: 0, status: "blocked" },
};

/**
 * Имитирует сетевой запрос: случайная задержка 250–900мс,
 * ~5% шанс сетевой ошибки — чтобы UI кэширования/offline-состояния
 * можно было проверить ещё на PoC.
 */
function mockFetchCell(markerId) {
  return new Promise((resolve, reject) => {
    const delay = 250 + Math.random() * 650;
    setTimeout(() => {
      if (Math.random() < 0.05) {
        reject(new Error("network"));
        return;
      }
      const record = MOCK_DB[markerId];
      if (!record) {
        reject(new Error("not_found"));
        return;
      }
      resolve({ ...record, updatedAt: new Date().toISOString() });
    }, delay);
  });
}

window.MOCK_DB = MOCK_DB;
window.mockFetchCell = mockFetchCell;
