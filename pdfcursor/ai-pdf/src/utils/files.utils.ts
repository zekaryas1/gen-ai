import { PDFDocumentProxy } from "pdfjs-dist";
import {
  PREVIOUS_FILES_STORAGE_KEY,
  PREVIOUS_FILES_STORAGE_LIMIT,
} from "@/utils/constants.utils";
import { LocalStorageFile } from "@/models/File";

class PdfUtilityManager {
  private readonly storageKey: string;
  private readonly storageLimit: number;

  constructor(storageKey: string, storageLimit: number) {
    this.storageKey = storageKey;
    this.storageLimit = storageLimit;
  }

  public cleanFileName(filename: string): string {
    return filename.endsWith(".pdf") ? filename.slice(0, -4) : filename;
  }

  public async getPdfPageThumbnail(pdf: PDFDocumentProxy): Promise<string> {
    if (pdf.numPages > 0) {
      try {
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement("canvas");
        const canvasContext = canvas.getContext("2d");

        if (canvasContext) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext, viewport }).promise;
          return canvas.toDataURL("image/png");
        }
      } catch (error) {
        console.error("Error generating PDF thumbnail:", error);
      }
    }
    return "/document.png"; // Fallback image path
  }

  public getPreviousFiles(): LocalStorageFile[] {
    try {
      const preFilesString = localStorage.getItem(this.storageKey);
      return preFilesString ? JSON.parse(preFilesString) : [];
    } catch (error) {
      console.error("Error parsing previous files from localStorage:", error);
      return [];
    }
  }

  /**
   * Saves or updates a PDF file entry in the Browse history.
   * This includes extracting metadata, generating a thumbnail, and managing the history limit.
   * If an entry with the same title exists, it's updated and moved to the front.
   * @param pdf The PDFDocumentProxy instance of the opened PDF.
   * @param fileName The original file name of the PDF.
   */
  public async saveInitialHistory(
    pdf: PDFDocumentProxy,
    fileName: string,
  ): Promise<void> {
    if (!pdf || !fileName) {
      console.warn(
        "Cannot save history: PDF document or file name is missing.",
      );
      return;
    }

    const metadata: {
      info?: {
        Author?: string;
        Title?: string;
      };
    } = await pdf.getMetadata().catch((err) => {
      console.warn("Could not retrieve PDF metadata:", err);
      return {}; // Return empty object on metadata retrieval error
    });

    const { Author = "Unknown Author", Title = "" } = metadata.info || {};
    const historyTitle = Title || this.cleanFileName(fileName);

    const prevFiles: LocalStorageFile[] = this.getPreviousFiles();
    const existingFileIndex = prevFiles.findIndex(
      (file) => file.title === historyTitle,
    );

    let updatedFile: LocalStorageFile;

    if (existingFileIndex !== -1) {
      // Update existing entry, keep its lastVisitedPage if it exists
      updatedFile = {
        ...prevFiles[existingFileIndex],
        fileName, // Ensure fileName is updated if it changed (e.g., user renamed it)
        lastOpenedDate: Date.now(),
      };
      // Remove old entry, so it can be re-added at the top
      prevFiles.splice(existingFileIndex, 1);
    } else {
      // Create new entry
      updatedFile = {
        title: historyTitle,
        fileName,
        author: Author,
        thumbnail: await this.getPdfPageThumbnail(pdf),
        lastVisitedPage: 1, // New entries start at page 1
        lastOpenedDate: Date.now(),
      };
    }

    const updatedFiles: LocalStorageFile[] = [updatedFile, ...prevFiles].slice(
      0,
      this.storageLimit,
    ); // Enforce limit

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(updatedFiles));
    } catch (error) {
      console.error("Error saving PDF history to localStorage:", error);
    }
  }

  public getLastVisitedPage(fileName: string): number {
    const prevFiles: LocalStorageFile[] = this.getPreviousFiles();
    const history = prevFiles.find((it) => it.fileName === fileName);
    return history ? history.lastVisitedPage : 1;
  }

  public updateLastVisitedPage(fileName: string, pageNumber: number): void {
    if (!fileName || pageNumber <= 0) {
      console.warn("Invalid file name or page number for update.");
      return;
    }

    const prevFiles: LocalStorageFile[] = this.getPreviousFiles();
    const index = prevFiles.findIndex((it) => it.fileName === fileName);

    if (index !== -1) {
      prevFiles[index].lastVisitedPage = pageNumber;
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(prevFiles));
      } catch (error) {
        console.error(
          "Error updating last visited page in localStorage:",
          error,
        );
      }
    } else {
      console.warn(
        `File '${fileName}' not found in history to update last visited page.`,
      );
    }
  }
}

export const pdfUtilityManager = new PdfUtilityManager(
  PREVIOUS_FILES_STORAGE_KEY,
  PREVIOUS_FILES_STORAGE_LIMIT,
);
