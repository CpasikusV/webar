/**
 * Panel
 * -----------------------------------------------------------------------
 * Управляет НЕСКОЛЬКИМИ одновременно видимыми AR-табло — по одной на
 * каждую метку, распознанную в текущем кадре. Каждая панель — клон
 * <template id="cellPanelTemplate">, привязанный к markerId.
 *
 * Один штрихкод может соответствовать НЕСКОЛЬКИМ товарам одновременно
 * (см. data/generate-mock-db.py) — поэтому панель рендерит список
 * товаров (data.items), а не одно название/остаток.
 * -----------------------------------------------------------------------
 */

const Panel = (() => {
  const layer = document.getElementById("panelLayer");
  const panelTemplate = document.getElementById("cellPanelTemplate");
  const itemTemplate = document.getElementById("cellItemTemplate");

  const STATUS_LABEL = { ok: "Свободна", blocked: "Заблокирована", reserved: "В резерве" };

  // markerId -> { el, lastSeenAt }
  const active = new Map();

  function createPanel(markerId) {
    const node = panelTemplate.content.firstElementChild.cloneNode(true);
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

  function renderItems(container, items) {
    container.innerHTML = "";
    for (const item of items) {
      const node = itemTemplate.content.firstElementChild.cloneNode(true);
      node.querySelector('[data-field="itemName"]').textContent = item.name;
      node.querySelector('[data-field="itemQty"]').textContent = item.qty;
      container.appendChild(node);
    }
  }

  /** @param {{cell:string, status:string, items:Array<{sku,name,qty}>}} data */
  function show(markerId, data, { stale = false, staleSince = null } = {}) {
    const entry = active.get(markerId);
    if (!entry) return;
    const el = entry.el;
    el.dataset.loading = "false";
    el.dataset.status = data.status;
    el.dataset.multi = data.items.length > 1 ? "true" : "false";

    el.querySelector('[data-field="cell"]').textContent = data.cell;
    el.querySelector('[data-field="badge"]').textContent =
      data.items.length > 1
        ? `${STATUS_LABEL[data.status] || data.status} · ${data.items.length} тов.`
        : STATUS_LABEL[data.status] || data.status;

    renderItems(el.querySelector('[data-field="items"]'), data.items);

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

  /** Устанавливает/обновляет картинку товара (только для ячеек с одним
   *  товаром — для нескольких сразу непонятно, чью фотографию показывать,
   *  поэтому превью для них не запрашивается, см. app.js). */
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
    el.dataset.multi = "false";
    el.querySelector('[data-field="cell"]').textContent = markerId;
    el.querySelector('[data-field="badge"]').textContent = "Ошибка";
    renderItems(el.querySelector('[data-field="items"]'), [{ name: message, qty: "—" }]);
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
