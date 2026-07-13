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
  async function fetchCellFromNetwork(markerId) {
    void ENDPOINT_BASE; void getToken; // используются в реальной реализации выше
    return window.mockFetchCell(markerId);
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