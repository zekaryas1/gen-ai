import { PDFDocumentProxy } from "pdfjs-dist";

const STORAGE_LIMIT = 7;

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
  return "/document.png";
};

export const saveHistory = async (pdf: PDFDocumentProxy, fileName: string) => {
  if (pdf && fileName) {
    const metadata: {
      info?: {
        Author?: string;
        Title?: string;
      };
    } = await pdf.getMetadata().catch(() => ({}));
    const { Author = "", Title = "" } = metadata.info || {};
    const title = Title || fileName;
    const thumbnail = await getPdfPageThumbnail(pdf);

    const prevFiles: LocalPrevFileType[] = getLimitedPrevFiles(STORAGE_LIMIT);
    const existingFile = prevFiles.find((file) => file.title === title);

    const updatedFile: LocalPrevFileType = existingFile
      ? { ...existingFile }
      : {
          title,
          fileName,
          author: Author,
          thumbnail,
          lastVisitedPage: 1,
        };

    const updatedFiles: LocalPrevFileType[] = [
      updatedFile,
      ...prevFiles.filter((file) => file.title !== title),
    ].slice(0, STORAGE_LIMIT);

    localStorage.setItem("prevFiles", JSON.stringify(updatedFiles));
  }
};

export const getLastVisitedPage = (fileName: string) => {
  const stored = localStorage.getItem("prevFiles");
  const parsed: LocalPrevFileType[] = stored ? JSON.parse(stored) : [];
  const history = parsed.find((it) => it.fileName == fileName);

  return history ? history.lastVisitedPage : 1;
};

export const saveLastVisitedPage = (fileName: string, pageNumber: number) => {
  if (fileName) {
    const stored = localStorage.getItem("prevFiles");
    const parsed: LocalPrevFileType[] = stored ? JSON.parse(stored) : [];

    const index = parsed.findIndex((it) => it.fileName == fileName);
    if (index != -1) {
      parsed[index].lastVisitedPage = pageNumber;
      localStorage.setItem("prevFiles", JSON.stringify(parsed));
    }
  }
};

export const getPreviousFiles = () => {
  const preFilesString = localStorage.getItem("prevFiles");
  return preFilesString ? JSON.parse(preFilesString) : [];
};
