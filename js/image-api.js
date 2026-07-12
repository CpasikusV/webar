/**
 * ImageApi
 * -----------------------------------------------------------------------
 * Картинки товаров лежат ЛОКАЛЬНО в проекте (assets/photos/), а не
 * тянутся через внешний API — так проще и надёжнее для PoC: не нужен
 * прокси-воркер, не зависим от доступности fora.ua и её CORS-политики,
 * картинка появляется мгновенно (обычный статический файл).
 *
 * ИМЕНОВАНИЕ ФАЙЛОВ: <SKU>.<расширение>, например assets/photos/995417.jpg
 * — это ровно то, что кладёт fora_parser.py в свою папку photos/ (там
 * файлы называются по артикулу). Проще всего — скопировать содержимое
 * photos/ из парсера прямо в assets/photos/ этого проекта, ничего не
 * переименовывая.
 *
 * Поддерживаемые расширения перебираются по порядку через HEAD-запрос
 * (тот же origin — GitHub Pages, поэтому проблем с CORS нет, в отличие
 * от прямого обращения к api.catalog.ecom.fora.ua).
 * -----------------------------------------------------------------------
 */

const ImageApi = (() => {
  const BASE_PATH = "assets/photos/";
  const CANDIDATE_EXT = ["jpg", "jpeg", "png", "webp"];

  const cache = new Map(); // sku -> path | null

  async function getImageUrl(sku) {
    if (!sku) return null;
    if (cache.has(sku)) return cache.get(sku);

    for (const ext of CANDIDATE_EXT) {
      const path = `${BASE_PATH}${sku}.${ext}`;
      try {
        const res = await fetch(path, { method: "HEAD" });
        if (res.ok) {
          cache.set(sku, path);
          return path;
        }
      } catch {
        // сеть/сервер недоступны — пробуем следующее расширение
      }
    }

    cache.set(sku, null); // фото для этого SKU не найдено ни с одним расширением
    return null;
  }

  return { getImageUrl };
})();

window.ImageApi = ImageApi;
