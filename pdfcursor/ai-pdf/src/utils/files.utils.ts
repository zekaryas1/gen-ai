import { PDFDocumentProxy } from "pdfjs-dist";

export interface LocalPrevFileType {
  title: string;
  fileName: string;
  author: string;
  thumbnail: string;
  lastVisitedPage: number;
}

// Helper function to clean filename (remove .pdf extension)
export const cleanFileName = (filename: string): string => {
  return filename.endsWith(".pdf") ? filename.slice(0, -4) : filename;
};

// Helper function to get and limit previous files
export const getLimitedPrevFiles = (limit: number): LocalPrevFileType[] => {
  try {
    const stored = localStorage.getItem("prevFiles");
    const parsed: LocalPrevFileType[] = stored ? JSON.parse(stored) : [];
    return parsed.slice(0, limit);
  } catch {
    return [];
  }
};

export const getPdfPageThumbnail = async (pdf: PDFDocumentProxy) => {
  if (pdf.numPages > 0) {
    const page = await pdf.getPage(1); // Get the first page
    const viewport = page.getViewport({ scale: 0.5 }); // Adjust scale for thumbnail size
    const canvas = document.createElement("canvas");
    const canvasContext = canvas.getContext("2d");

    if (canvasContext) {
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext, viewport }).promise;
      return canvas.toDataURL("image/png"); // Get thumbnail as Data URL
    }
  }
  return "";
};

export const saveHistory = async (pdf: PDFDocumentProxy, fileName: string) => {
  try {
    // Get PDF metadata with proper error handling
    const meta: {
      info?: {
        Author?: string;
        Title?: string;
      };
    } = await pdf.getMetadata().catch(() => ({}));

    const PrevFileStorageLimit = 7;

    const thumbnail = await getPdfPageThumbnail(pdf);

    const { Author = "", Title = "" } = meta.info || {};

    const title = Title || fileName;

    const prevFiles: LocalPrevFileType[] =
      getLimitedPrevFiles(PrevFileStorageLimit);

    let prevFile = prevFiles.find((it) => it.title === title);
    let updatedFiles: LocalPrevFileType[] = [];
    if (!prevFile) {
      prevFile = {
        title: title,
        fileName: fileName,
        author: Author,
        thumbnail: thumbnail,
        lastVisitedPage: 0,
      };
    }
    updatedFiles = [
      { ...prevFile },
      ...prevFiles.filter((file) => file.title !== title),
    ].slice(0, PrevFileStorageLimit); // Ensure we never exceed limit

    localStorage.setItem("prevFiles", JSON.stringify(updatedFiles));

    return prevFile;
  } catch (error) {
    console.error("Failed to save PDF history:", error);
  }
};

export const getLastVisitedPage = (fileName: string) => {
  const stored = localStorage.getItem("prevFiles");
  const parsed: LocalPrevFileType[] = stored ? JSON.parse(stored) : [];
  const history = parsed.find((it) => it.fileName == fileName);

  return history ? history.lastVisitedPage : 0;
};

export const saveLastVisitedPage = (fileName: string, pageNumber: number) => {
  const stored = localStorage.getItem("prevFiles");
  const parsed: LocalPrevFileType[] = stored ? JSON.parse(stored) : [];

  const index = parsed.findIndex((it) => it.fileName == fileName);
  if (index != -1) {
    parsed[index].lastVisitedPage = pageNumber;
    localStorage.setItem("prevFiles", JSON.stringify(parsed));
  }
};

export const getPreviousFiles = () => {
  const preFilesString = localStorage.getItem("prevFiles");
  return preFilesString ? JSON.parse(preFilesString) : [];
};
