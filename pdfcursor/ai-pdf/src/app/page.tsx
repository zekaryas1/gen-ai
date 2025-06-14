"use client";
import { useCallback, useRef, useState } from "react";
import { Document, pdfjs } from "react-pdf";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import type { PDFDocumentProxy } from "pdfjs-dist";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import OutlineRenderer, { OutlineItem } from "@/components/OutlineRenderer";
import ScrollPlaceHolder from "@/components/ScrollPlaceHolder";
import PDFPageWrapper from "@/components/PDFPageWrapper";
import { getPageIndex } from "@/utils/page.utils";
import Toolbar from "@/components/Toolbar";

// Worker setup
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function Home() {
  const [pdf, setPdf] = useState<PDFDocumentProxy>();
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const handleLoadSuccess = useCallback(async (doc: PDFDocumentProxy) => {
    setPdf(doc);
    const outlineData = await doc.getOutline();
    setOutline(outlineData || []);
  }, []);

  const scrollToPage = useCallback(
    async (item: OutlineItem) => {
      if (!pdf) return;

      const pageIndex = await getPageIndex(pdf, item);
      virtuosoRef.current?.scrollToIndex({ index: pageIndex + 1 });
    },
    [pdf],
  );

  const onItemClick = useCallback(({ pageNumber }: { pageNumber: number }) => {
    virtuosoRef.current?.scrollToIndex({ index: pageNumber + 1 });
  }, []);

  return (
    <div className="grid grid-cols-12 h-svh gap-2 bg-black">
      {/* Sidebar */}
      <aside className="col-span-2 overflow-y-scroll p-2 bg-white">
        {outline.length > 0 ? (
          <OutlineRenderer items={outline} onNavigate={scrollToPage} />
        ) : (
          <p className="text-gray-500 text-sm">No outline available</p>
        )}
      </aside>

      {/* PDF Content */}
      <main className="col-span-7 bg-black flex flex-col">
        <Toolbar
          currentPage={currentPage}
          totalPages={pdf ? pdf.numPages : 0}
        />
        <Document
          file="./sample book.pdf"
          onLoadSuccess={handleLoadSuccess}
          onItemClick={onItemClick}
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
                  setCurrentPage(pageNumber);
                  console.log("updated", ratio);
                }}
              />
            )}
          />
        </Document>
      </main>

      {/* Chat Box */}
      <aside className="col-span-3 bg-white">
        <div className="flex flex-col justify-end h-full">
          <div className="flex">
            <input
              type={"text"}
              placeholder={"your question"}
              className={"border w-full p-4"}
              height={300}
            />
            <button className={"border border-s-0 px-4"}>Send</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
