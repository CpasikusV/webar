/**
 * image-proxy — Cloudflare Worker
 * -----------------------------------------------------------------------
 * Прокси к каталожному API fora.ua (тот же метод, что использует
 * fora_parser.py: GetSimpleCatalogItems по артикулу).
 *
 * ЗАЧЕМ ОН НУЖЕН: api.catalog.ecom.fora.ua не отдаёт CORS-заголовки для
 * сторонних доменов — прямой fetch() из браузера с GitHub Pages будет
 * заблокирован браузером. Воркер делает запрос со своей стороны (сервер
 * → сервер, CORS не применяется) и возвращает клиенту уже готовый JSON.
 *
 * ДЕПЛОЙ (бесплатно, без карты, 5 минут):
 *   1. Зарегистрируйтесь на https://dash.cloudflare.com (бесплатный tier)
 *   2. Workers & Pages → Create → Create Worker
 *   3. Вставьте содержимое этого файла в редактор, Deploy
 *   4. Скопируйте URL вида https://image-proxy.<ваш-логин>.workers.dev
 *   5. Вставьте этот URL в js/image-api.js → PROXY_BASE
 *
 * Использование клиентом:
 *   GET https://image-proxy.xxx.workers.dev/?sku=995417
 *   -> { "sku": "995417", "name": "...", "imageUrl": "https://...", "price": 123 }
 * -----------------------------------------------------------------------
 */

const FORA_API = "https://api.catalog.ecom.fora.ua/api/2.0/exec/EcomCatalogGlobal";

// Значения из fora_parser.py — при необходимости замените на свои
// (например, если товары числятся в другом филиале сети).
const MERCHANT_ID = 2;
const FILIAL_ID = 310;
const DELIVERY_TYPE = 2;

// Кэшируем ответы на стороне воркера на 12 часов — картинки/цены товара
// не меняются каждую минуту, а нагрузку на upstream API это снижает
// на порядок при повторном сканировании одних и тех же ячеек.
const CACHE_TTL_SECONDS = 60 * 60 * 12;

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }

    const url = new URL(request.url);
    const sku = (url.searchParams.get("sku") || "").trim();
    if (!sku) {
      return withCors(json({ error: "sku_required" }, 400));
    }

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);
    const cached = await cache.match(cacheKey);
    if (cached) return withCors(cached.clone());

    try {
      const upstream = await fetch(FORA_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
          Origin: "https://fora.ua",
          Referer: "https://fora.ua/",
        },
        body: JSON.stringify({
          method: "GetSimpleCatalogItems",
          data: {
            merchantId: MERCHANT_ID,
            customFilter: sku,
            deliveryType: DELIVERY_TYPE,
            filialId: FILIAL_ID,
            From: 1,
            To: 5,
          },
        }),
      });

      if (!upstream.ok) {
        return withCors(json({ error: "upstream_error", status: upstream.status }, 502));
      }

      const data = await upstream.json();
      const item = (data.items || [])[0];

      if (!item) {
        return withCors(json({ error: "not_found", sku }, 404));
      }

      const result = json({
        sku,
        name: item.name || "",
        imageUrl: item.mainImage || "",
        price: item.price ?? null,
      });
      result.headers.set("Cache-Control", `public, max-age=${CACHE_TTL_SECONDS}`);
      ctx.waitUntil(cache.put(cacheKey, result.clone()));

      return withCors(result);
    } catch (e) {
      return withCors(json({ error: "proxy_exception", message: String(e) }, 500));
    }
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function withCors(res) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}
