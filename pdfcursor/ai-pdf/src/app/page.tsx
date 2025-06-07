"use client";
import { useCallback, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import type { PDFDocumentProxy } from "pdfjs-dist";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Worker setup
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

// Types
interface OutlineItem {
  dest: string | object[] | null;
  title: string;
  items: OutlineItem[];
}

// Ref class (used to convert outline references)
class Ref {
  num: number;
  gen: number;

  constructor({ num, gen }: { num: number; gen: number }) {
    this.num = num;
    this.gen = gen;
  }

  toString() {
    return `${this.num}R${this.gen !== 0 ? this.gen : ""}`;
  }
}

// Scroll placeholder component
const ScrollPlaceHolder = () => (
  <div className="h-svh bg-gray-200 animate-pulse flex justify-center items-center">
    <p>Loading your page...</p>
  </div>
);

export default function Home() {
  const [pdf, setPdf] = useState<PDFDocumentProxy>();
  const [numPages, setNumPages] = useState<number>();
  const [outline, setOutline] = useState<OutlineItem[]>([]);

  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const handleLoadSuccess = useCallback(async (doc: PDFDocumentProxy) => {
    setNumPages(doc.numPages);
    setPdf(doc);

    const outlineData = await doc.getOutline();
    setOutline(outlineData || []);
  }, []);

  const getDestination = async (pdf: PDFDocumentProxy, item: OutlineItem) => {
    return typeof item.dest === "string"
      ? pdf.getDestination(item.dest)
      : item.dest;
  };

  const getPageIndex = async (pdf: PDFDocumentProxy, item: OutlineItem) => {
    const dest = await getDestination(pdf, item);
    if (!dest) throw new Error("Destination not found.");

    const [ref] = dest as [Ref];
    return pdf.getPageIndex(new Ref(ref));
  };

  const scrollToPage = async (item: OutlineItem) => {
    if (!pdf) return;

    const pageIndex = await getPageIndex(pdf, item);
    virtuosoRef.current?.scrollToIndex({ index: pageIndex + 1 });
  };

  const renderOutline = (items: OutlineItem[]) => (
    <ul className="space-y-1 pl-2 text-sm text-gray-700">
      {items.map((item, index) => (
        <li key={index}>
          <button
            onClick={() => scrollToPage(item)}
            className="hover:underline text-left cursor-pointer"
          >
            {item.title}
          </button>
          {item.items?.length > 0 && renderOutline(item.items)}
        </li>
      ))}
    </ul>
  );

  const onItemClick = useCallback(({ pageNumber }: { pageNumber: number }) => {
    virtuosoRef.current?.scrollToIndex({ index: pageNumber + 1 });
  }, []);

  return (
    <div className="grid grid-cols-12 h-svh gap-2 bg-black">
      {/* Sidebar */}
      <aside className="col-span-2 overflow-y-scroll p-2 bg-white">
        {outline.length > 0 ? (
          renderOutline(outline)
        ) : (
          <p className="text-gray-500 text-sm">No outline available</p>
        )}
      </aside>

      {/* PDF Content */}
      <main className="col-span-7 bg-black">
        <Document
          file="./sample book.pdf"
          onLoadSuccess={handleLoadSuccess}
          onItemClick={onItemClick}
          className="flex flex-col"
        >
          <Virtuoso
            ref={virtuosoRef}
            style={{ height: "100svh" }}
            totalCount={numPages}
            increaseViewportBy={1200}
            components={{ ScrollSeekPlaceholder: ScrollPlaceHolder }}
            itemContent={(index) => (
              <Page
                key={`page_${index}`}
                pageNumber={index}
                width={950}
                loading={ScrollPlaceHolder}
                className="mb-2.5"
              />
            )}
          />
        </Document>
      </main>

      {/* Chat Box */}
      <aside className="col-span-3 bg-white">
        <p>chat box</p>
      </aside>
    </div>
  );
}
