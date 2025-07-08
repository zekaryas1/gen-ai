import type { PDFDocumentProxy } from "pdfjs-dist";
import { Ref } from "@/models/Ref";
import { DraggableOutlineItemData, OutlineItem } from "@/models/OutlineItem";

export class PagesUtilityManager {
  private pdf: PDFDocumentProxy;
  private readonly visitedPages: Set<number>;

  constructor(pdfDocument: PDFDocumentProxy) {
    this.pdf = pdfDocument;
    this.visitedPages = new Set<number>();
  }

  public clearVisitedPages(): void {
    this.visitedPages.clear();
  }

  /**
   * Retrieves the destination object for a given outline item.
   * @param item The outline item.
   * @returns A Promise resolving to the destination object.
   */
  private async getDestination(item: OutlineItem) {
    return typeof item.dest === "string"
      ? this.pdf.getDestination(item.dest)
      : item.dest;
  }

  public async getOutlineItemPageNumber(item: OutlineItem) {
    const dest = await this.getDestination(item);
    if (!dest) throw new Error("Destination not found.");

    const [ref] = dest as [Ref];
    return this.pdf.getPageIndex(new Ref(ref));
  }

  /**
   * Extracts text content from a specific page.
   * @param pageNumber The page number.
   * @returns A Promise resolving to an array of text strings from the page.
   */
  private async getPageTexts(pageNumber: number): Promise<string[]> {
    try {
      const currentPage = await this.pdf.getPage(pageNumber);
      const textContent = await currentPage.getTextContent();
      return textContent.items.map((item) => {
        if ("str" in item) {
          return item.str;
        }
        return "";
      });
    } catch (error) {
      console.error(`Error getting text for page ${pageNumber}:`, error);
      return [];
    }
  }

  /**
   * Converts a list of draggable outline items into a set of unique page numbers to scan.
   * @param items An array of DraggableOutlineItemData.
   * @returns A Promise resolving to a Set of page numbers.
   */
  public async outlineItemsToPageConverter(
    items: DraggableOutlineItemData[],
  ): Promise<Set<number>> {
    const pageRangePromises = items.map(
      async ({ currentItem, nextSiblingItem }) => {
        const start = (await this.getOutlineItemPageNumber(currentItem)) + 1;
        const end = nextSiblingItem
          ? await this.getOutlineItemPageNumber(nextSiblingItem)
          : this.pdf.numPages;
        return [start, end];
      },
    );

    // Resolve all ranges in parallel
    const pageRanges = await Promise.all(pageRangePromises);

    // Use a Set to store all unique pages to visit
    const pagesToFetch = new Set<number>();

    for (const [start, end] of pageRanges) {
      for (let i = start; i <= end; i++) {
        pagesToFetch.add(i);
      }
    }

    return pagesToFetch;
  }

  /**
   * Fetches and concatenates text content from a list of pages, avoiding previously visited pages.
   * Marks new pages as visited.
   * @param pagesToScan An array of page numbers to scan.
   * @returns A Promise resolving to a single string containing concatenated text.
   */
  public async getTextContext(pagesToScan: number[]): Promise<string> {
    const newPages = Array.from(pagesToScan).filter(
      (page) => !this.visitedPages.has(page),
    );

    newPages.forEach((page) => {
      this.visitedPages.add(page);
    });

    newPages.sort((a, b) => a - b);

    const pageTexts = await Promise.all(
      newPages.map(this.getPageTexts.bind(this)),
    );

    return pageTexts.flat().join(" ");
  }
}
