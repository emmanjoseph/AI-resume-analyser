export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  isLoading = true;
  // Import the correct version of pdfjs
  // @ts-expect-error - pdfjs-dist/build/pdf.mjs has no types
  loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
    // Point to the worker inside node_modules (ensures version match)
    lib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.mjs",
      import.meta.url
    ).toString();

    pdfjsLib = lib;
    isLoading = false;
    return lib;
  });

  return loadPromise;
}


export async function convertPdfToImage(file: File) {
  try {
    // Ensure pdfjsLib is loaded
    const pdfjsLib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) throw new Error("Canvas context not available");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // FIX: include `canvas` in render parameters
    await page.render({
      canvasContext: context,
      viewport,
      canvas, // ✅ required
    }).promise;

    return new Promise<PdfConversionResult>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve({ imageUrl: "", file: null, error: "Blob creation failed" });
          return;
        }
        const imageFile = new File(
          [blob],
          file.name.replace(/\.pdf$/i, ".png"),
          { type: "image/png" }
        );
        resolve({ imageUrl: URL.createObjectURL(blob), file: imageFile });
      }, "image/png");
    });
  } catch (err) {
    return { imageUrl: "", file: null, error: `PDF conversion failed: ${err}` };
  }
}
