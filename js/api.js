/**
 * API-клиент к middleware поверх WMS/1С.
 *
 * Требования из ТЗ:
 *  - п.3.3: кэширование последних данных, пометка "неактуально с HH:MM"
 *           при потере сети, а не пустой экран.
 *  - п.6:   доступ по Bearer-токену, ограниченный срок жизни токена.
 *
 * ВАЖНО: реальный вызов сети сейчас подменён на mockFetchCell()
 * (см. mock-api.js), т.к. на момент разработки PoC middleware ещё не
 * готов. Единственное, что нужно поменять при появлении реального API —
 * тело fetchCellFromNetwork().
 */

const Api = (() => {
  const ENDPOINT_BASE = "https://wms-middleware.company.local/api/v1/cell";
  const CACHE_KEY_PREFIX = "webar_cell_cache_";
  const TOKEN_KEY = "webar_auth_token";

  // На PoC токен можно захардкодить/получать через простую форму логина;
  // в реальном middleware — короткоживущий Bearer-токен на смену.
  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || "poc-demo-token";
  }

  function cacheKey(markerId) {
    return CACHE_KEY_PREFIX + markerId;
  }

  function readCache(markerId) {
    try {
      const raw = localStorage.getItem(cacheKey(markerId));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function writeCache(markerId, data) {
    try {
      localStorage.setItem(cacheKey(markerId), JSON.stringify(data));
    } catch {
      /* хранилище недоступно (приватный режим и т.п.) — не критично для PoC */
    }
  }

  /**
   * Реальный вызов сети. Сейчас — заглушка через mockFetchCell.
   * Продакшн-версия:
   *
   *   const res = await fetch(`${ENDPOINT_BASE}/${encodeURIComponent(markerId)}`, {
   *     headers: { Authorization: `Bearer ${getToken()}` }
   *   });
   *   if (!res.ok) throw new Error(res.status === 404 ? "not_found" : "network");
   *   return res.json();
   */
  /**
   * Симулирует сетевой запрос к ОДНОЙ конкретной mock-базе: задержка
   * 250–900мс + ~5% шанс сетевой ошибки. Логика та же, что в
   * mock-api.js:mockFetchCell, но параметризована базой — нужно, чтобы
   * можно было последовательно перебрать несколько баз (см. lookupCell).
   * mock-api.js не трогаем: он помечен как автогенерируемый.
   */
  function simulateFetch(db, markerId) {
    return new Promise((resolve, reject) => {
      const delay = 250 + Math.random() * 650;
      setTimeout(() => {
        if (Math.random() < 0.05) {
          reject(new Error("network"));
          return;
        }
        const record = db[markerId];
        if (!record) {
          reject(new Error("not_found"));
          return;
        }
        resolve({ ...record, updatedAt: new Date().toISOString() });
      }, delay);
    });
  }

  /**
   * Ищет ячейку по очереди во всех подключённых mock-базах: сначала
   * MOCK_DB (основной ряд, mock-api.js), затем MOCK_DB_01 (ряд 01,
   * mock-db-01.js — подключается отдельным <script> в index.html).
   * Добавите ещё один ряд — допишите его сюда же в массив databases.
   *
   * Если метка не найдена ни в одной базе — итоговая ошибка "not_found".
   * Если словили симулированную сетевую ошибку — не перебираем базы
   * дальше, сразу поднимаем её наверх (иначе одна и та же метка могла бы
   * "рандомно" отвечать то ошибкой, то данными в зависимости от того,
   * в какой по счёту базе она лежит).
   */
  async function lookupCell(markerId) {
    const databases = [window.MOCK_DB, window.MOCK_DB_01].filter(Boolean);
    for (const db of databases) {
      try {
        return await simulateFetch(db, markerId);
      } catch (err) {
        if (err.message !== "not_found") throw err;
        // не найдено в этой базе — пробуем следующую
      }
    }
    throw new Error("not_found");
  }

  async function fetchCellFromNetwork(markerId) {
    void ENDPOINT_BASE; void getToken; // используются в реальной реализации выше
    return lookupCell(markerId);
  }

  /**
   * Публичный метод. Возвращает:
   *   { ok: true,  data, stale: false }               — свежие данные
   *   { ok: true,  data, stale: true, staleSince }     — данные из кэша (сеть недоступна)
   *   { ok: false, reason: "not_found" | "network" }   — данных нет вообще (ни сети, ни кэша)
   */
  async function getCell(markerId) {
    try {
      const data = await fetchCellFromNetwork(markerId);
      writeCache(markerId, { data, fetchedAt: Date.now() });
      return { ok: true, data, stale: false };
    } catch (err) {
      if (err.message === "not_found") {
        return { ok: false, reason: "not_found" };
      }
      const cached = readCache(markerId);
      if (cached) {
        return { ok: true, data: cached.data, stale: true, staleSince: cached.fetchedAt };
      }
      return { ok: false, reason: "network" };
    }
  }

  return { getCell };
})();

window.Api = Api;