import type { PDFDocumentProxy } from "pdfjs-dist";
import { Ref } from "@/models/Ref";
import { DraggableItemDataType, OutlineItem } from "@/models/OutlineItem";
import { useState } from "react";

export const usePDFUtil = (pdf: PDFDocumentProxy) => {
  const [visitedPages, setVisitedPages] = useState<Set<number>>(new Set());

  const clearVisitedPages = () => {
    setVisitedPages(new Set());
  };

  const getDestination = (item: OutlineItem) => {
    return typeof item.dest === "string"
      ? pdf.getDestination(item.dest)
      : item.dest;
  };

  const getPageIndex = async (item: OutlineItem) => {
    const dest = await getDestination(item);
    if (!dest) throw new Error("Destination not found.");

    const [ref] = dest as [Ref];
    return pdf.getPageIndex(new Ref(ref));
  };

  const getPageTexts = async (pageNumber: number): Promise<string[]> => {
    const currentPage = await pdf.getPage(pageNumber);
    if (currentPage) {
      const textContent = await currentPage.getTextContent();
      return textContent.items.map((item) => {
        if ("str" in item) {
          return item.str;
        }
        return "";
      });
    }
    return [];
  };

  const outlineItemsToPageConverter = async (
    items: DraggableItemDataType[],
  ) => {
    const pageRangePromises = items.map(
      async ({ currentItem, nextSiblingItem }) => {
        const start = await getPageIndex(currentItem);
        const end = nextSiblingItem
          ? await getPageIndex(nextSiblingItem)
          : pdf.numPages;
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
  };

  const getTextContext = async (pagesToScan: number[]) => {
    // Filter out visited pages
    const newPages = Array.from(pagesToScan).filter(
      (page) => !visitedPages.has(page),
    );

    setVisitedPages(new Set([...visitedPages, ...newPages]));

    // Sort numerically
    newPages.sort((a, b) => a - b);

    // Fetch and flatten page texts
    const pageTexts = await Promise.all(newPages.map(getPageTexts));

    return pageTexts.flat().join(" ");
  };

  return {
    getPageIndex,
    outlineItemsToPageConverter,
    getTextContext,
    clearVisitedPages,
  };
};
