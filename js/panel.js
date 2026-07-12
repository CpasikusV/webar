/**
 * Panel
 * -----------------------------------------------------------------------
 * Управляет НЕСКОЛЬКИМИ одновременно видимыми AR-табло — по одной на
 * каждую метку, распознанную в текущем кадре. Каждая панель — клон
 * <template id="cellPanelTemplate">, привязанный к markerId.
 * -----------------------------------------------------------------------
 */

const Panel = (() => {
  const layer = document.getElementById("panelLayer");
  const template = document.getElementById("cellPanelTemplate");

  const STATUS_LABEL = { ok: "Свободна", blocked: "Заблокирована", reserved: "В резерве" };

  // markerId -> { el, lastSeenAt }
  const active = new Map();

  function createPanel(markerId) {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.markerId = markerId;
    layer.appendChild(node);
    const entry = { el: node, lastSeenAt: Date.now() };
    active.set(markerId, entry);
    return entry;
  }

  function place(markerId, screenPoint) {
    const entry = active.get(markerId) || createPanel(markerId);
    entry.lastSeenAt = Date.now();
    entry.el.style.left = `${screenPoint.x}px`;
    entry.el.style.top = `${screenPoint.y}px`;
  }

  function setLoading(markerId) {
    const entry = active.get(markerId);
    if (!entry) return;
    entry.el.dataset.loading = "true";
  }

  function show(markerId, data, { stale = false, staleSince = null } = {}) {
    const entry = active.get(markerId);
    if (!entry) return;
    const el = entry.el;
    el.dataset.loading = "false";
    el.dataset.status = data.status;

    el.querySelector('[data-field="cell"]').textContent = data.cell;
    el.querySelector('[data-field="badge"]').textContent = STATUS_LABEL[data.status] || data.status;
    el.querySelector('[data-field="name"]').textContent = data.name;
    el.querySelector('[data-field="qty"]').textContent = data.qty;

    const metaEl = el.querySelector('[data-field="meta"]');
    if (stale && staleSince) {
      const t = new Date(staleSince);
      const hh = String(t.getHours()).padStart(2, "0");
      const mm = String(t.getMinutes()).padStart(2, "0");
      metaEl.textContent = `⚠ Неактуально с ${hh}:${mm}`;
      metaEl.classList.add("stale");
    } else {
      metaEl.textContent = "";
      metaEl.classList.remove("stale");
    }

    // Картинка подгружается отдельно и асинхронно (см. setImage) — здесь
    // её не трогаем, чтобы повторное сканирование той же метки не гасило
    // уже показанное превью, пока подгружается новое.
  }

  /** Устанавливает/обновляет картинку товара, если она уже загружена
   *  (вызывается отдельно от show(), т.к. приходит с задержкой от ImageApi). */
  function setImage(markerId, url) {
    const entry = active.get(markerId);
    if (!entry) return;
    const thumbWrap = entry.el.querySelector('[data-field="thumbWrap"]');
    const thumbImg = entry.el.querySelector('[data-field="thumb"]');
    if (url) {
      thumbImg.src = url;
      thumbWrap.hidden = false;
    } else {
      thumbWrap.hidden = true;
    }
  }

  function showError(markerId, message) {
    const entry = active.get(markerId);
    if (!entry) return;
    const el = entry.el;
    el.dataset.loading = "false";
    el.dataset.status = "error";
    el.querySelector('[data-field="cell"]').textContent = markerId;
    el.querySelector('[data-field="badge"]').textContent = "Ошибка";
    el.querySelector('[data-field="name"]').textContent = message;
    el.querySelector('[data-field="qty"]').textContent = "—";
    el.querySelector('[data-field="meta"]').textContent = "";
  }

  function remove(markerId) {
    const entry = active.get(markerId);
    if (!entry) return;
    entry.el.remove();
    active.delete(markerId);
  }

  /** Убирает панели меток, которые не попадали в кадр дольше maxAgeMs
   *  (метка "потерялась" — камера отвернулась / метка закрыта).
   *  Панели, для которых ещё идёт запрос к API (loading), не трогаем —
   *  иначе результат может прийти уже после удаления карточки и просто
   *  потеряется, если камера на секунду потеряла метку из кадра. */
  function pruneStale(maxAgeMs = 1200) {
    const now = Date.now();
    for (const [markerId, entry] of active) {
      if (entry.el.dataset.loading === "true") continue;
      if (now - entry.lastSeenAt > maxAgeMs) remove(markerId);
    }
  }

  function activeCount() {
    return active.size;
  }

  function clear() {
    for (const markerId of [...active.keys()]) remove(markerId);
  }

  return { place, setLoading, show, showError, setImage, remove, pruneStale, activeCount, clear };
})();

window.Panel = Panel;
