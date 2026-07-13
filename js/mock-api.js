/**
 * MOCK-API — сгенерировано автоматически скриптом data/generate-mock-db.py
 * из выгрузки склада. НЕ редактируйте вручную — при следующем обновлении
 * данных файл будет перезаписан. Правки вносите в исходный Excel или
 * в STATUS_MAP / DEMO_RECORDS внутри generate-mock-db.py.
 *
 * Формат записи: { cell, status, items: [{sku, name, qty}, ...] }.
 * items — МАССИВ, потому что под одним физическим штрихкодом на складе
 * может стоять несколько разных товаров одновременно (не партии одного
 * товара, а разные позиции — подтверждено на реальных ячейках 65-01,
 * 65-02, 65-04..65-06 из выгрузки). Ключ записи ("65021" и т.п.) — это
 * то, что реально закодировано в физическом штрихкоде: дефисы убраны,
 * суффикс партии ("/1", "/2" из WMS-выгрузки) отброшен.
 *
 * Готового API-слоя над WMS/1С ещё нет (Этап 0 из ТЗ), поэтому этот файл
 * по-прежнему имитирует будущий middleware-эндпоинт:
 *
 *   GET https://wms-middleware.company.local/api/v1/cell/{marker_id}
 *
 * Когда появится реальный API — замените fetchCellFromNetwork() в api.js,
 * форма ответа (cell/status/items[]) сохраняется без изменений.
 * -----------------------------------------------------------------------
 */

const MOCK_DB = {
  "65011": { cell: "65011", status: "ok", items: [{ sku: "995417", name: "Корм для котів Favore з м'ясом тунця та лосося (80г)", qty: 624 }, { sku: "5573", name: "Горчица ВХС Винницкая (125г)", qty: 720 }] },
  "65021": { cell: "65021", status: "ok", items: [{ sku: "868755", name: "Вермут Salute Bianco белый десертный (1л)", qty: 12 }, { sku: "703869", name: "Вермут Fratelli МохитоБел (1л)", qty: 12 }] },
  "65031": { cell: "65031", status: "ok", items: [{ sku: "887817", name: "Настойка Nemiroff De Luxe Пекучая груша (0,1л)", qty: 60 }] },
  "65041": { cell: "65041", status: "ok", items: [{ sku: "990219", name: "Настоянка Hetman Citrus (500мл)", qty: 12 }, { sku: "991323", name: "Нaпій Живчик з соком яблук та екстракт лаванди з/б (0,33л)", qty: 144 }] },
  "65051": { cell: "65051", status: "ok", items: [{ sku: "932033", name: "Вино Les Sonnailles Rouge червоне сухе (0,75л)", qty: 6 }, { sku: "1002544", name: "Помідори Favore цілі очищені в томатному соку (400г)", qty: 24 }] },
  "65061": { cell: "65061", status: "ok", items: [{ sku: "932041", name: "Вино ігристе J.Kieffer Demi-Sec Rose рож н/солодке (0,75л)", qty: 96 }, { sku: "1025243", name: "Напій винний Bolgrad Алазанська долина черв н/сол (0,75л)", qty: 24 }] },
  "65071": { cell: "65071", status: "ok", items: [{ sku: "1014628", name: "Паштет Banga з ікри та печінки тріски (100г)", qty: 3780 }] },
  "65081": { cell: "65081", status: "ok", items: [{ sku: "924575", name: "Пиво Lowenbrau Original світле (0,5л)", qty: 620 }] },
  "65091": { cell: "65091", status: "ok", items: [{ sku: "977746", name: "Напій слабоалког Punch Club Grapefruit Collins газ (250мл)", qty: 1212 }] },
  "65101": { cell: "65101", status: "ok", items: [{ sku: "1011531", name: "Вино ігристе Paul Bernard Semi sweet біле (0,75л)", qty: 12 }] },
  "65111": { cell: "65111", status: "ok", items: [{ sku: "1001565", name: "Напій слабоалкогол Tairovo Джин смак грейпфрут з/б (0,5л)", qty: 516 }] },
  "65121": { cell: "65121", status: "ok", items: [{ sku: "907570", name: "Напиток соковый Shake SparklingStrawber сил/г жб (330мл)", qty: 768 }] },
  "65131": { cell: "65131", status: "ok", items: [{ sku: "966763", name: "Джем Migros полуничний (380г)", qty: 1452 }] },
  "65161": { cell: "65161", status: "ok", items: [{ sku: "995038", name: "Вино Aetos Carmenere Reserva червоне сухе (0,75л)", qty: 168 }] },
  "65171": { cell: "65171", status: "ok", items: [{ sku: "1023314", name: "Вино ігристе Conde de Caralt Cava Semi seco біле (0,75л)", qty: 294 }] },
  "65181": { cell: "65181", status: "ok", items: [{ sku: "965987", name: "Оливки La Explanada фаршировані блакитним сиром (350г)", qty: 1080 }] },
  "65191": { cell: "65191", status: "ok", items: [{ sku: "985625", name: "Вино La Croix Carillan CoteauxBourguig AOC чер сух (0,75л)", qty: 168 }] },
  "65201": { cell: "65201", status: "ok", items: [{ sku: "993922", name: "Напій винний Таїрово Fragolino білий н/солод газ (1,5л)", qty: 144 }] },
  "65211": { cell: "65211", status: "ok", items: [{ sku: "950440", name: "Тунець Favore шматочки в олії (185г)", qty: 720 }] },
  "65221": { cell: "65221", status: "ok", items: [{ sku: "1000036", name: "Віскі Horse Rider Бурбон (0,7л)", qty: 426 }] },
  "65231": { cell: "65231", status: "ok", items: [{ sku: "982959", name: "Вино Asymmetric Marlborough SauvignonBlanc біл сух (0,75л)", qty: 312 }] },
  "65241": { cell: "65241", status: "ok", items: [{ sku: "952773", name: "Горілка Миронівська Пшенична нива (0,1л)", qty: 468 }] },
  "65251": { cell: "65251", status: "ok", items: [{ sku: "982824", name: "Вино Tomai Embraced by Time Isabella червоне н/сол (1л)", qty: 246 }] },
  "65261": { cell: "65261", status: "ok", items: [{ sku: "975415", name: "Вино Castillo Lagomar red (0,75л)", qty: 528 }] },
  "65271": { cell: "65271", status: "ok", items: [{ sku: "947908", name: "Напій слабоалкогол King's Bridge Gin&Berry 7% з/б (500мл)", qty: 1512 }] },
  "65281": { cell: "65281", status: "ok", items: [{ sku: "993947", name: "Напій алкогольний Fort of Georgia оригінальний 3* (0,5л)", qty: 300 }] },
  "65291": { cell: "65291", status: "ok", items: [{ sku: "1009916", name: "Пиво Maradona Lager світле з/б (330мл)", qty: 528 }] },
  "65301": { cell: "65301", status: "ok", items: [{ sku: "994708", name: "Напій енергетичний Best Shot Zero Sugar б/алк з/б (500мл)", qty: 264 }] },
  "65311": { cell: "65311", status: "ok", items: [{ sku: "963631", name: "Напій соковий Camlica Лимон газований с/б (200мл)", qty: 648 }] },
  "65321": { cell: "65321", status: "ok", items: [{ sku: "1015174", name: "Бренді Shabo V.S.O.P 5 зірок (0,5л)", qty: 180 }] },
  "65331": { cell: "65331", status: "ok", items: [{ sku: "853424", name: "Вино ігристе Light House безалкогольне (0,75л)", qty: 6 }] },
  "65341": { cell: "65341", status: "ok", items: [{ sku: "929318", name: "Вино Montequinto Verdejo біле сухе (0,75л)", qty: 570 }] },
  "65361": { cell: "65361", status: "ok", items: [{ sku: "1016064", name: "Бренді Georgian Legend 3 зірки (0,7л)", qty: 252 }] },
  "65371": { cell: "65371", status: "ok", items: [{ sku: "929317", name: "Вино Montequinto Bobal рожеве сухе (0,75л)", qty: 126 }] },
  "65381": { cell: "65381", status: "ok", items: [{ sku: "1010583", name: "Маслини Oscar без кісточки з/б (200г)", qty: 1440 }] },
  "65391": { cell: "65391", status: "ok", items: [{ sku: "998247", name: "Коктейль Bevello Bellini Strawbery н/солодкий (0,75л)", qty: 414 }] },
  "65401": { cell: "65401", status: "ok", items: [{ sku: "878772", name: "Джин Finsbury Wild Strawberry (0,7л)", qty: 12 }] },
  "65411": { cell: "65411", status: "ok", items: [{ sku: "942604", name: "Джин Stamford London Dry (0,7л)", qty: 360 }] },
  "65421": { cell: "65421", status: "ok", items: [{ sku: "739667", name: "Вода минеральная Набеглави газированная ж/б (0,33л)", qty: 1656 }] },
  "65431": { cell: "65431", status: "ok", items: [{ sku: "982827", name: "Вино Costa Alicante червоне сухе (0,75л)", qty: 180 }] },
  "65441": { cell: "65441", status: "ok", items: [{ sku: "969290", name: "Гриби Favore печериці мариновані пастеризовані (280г)", qty: 1428 }] },
  "65461": { cell: "65461", status: "ok", items: [{ sku: "946606", name: "Оливки La Explanada зелені без кісточки з/б (300мл)", qty: 444 }] },
  "65471": { cell: "65471", status: "ok", items: [{ sku: "931859", name: "Вино Cadao Douro Vinho Tinto червоне сухе (0,75л)", qty: 42 }] },
  "65481": { cell: "65481", status: "ok", items: [{ sku: "932037", name: "Вино La Francette Merlot червоне сухе (0,75л)", qty: 384 }] },
  "65521": { cell: "65521", status: "ok", items: [{ sku: "878772", name: "Джин Finsbury Wild Strawberry (0,7л)", qty: 384 }] },
  "65531": { cell: "65531", status: "ok", items: [{ sku: "783176", name: "Лосось Riga Extra атлантич в масле с лимоном club (120г)", qty: 2662 }] },
  "65541": { cell: "65541", status: "ok", items: [{ sku: "879219", name: "Масло Vera кокосовое рафинированное (500мл)", qty: 948 }] },
  "65551": { cell: "65551", status: "ok", items: [{ sku: "374278", name: "Лікер Jagermeister 0,7 л (0,7л)", qty: 12 }] },
  "65561": { cell: "65561", status: "ok", items: [{ sku: "997694", name: "Гірчиця Favore Французька в зернах (190г)", qty: 580 }] },
  "65571": { cell: "65571", status: "ok", items: [{ sku: "1014627", name: "Сардини Banga в томатному соусі (240г)", qty: 1608 }] },
  "65581": { cell: "65581", status: "ok", items: [{ sku: "914220", name: "Сік томатний Dawtona гострий с/б (0,3л)", qty: 684 }] },
  "65591": { cell: "65591", status: "ok", items: [{ sku: "950441", name: "Тунець Favore шматочки в розсолі (185г)", qty: 2640 }] },
  "65601": { cell: "65601", status: "ok", items: [{ sku: "879652", name: "Пиво Golden Castle Export светлое ж/б (0,5л)", qty: 240 }] },
  "65621": { cell: "65621", status: "ok", items: [{ sku: "1005119", name: "Салат Favore Каліфорнія з тунцем та овочами (160г)", qty: 1920 }] },
  "65631": { cell: "65631", status: "ok", items: [{ sku: "1003451", name: "Пиво Classe Royale Premium Lager світле з/б (440мл)", qty: 1776 }] },
  "65641": { cell: "65641", status: "ok", items: [{ sku: "945365", name: "Квасоля Зірковий вибір консерв в ніжному соусі з/б (400г)", qty: 744 }] },
  "65671": { cell: "65671", status: "ok", items: [{ sku: "929318", name: "Вино Montequinto Verdejo біле сухе (0,75л)", qty: 6 }] },
  "65681": { cell: "65681", status: "ok", items: [{ sku: "921563", name: "Пиво Львівське 1715 светлое ж/б (0,48л)", qty: 960 }] },
  "65691": { cell: "65691", status: "ok", items: [{ sku: "975417", name: "Вино Castillo Lagomar Rose (0,75л)", qty: 540 }] },
  "65701": { cell: "65701", status: "ok", items: [{ sku: "969831", name: "Вино ігристе Salute біле напівсолодке (750мл)", qty: 384 }] },
  "65711": { cell: "65711", status: "ok", items: [{ sku: "975417", name: "Вино Castillo Lagomar Rose (0,75л)", qty: 36 }] },
  "65721": { cell: "65721", status: "ok", items: [{ sku: "949426", name: "Вино Rudolf Muller Riesling Kabinett біл н/солодке (0,75л)", qty: 180 }] },
  "65731": { cell: "65731", status: "ok", items: [{ sku: "989862", name: "Вино ігр Klipfel Cremant D'Alsace Blanc Brut біле (0,75л)", qty: 168 }] },
  "65741": { cell: "65741", status: "ok", items: [{ sku: "971054", name: "Напій винний Fratelli Fragolino Bianco н/солод газ (0,75л)", qty: 384 }] },
  "65751": { cell: "65751", status: "ok", items: [{ sku: "727555", name: "Водка Хлібний Дар Классическая (0,18л)", qty: 360 }] },
  "65761": { cell: "65761", status: "ok", items: [{ sku: "530", name: "Напиток слабоалкогольный Оболонь Ром-кола (0,33л)", qty: 36 }] },
  "65771": { cell: "65771", status: "ok", items: [{ sku: "33390", name: "Вино игристое АЗШВ Артемовское белое полусладкое (0,75л)", qty: 138 }] },
  "65781": { cell: "65781", status: "ok", items: [{ sku: "953742", name: "Напій енергетичний Best Shot б/алк з/б (500мл)", qty: 480 }] },
  "65791": { cell: "65791", status: "ok", items: [{ sku: "1016060", name: "Бренді Koblevo VS 3 зірки (0,25л)", qty: 540 }] },
  "65801": { cell: "65801", status: "ok", items: [{ sku: "1000030", name: "Джин Kensington London Dry (0,7л)", qty: 228 }] },
  "65811": { cell: "65811", status: "ok", items: [{ sku: "59800", name: "Водка Хлібний Дар Классическая (0,5л)", qty: 60 }] },
  "65821": { cell: "65821", status: "ok", items: [{ sku: "957509", name: "Пиво Закарпатське №0 світле безалкогольне з/б (0,5л)", qty: 1008 }] },
  "65831": { cell: "65831", status: "ok", items: [{ sku: "478563", name: "Пиво Hoegaarden White ж/б (0,5л)", qty: 1512 }] },
  "65841": { cell: "65841", status: "ok", items: [{ sku: "1014629", name: "Кілька Banga у томатному соусі (240г)", qty: 888 }] },
  "65851": { cell: "65851", status: "ok", items: [{ sku: "930468", name: "Вино Castillo Infante Blanco біле напівсолодке (0,75л)", qty: 144 }] },
  "65861": { cell: "65861", status: "ok", items: [{ sku: "744358", name: "Пиво Kronenbourg Бланк ж/б (0,33л)", qty: 504 }] },
  "65871": { cell: "65871", status: "ok", items: [{ sku: "1025567", name: "Напій винний Bolgrad Шато де Він білий н/солодкий (0,75л)", qty: 276 }] },
  "65881": { cell: "65881", status: "ok", items: [{ sku: "977747", name: "Напій слабоалког Punch Club Mango Passionfruit газ (250мл)", qty: 804 }] },
  "65891": { cell: "65891", status: "ok", items: [{ sku: "891698", name: "Лікер Jack Daniel's Tennessee Apple (0,7л)", qty: 252 }] },
  "65901": { cell: "65901", status: "ok", items: [{ sku: "1019002", name: "Пиво Grimbergen Double Ambree спеціальне темне з/б (0,5л)", qty: 552 }] },
  "65911": { cell: "65911", status: "ok", items: [{ sku: "940938", name: "Оливки Helcom з пастою з паприки (195г)", qty: 2020 }] },
  "65921": { cell: "65921", status: "ok", items: [{ sku: "445401", name: "Водка Nemiroff Delikat мягкая (1л)", qty: 228 }] },
  "65931": { cell: "65931", status: "ok", items: [{ sku: "990109", name: "Свинина Зірковий вибір Українська в желе (500г)", qty: 468 }] },
  "65941": { cell: "65941", status: "ok", items: [{ sku: "777154", name: "Водка Гетьман (0,5л)", qty: 24 }] },
  "65951": { cell: "65951", status: "ok", items: [{ sku: "985093", name: "Пиво Seth&Riley's Garage Pineberry mint (440мл)", qty: 180 }] },
  "65961": { cell: "65961", status: "ok", items: [{ sku: "253629", name: "Водка Medoff Классик New (0,5л)", qty: 360 }] },
  "DEMO-001": { cell: "DEMO-001", status: "ok", items: [{ sku: "0", name: "Тестовая позиция №1 (демо)", qty: 57 }] },
  "DEMO-002": { cell: "DEMO-002", status: "reserved", items: [{ sku: "0", name: "Тестовая позиция №2 (демо)", qty: 2 }] },
  "DEMO-003": { cell: "DEMO-003", status: "blocked", items: [{ sku: "0", name: "Тестовая позиция №3 (демо)", qty: 0 }] },
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
