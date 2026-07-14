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

  // Если несколько меток видно одновременно, тап по карточке выделяет её
  // (поднимает поверх остальных и разворачивает), а остальные гаснут и
  // временно не реагируют на тап, чтобы не мешали читать выбранную.
  // Повторный тап по уже выбранной карточке снимает выделение.
  let selectedMarkerId = null;

  function applySelectionState() {
    const onlyOne = active.size <= 1;
    for (const [markerId, entry] of active) {
      const isSelected = selectedMarkerId === markerId;
      const isDimmed = selectedMarkerId !== null && !isSelected;
      entry.el.dataset.selected = onlyOne ? "false" : String(isSelected);
      entry.el.dataset.dimmed = String(isDimmed && !onlyOne);
    }
  }

  function selectPanel(markerId) {
    selectedMarkerId = selectedMarkerId === markerId ? null : markerId;
    applySelectionState();
  }

  function createPanel(markerId) {
    const node = panelTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.markerId = markerId;
    node.addEventListener("click", (e) => {
      e.stopPropagation();
      selectPanel(markerId);
    });
    layer.appendChild(node);
    const entry = { el: node, lastSeenAt: Date.now(), collisionOffset: 0 };
    active.set(markerId, entry);
    applySelectionState();
    return entry;
  }

  function place(markerId, screenPoint) {
    const entry = active.get(markerId) || createPanel(markerId);
    entry.lastSeenAt = Date.now();
    entry.el.style.left = `${screenPoint.x}px`;
    entry.el.style.top = `${screenPoint.y}px`;
  }

  function rectsOverlap(a, b, pad = 6) {
    return !(
      a.right + pad < b.left ||
      a.left - pad > b.right ||
      a.bottom + pad < b.top ||
      a.top - pad > b.bottom
    );
  }

  const COLLISION_STEP = 14;
  const COLLISION_RESOLVE_INTERVAL_MS = 220; // не пересчитываем чаще, чем успевает доиграть CSS-переход — иначе карточки дёргаются
  let lastCollisionResolveAt = 0;

  /**
   * Если несколько карточек видны одновременно (метки рядом друг с
   * другом на кадре), они по умолчанию рисуются каждая от своей точки
   * независимо и могут наехать друг на друга. Вызывается после того,
   * как place() отработал для ВСЕХ меток текущего кадра (см. app.js:
   * handleDetections) — раздвигает пересекающиеся карточки по вертикали
   * через CSS-переменную --collision-offset (см. style.css), не трогая
   * сам left/top (он всё ещё указывает на реальную метку).
   *
   * Троттлинг + шаг за раз (а не "сброс в 0 и заново подбор" каждый
   * кадр) — чтобы движение было плавным: величина сдвига меняется не
   * больше чем на COLLISION_STEP за один вызов, и вызовы не чаще, чем
   * раз в COLLISION_RESOLVE_INTERVAL_MS. Иначе из-за дрожания координат
   * метки между кадрами карточка каждый раз пересчитывалась с нуля и
   * "скакала" быстрее, чем успевал доиграть transition.
   *
   * Сортировка по X даёт стабильный порядок разрешения — иначе при
   * равном перекрытии карточки могли бы спорить, кто кого сдвигает.
   */
  function resolveCollisions() {
    const now = Date.now();
    if (now - lastCollisionResolveAt < COLLISION_RESOLVE_INTERVAL_MS) return;
    lastCollisionResolveAt = now;

    const entries = [...active.values()]
      .filter((entry) => entry.el.dataset.dimmed !== "true") // погашенные при выборе не мешают — не поднимаем их
      .sort((a, b) => (parseFloat(a.el.style.left) || 0) - (parseFloat(b.el.style.left) || 0));

    const placedRects = [];
    for (const entry of entries) {
      // Пробуем на один шаг ОСЛАБИТЬ сдвиг — если места уже достаточно,
      // карточка постепенно возвращается на своё место (а не прыгает
      // назад мгновенно, когда соседняя метка уходит из кадра).
      if (entry.collisionOffset < 0) {
        const relaxed = entry.collisionOffset + COLLISION_STEP;
        entry.el.style.setProperty("--collision-offset", `${relaxed}px`);
        const relaxedRect = entry.el.getBoundingClientRect();
        if (!placedRects.some((r) => rectsOverlap(relaxedRect, r))) {
          entry.collisionOffset = relaxed;
        } else {
          entry.el.style.setProperty("--collision-offset", `${entry.collisionOffset}px`);
        }
      }

      // Если всё ещё пересекается — добавляем ещё по шагу, пока не разойдётся.
      let rect = entry.el.getBoundingClientRect();
      let guard = 0;
      while (placedRects.some((r) => rectsOverlap(rect, r)) && guard < 20) {
        entry.collisionOffset -= COLLISION_STEP;
        entry.el.style.setProperty("--collision-offset", `${entry.collisionOffset}px`);
        rect = entry.el.getBoundingClientRect();
        guard++;
      }
      placedRects.push(rect);
    }
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
      if (item.sku) node.dataset.sku = item.sku;
      node.querySelector('[data-field="itemName"]').textContent = item.name;
      node.querySelector('[data-field="itemSku"]').textContent = item.sku ? `Арт. ${item.sku}` : "";
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

  /** Устанавливает/обновляет фото КОНКРЕТНОГО товара в списке (по SKU),
   *  а не одно общее фото на всю карточку — под одной меткой может быть
   *  несколько разных товаров, у каждого своя картинка рядом со строкой. */
  function setItemImage(markerId, sku, url) {
    const entry = active.get(markerId);
    if (!entry || !url) return;
    const row = entry.el.querySelector(`.cellpanel__item[data-sku="${CSS.escape(sku)}"]`);
    if (!row) return;
    const thumbWrap = row.querySelector('[data-field="itemThumbWrap"]');
    const thumbImg = row.querySelector('[data-field="itemThumb"]');
    thumbImg.src = url;
    thumbWrap.hidden = false;
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
    if (selectedMarkerId === markerId) selectedMarkerId = null;
    applySelectionState();
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
    selectedMarkerId = null;
    for (const markerId of [...active.keys()]) remove(markerId);
  }

  return { place, setLoading, show, showError, setItemImage, remove, pruneStale, activeCount, clear, resolveCollisions };
})();

window.Panel = Panel;
