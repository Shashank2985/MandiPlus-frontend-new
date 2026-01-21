import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

let currentRenderTask: any = null;

export async function loadPdfPage(
  file: File,
  pageNumber: number,
  canvas: HTMLCanvasElement,
): Promise<{ totalPages: number } | undefined> {
  // cancel previous render
  if (currentRenderTask) {
    try {
      currentRenderTask.cancel();
    } catch {}
    currentRenderTask = null;
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageNumber);

  /* ----------------------------------------
     QUALITY SETTINGS (IMPORTANT)
  ---------------------------------------- */

  // 👇 Increase this for sharper preview
  const BASE_SCALE = 2.5; // was 1.5

  // 👇 Clamp DPR so it doesn’t explode memory
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const viewport = page.getViewport({ scale: BASE_SCALE });
  const scaledViewport = page.getViewport({
    scale: BASE_SCALE * dpr,
  });

  // Actual render resolution
  canvas.width = Math.floor(scaledViewport.width);
  canvas.height = Math.floor(scaledViewport.height);

  // Visual size
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Reset transform completely
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Apply DPR scaling
  ctx.scale(dpr, dpr);

  const renderTask = page.render({
    canvasContext: ctx,
    viewport,
    canvas,
  });

  currentRenderTask = renderTask;

  try {
    await renderTask.promise;
  } catch (err: any) {
    if (err?.name !== "RenderingCancelledException") {
      console.error(err);
    }
  } finally {
    if (currentRenderTask === renderTask) {
      currentRenderTask = null;
    }
  }

  return {
    totalPages: pdf.numPages,
  };
}
