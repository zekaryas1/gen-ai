"use client";
import { useCallback, useRef, useState } from "react";
import { Document, pdfjs } from "react-pdf";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import type { PDFDocumentProxy } from "pdfjs-dist";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import OutlineRenderer from "@/components/OutlineRenderer";
import ScrollPlaceHolder from "@/components/ScrollPlaceHolder";
import PDFPageWrapper from "@/components/PDFPageWrapper";
import { getPageIndex } from "@/utils/page.utils";
import Toolbar from "@/components/Toolbar";
import { OutlineItem } from "@/models/OutlineItem";
import ChatInterface from "@/components/ChatInterface";

// Worker setup
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const visitedPages = new Set<number>();

export default function Home() {
  const [pdf, setPdf] = useState<PDFDocumentProxy>();
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(0);

  const handleLoadSuccess = useCallback(async (doc: PDFDocumentProxy) => {
    setPdf(doc);
    const outlineData = await doc.getOutline();
    setOutline(outlineData || []);
  }, []);

  const outlineScrollToPage = useCallback(
    async (item: OutlineItem) => {
      if (!pdf) return;

      const pageIndex = await getPageIndex(pdf, item);
      virtuosoRef.current?.scrollToIndex({ index: pageIndex });
    },
    [pdf],
  );

  const onTableOfContentItemClick = useCallback(
    ({ pageNumber }: { pageNumber: number }) => {
      virtuosoRef.current?.scrollToIndex({ index: pageNumber });
    },
    [],
  );

  const getCurrentPageTextContent = async () => {
    if (visitedPages.has(currentPageNumber)) {
      return "";
    }

    const currentPage = await pdf?.getPage(currentPageNumber);
    if (currentPage) {
      const textContent = await currentPage.getTextContent();
      visitedPages.add(currentPageNumber);

      return textContent.items
        .map((item) => {
          if ("str" in item) {
            return item.str;
          }
        })
        .join(" ");
    }
    return "";
  };

  return (
    <div className="grid grid-cols-12 h-svh gap-2 bg-black">
      {/* Sidebar */}
      <aside className="col-span-2 overflow-y-scroll p-2 bg-white">
        {outline.length > 0 ? (
          <OutlineRenderer items={outline} onNavigate={outlineScrollToPage} />
        ) : (
          <p className="text-gray-500 text-sm">No outline available</p>
        )}
      </aside>

      {/* PDF Content */}
      <main className="col-span-7 bg-black flex flex-col">
        <Toolbar
          pageNumber={currentPageNumber}
          totalPages={pdf ? pdf.numPages : 0}
        />
        <Document
          file="./sample book.pdf"
          onLoadSuccess={handleLoadSuccess}
          onItemClick={onTableOfContentItemClick}
          className="flex flex-1 flex-col relative"
          loading={ScrollPlaceHolder}
        >
          <Virtuoso
            ref={virtuosoRef}
            style={{ height: "95svh" }}
            totalCount={pdf?.numPages}
            overscan={10}
            id={"pdf-container"}
            components={{
              ScrollSeekPlaceholder: ScrollPlaceHolder,
            }}
            itemContent={(index) => (
              <PDFPageWrapper
                pageNumber={index + 1}
                pageChangeListener={(pageNumber, ratio) => {
                  setCurrentPageNumber(pageNumber);
                  console.log("updated", ratio);
                }}
              />
            )}
          />
        </Document>
      </main>

      {/* Chat Box */}
      <aside className="col-span-3 bg-white overflow-hidden">
        <ChatInterface
          getCurrentPageTextContent={getCurrentPageTextContent}
          clearVisited={() => {
            visitedPages.clear();
          }}
        />
      </aside>
    </div>
  );
}
