/**
 * Scanner
 * -----------------------------------------------------------------------
 * Распознаёт ОДНОВРЕМЕННО НЕСКОЛЬКО QR-кодов/штрихкодов в одном кадре
 * (по запросу: "не только один, а сразу несколько").
 *
 * Основной путь: нативный BarcodeDetector (Shape Detection API) —
 * встроен в Chrome/Android, находит все метки в кадре за один вызов,
 * аппаратно ускорен, не требует внешних библиотек.
 *
 * Резервный путь: ZXing — используется в браузерах без BarcodeDetector
 * (в первую очередь Safari/iOS на момент написания). В резервном режиме
 * можно распознать только одну метку за раз — ограничение библиотеки,
 * а не нашего кода. Об этом показывается уведомление в интерфейсе.
 * -----------------------------------------------------------------------
 */

const Scanner = (() => {
  // Расширенный список форматов: изначально ограничивались QR/Code128/EAN,
  // из-за чего штрихкоды других типов (Code39, UPC-A, ITF и т.п.)
  // молча игнорировались — детектор просто не пытался их искать.
  const FORMATS = [
    "qr_code", "code_128", "code_39", "code_93", "codabar",
    "ean_13", "ean_8", "itf", "upc_a", "upc_e",
    "data_matrix", "pdf417", "aztec",
  ];
  const ZXING_FORMATS_MAP = {
    0: "AZTEC", 1: "CODABAR", 2: "CODE_39", 3: "CODE_93", 4: "CODE_128",
    5: "DATA_MATRIX", 6: "EAN_8", 7: "EAN_13", 8: "ITF", 9: "MAXICODE",
    10: "PDF_417", 11: "QR_CODE", 12: "RSS_14", 13: "RSS_EXPANDED",
    14: "UPC_A", 15: "UPC_E", 16: "UPC_EAN_EXTENSION",
  };

  let video = null;
  let canvas = null;
  let ctx = null;
  let stream = null;
  let running = false;
  let onDetectCb = null;
  let mode = null; // "native" | "zxing"
  let loopHandle = null;

  // --- ZXing (резервный режим, одна метка за раз) ---
  let zxingReader = null;
  let zxingControls = null;

  function videoPointToScreen(x, y, vw, vh) {
    const cw = video.clientWidth, ch = video.clientHeight;
    if (!vw || !vh) return { x: cw / 2, y: ch / 2 };
    const scale = Math.max(cw / vw, ch / vh);
    const displayedW = vw * scale, displayedH = vh * scale;
    const offsetX = (displayedW - cw) / 2;
    const offsetY = (displayedH - ch) / 2;
    return { x: x * scale - offsetX, y: y * scale - offsetY };
  }

  function boxCenterToScreen(cx, cy) {
    return videoPointToScreen(cx, cy, video.videoWidth, video.videoHeight);
  }

  // --- Основной цикл через нативный BarcodeDetector ---
  async function nativeLoop(detector) {
    if (!running) return;
    try {
      if (video.readyState >= 2 && video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const barcodes = await detector.detect(canvas);
        const detections = barcodes.map((b) => {
          const cx = b.boundingBox.x + b.boundingBox.width / 2;
          const cy = b.boundingBox.y + b.boundingBox.height / 2;
          return {
            markerId: b.rawValue.trim(),
            format: (b.format || "unknown").toUpperCase(),
            screenPoint: boxCenterToScreen(cx, cy),
            timestamp: Date.now(),
          };
        });
        onDetectCb(detections);
      }
    } catch (e) {
      // detect() может изредка падать на "битом" кадре — просто пропускаем его
    }
    loopHandle = setTimeout(() => nativeLoop(detector), window.APP_CONFIG.SCAN_INTERVAL_MS);
  }

  async function startNative() {
    let formats = FORMATS;
    // Конструктор BarcodeDetector падает с ошибкой, если попросить формат,
    // который браузер/устройство не поддерживает — поэтому сверяемся
    // со списком реально доступных форматов перед созданием детектора.
    if (window.BarcodeDetector.getSupportedFormats) {
      try {
        const available = await window.BarcodeDetector.getSupportedFormats();
        const intersected = FORMATS.filter((f) => available.includes(f));
        formats = intersected.length ? intersected : available;
      } catch {
        // getSupportedFormats недоступен — пробуем с полным списком как есть
      }
    }
    const detector = new window.BarcodeDetector({ formats });
    mode = "native";
    nativeLoop(detector);
  }

  // --- Резервный цикл через ZXing (одна метка за кадр) ---
  function buildZxingReader() {
    const hints = new Map();
    hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [
      ZXing.BarcodeFormat.QR_CODE,
      ZXing.BarcodeFormat.CODE_128,
      ZXing.BarcodeFormat.CODE_39,
      ZXing.BarcodeFormat.CODE_93,
      ZXing.BarcodeFormat.CODABAR,
      ZXing.BarcodeFormat.EAN_13,
      ZXing.BarcodeFormat.EAN_8,
      ZXing.BarcodeFormat.ITF,
      ZXing.BarcodeFormat.UPC_A,
      ZXing.BarcodeFormat.UPC_E,
      ZXing.BarcodeFormat.DATA_MATRIX,
      ZXing.BarcodeFormat.PDF_417,
      ZXing.BarcodeFormat.AZTEC,
    ]);
    hints.set(ZXing.DecodeHintType.TRY_HARDER, true);
    return new ZXing.BrowserMultiFormatReader(hints, window.APP_CONFIG.ZXING_SCAN_INTERVAL_MS);
  }

  async function startZxing() {
    mode = "zxing";
    zxingReader = buildZxingReader();
    zxingControls = await zxingReader.decodeFromConstraints(
      {
        audio: false,
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      },
      video,
      (result) => {
        if (!running || !result) return;
        const points = result.getResultPoints?.() || [];
        let screenPoint = { x: video.clientWidth / 2, y: video.clientHeight / 2 };
        if (points.length) {
          const cx = points.reduce((s, p) => s + p.getX(), 0) / points.length;
          const cy = points.reduce((s, p) => s + p.getY(), 0) / points.length;
          screenPoint = boxCenterToScreen(cx, cy);
        }
        const fmt = result.getBarcodeFormat ? ZXING_FORMATS_MAP[result.getBarcodeFormat()] : "UNKNOWN";
        onDetectCb([{ markerId: result.getText().trim(), format: fmt || "UNKNOWN", screenPoint, timestamp: Date.now() }]);
      }
    );
  }

  /**
   * @param {HTMLVideoElement} videoEl
   * @param {(detections: Array<{markerId:string, format:string, screenPoint:{x,y}}>) => void} onDetect
   * @returns {{ mode: "native"|"zxing" }}
   */
  async function start(videoEl, onDetect) {
    video = videoEl;
    onDetectCb = onDetect;
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d", { willReadFrequently: true });
    running = true;

    if ("BarcodeDetector" in window) {
      try {
        // Камеру в native-режиме поднимаем сами через getUserMedia,
        // т.к. BarcodeDetector не привязан к получению медиапотока.
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        video.srcObject = stream;
        await video.play();
        await startNative();
        return { mode: "native" };
      } catch (e) {
        // Если BarcodeDetector заявлен, но реально не поддерживает нужные
        // форматы (бывает на части устройств) — откатываемся на ZXing.
        stop();
        running = true;
      }
    }

    await startZxing();
    return { mode: "zxing" };
  }

  function stop() {
    running = false;
    clearTimeout(loopHandle);
    try { zxingControls?.stop(); } catch {}
    try { zxingReader?.reset(); } catch {}
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
  }

  function setPaused(paused) {
    if (!video) return;
    if (paused) video.pause();
    else video.play().catch(() => {});
  }

  function getMode() {
    return mode;
  }

  return { start, stop, setPaused, getMode };
})();

window.Scanner = Scanner;
