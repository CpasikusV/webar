/**
 * App — состояние экрана.
 * Поддерживает одновременное отображение нескольких AR-табло (по одной
 * метке на ячейку), плюс fallback на ручной ввод, если в кадре вообще
 * ничего не распознаётся.
 */
(() => {
  const gate = document.getElementById("gate");
  const startBtn = document.getElementById("startBtn");
  const gateError = document.getElementById("gateError");
  const stage = document.getElementById("stage");
  const video = document.getElementById("video");
  const scanHint = document.getElementById("scanHint");
  const connStatus = document.getElementById("connStatus");
  const connStatusText = connStatus.querySelector(".topbar__statusText");
  const loadingChip = document.getElementById("loadingChip");
  const fallbackChip = document.getElementById("fallbackChip");
  const singleModeNotice = document.getElementById("singleModeNotice");
  const manualBtn = document.getElementById("manualBtn");
  const manualBtnBottom = document.getElementById("manualBtnBottom");
  const manualModal = document.getElementById("manualModal");
  const manualInput = document.getElementById("manualInput");
  const manualCancel = document.getElementById("manualCancel");
  const manualSubmit = document.getElementById("manualSubmit");

  const NO_DETECTION_TIMEOUT_MS = 3000;
  const RESCAN_COOLDOWN_MS = 1500;   // не дёргаем API повторно по той же метке слишком часто
  const PANEL_MAX_AGE_MS = 2500;     // через сколько убрать панель, если метка пропала из кадра
  const PRUNE_INTERVAL_MS = 400;

  // markerId -> timestamp последнего запроса к API
  const lastRequestAt = new Map();
  // markerId -> requestToken, чтобы игнорировать устаревшие ответы API
  const requestTokens = new Map();

  let fallbackTimer = null;
  let pruneInterval = null;

  function setHint(text) {
    scanHint.textContent = text;
  }

  function updateConnIndicator() {
    const online = navigator.onLine;
    connStatus.dataset.state = online ? "online" : "offline";
    connStatusText.textContent = online ? "Онлайн" : "Нет сети";
  }
  window.addEventListener("online", updateConnIndicator);
  window.addEventListener("offline", updateConnIndicator);
  updateConnIndicator();

  function armFallbackTimer() {
    clearTimeout(fallbackTimer);
    fallbackChip.hidden = true;
    fallbackTimer = setTimeout(() => {
      if (Panel.activeCount() === 0) {
        fallbackChip.hidden = false;
        setHint("Метки не найдены в кадре");
      }
    }, NO_DETECTION_TIMEOUT_MS);
  }

  async function fetchAndShow(markerId) {
    const myToken = (requestTokens.get(markerId) || 0) + 1;
    requestTokens.set(markerId, myToken);

    Panel.setLoading(markerId);
    const result = await Api.getCell(markerId);
    if (requestTokens.get(markerId) !== myToken) return; // пришёл ответ на устаревший запрос
    if (!Panel.activeCount()) return; // экран уже закрыт/сброшен

    if (!result.ok) {
      Panel.showError(
        markerId,
        result.reason === "not_found" ? "Ячейка не найдена в системе" : "Нет данных: сеть недоступна"
      );
      return;
    }
    Panel.show(markerId, result.data, { stale: result.stale, staleSince: result.staleSince });

    // Картинку подгружаем отдельно и не блокируем ею основные данные —
    // на PoC это внешний каталожный API, задержка которого не должна
    // тормозить показ остатка/статуса (см. ImageApi / worker/image-proxy.js).
    if (result.data.sku) {
      ImageApi.getImageUrl(result.data.sku).then((imgUrl) => {
        if (requestTokens.get(markerId) !== myToken) return; // метку уже пересканировали/убрали
        if (imgUrl) Panel.setImage(markerId, imgUrl);
      });
    }
  }

  /** @param {Array<{markerId:string, format:string, screenPoint:{x,y}}>} detections */
  function handleDetections(detections) {
    if (!detections.length) return;

    clearTimeout(fallbackTimer);
    fallbackChip.hidden = true;

    const ids = detections.map((d) => d.markerId);
    setHint(
      ids.length === 1 ? `Считано: ${ids[0]}` : `Считано меток: ${ids.length} (${ids.join(", ")})`
    );

    const now = Date.now();
    for (const d of detections) {
      Panel.place(d.markerId, d.screenPoint);

      const last = lastRequestAt.get(d.markerId) || 0;
      if (now - last < RESCAN_COOLDOWN_MS) continue; // уже недавно запрашивали — не дублируем
      lastRequestAt.set(d.markerId, now);
      fetchAndShow(d.markerId);
    }

    armFallbackTimer();
  }

  function openManualModal() {
    manualModal.hidden = false;
    manualInput.value = "";
    setTimeout(() => manualInput.focus(), 50);
  }
  function closeManualModal() {
    manualModal.hidden = true;
  }
  manualBtn.addEventListener("click", openManualModal);
  manualBtnBottom.addEventListener("click", openManualModal);
  manualCancel.addEventListener("click", closeManualModal);
  manualModal.addEventListener("click", (e) => {
    if (e.target === manualModal) closeManualModal();
  });
  manualSubmit.addEventListener("click", () => {
    const id = manualInput.value.trim();
    if (!id) return;
    closeManualModal();
    handleDetections([
      { markerId: id, format: "MANUAL", screenPoint: { x: video.clientWidth / 2, y: video.clientHeight / 2 } },
    ]);
  });
  manualInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") manualSubmit.click();
  });

  document.addEventListener("visibilitychange", () => {
    Scanner.setPaused(document.hidden);
  });

  async function startCamera() {
    startBtn.disabled = true;
    gateError.hidden = true;
    try {
      const { mode } = await Scanner.start(video, handleDetections);
      gate.hidden = true;
      stage.hidden = false;
      singleModeNotice.hidden = mode !== "zxing";
      armFallbackTimer();
      pruneInterval = setInterval(() => Panel.pruneStale(PANEL_MAX_AGE_MS), PRUNE_INTERVAL_MS);
    } catch (err) {
      startBtn.disabled = false;
      gateError.hidden = false;
      gateError.textContent =
        err?.name === "NotAllowedError"
          ? "Доступ к камере запрещён. Разрешите доступ в настройках браузера и обновите страницу."
          : "Не удалось запустить камеру: " + (err?.message || err);
    }
  }

  startBtn.addEventListener("click", startCamera);
})();
